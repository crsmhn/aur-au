//AUR comment fixes module, first date: 2016-17-2
//TODO
// change function/class names to better ones
// more readable code
// expect bugs
// add the clean function
// check for possible missing elements


AUR_NAME = "Comment Fixes";
AUR_DESC = "Fixes the broken comment function";
AUR_VERSION = 0.9;
AUR_AUTHORS = ["Samu"];
AUR_RESTART = true; // If true AUR will say that it needs to restart for the module to take effect

// var reg   = AUR.register("comment-fixes");
// if(!reg) // Functions won't be called if a module is disabled, as in it won't ever see the light of day.
//   return;

var page  = AUR.import("aur-page");
var aurdb = AUR.import("aur-db");
var details = AUR.import("aur-details");
var aj = AUR.import("ajaxify");


reg.addEvent("vote");

aj.onEvent("filter", /[^]+-episode-[\d\.]+(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?(?:\/+)?(#[^]*)?$/, function(e) {
  (new reg.interface()).mend(e.dom.jSh("#comment-container"));
});


reg.interface = function(){
  var that = this; // I had to make this to use saveVote() from rate()

  this.mend = function(comments){

    
    if(!comments instanceof Element || comments.classList.contains("aurMended"))
      return;
    
    //run once
    comments.classList.add("aurMended");
   
    //Without AUR, au would hide the comment ratings for comments you have rated
    this.showHiddenRatings(comments);

    comments.onclick = this.waitForClicks;

  };

  this.showHiddenRatings = function(comments){

    var indexes = [];
    var oldCommentItems = comments.jSh(".comment-item");

    for(var i = 0; i < oldCommentItems.length; i++){
      // var id = oldCommentItems[i].jSh(".like-comment")[0].rel;
      var commentIcons = oldCommentItems[i].jSh(".comment-icons > *");
      if(commentIcons.length === 1){
        indexes.push(i);
      }else if (commentIcons.length !== 1 && this.DBVotes(oldCommentItems[i].jSh(".like-comment")[0].getAttribute("rel")) !== undefined){
        indexes.push(i);
      }
    }

    if(!indexes)
      return;

    var query = {
      method: "fetchepisodecomment",
      episode_num: details.anime.episode,
      channelid: details.anime.channel
    }


    var req = new lcRequest({
      method: "GET",
      uri: "/ajax.php",
      query: query,
      cookies: false,
      success: replceOldOnes
    })


    function replceOldOnes(){

      var parser = new DOMParser();
      doc = parser.parseFromString(this.response, "text/html");

      var newCommentItems = jSh(doc).jSh(".comment-item");

      for(var i = 0; i < indexes.length; i++){
        var id = newCommentItems[indexes[i]].jSh(".like-comment")[0].rel;
        var vote = that.DBVotes(id);
        

        if(vote === true)
          var commentClass = "aur-comment-like";
        else if( vote === false )
          var commentClass = "aur-comment-dislike";
        else
          var commentClass;

        newCommentItems[indexes[i]].classList.add(commentClass);
        newCommentItems[indexes[i]].classList.add("aur-comment");

        comments.replaceChild(newCommentItems[indexes[i]], oldCommentItems[indexes[i]]);


      }

    }

    req.send();

  }

  //change name
  this.waitForClicks = function(e){
    //MY EYES - test
  
    var target = e.target;

    while (target !== this && (target.className.indexOf("like-comment") === -1 && target.className.indexOf("spam-show") === -1)) {
      target = target.parentNode;
    }

    if (target !== this){
      target = jSh(target);

      if (target.className.indexOf("spam-show") !== -1 ) {
        that.showSpam(target);
      } else if ( target.className.indexOf("like-comment") !== -1 ) {
        that.rate(target);
      }

    } else {
      return;
    }
  }


  this.showSpam = function(target){
    //test
    target.getParent(2).style.display = "none";
    jSh("." + target.rel)[0].removeAttribute("style");

  }

  
  this.rate = function(target){

    var id          = target.rel;
    var type        = target.className.replace("-", "");
    var url         = "/ajax.php";
    var query       = {method: type, commentid: id};
    var vote        = type === "likecomment" ? true : false;
    var counter     = target.jSh("span[class$='count']")[0];
    var commentItem = target.getParent(3);

    //Don't rate again if already rated before
    if(!commentItem.classList.contains("aur-comment")){

      if(vote === true)
        var commentClass = "aur-comment-like";
      else if( vote === false )
        var commentClass = "aur-comment-dislike";
      else
        var commentClass;

      commentItem.classList.add(commentClass);
      commentItem.classList.add("aur-comment");
      

      var req = new lcRequest({
        method: "GET",
        uri: url,
        query: query,
        form: true
      });
      
      //Update the counter
      counter.innerText = (+counter.textContent) + 1;

      that.DBVotes(id, vote);

      reg.triggerEvent("vote", {
        like: vote,
        commentId: id,
        commentElement: commentItem
      });

      req.send();
    }

  }

  this.DBVotes = function(id, vote){
    //false is dislike, true is like
    var dbObj = aurdb.getDB("comment-votes");

    if(!dbObj)
      dbObj = {};

    if(dbObj[id] !== undefined && vote === undefined){
      return dbObj[id];
    }else if(vote !== undefined){
      dbObj[id] = vote;
      aurdb.setDB("comment-votes", dbObj);
    }

  }

}

// Just to self-initilize
if (page.isEpisode && details.user.name)
  (new reg.interface()).mend(jSh("#comment-container"));