// aur-page test for different page types

(function() {
  var regs = AUR.register("aur-page");
  var url  = document.location.toString();
  
  regs.interface = {
    isHome:    /^https?:\/\/(www\.)?animeultima.io\/?(#[^]+)?$/.test(url),
    isEpisode: /^https?:\/\/(www\.)?animeultima.io\/[^]+-episode-[\d\.]+(?:-english-[sd]ubbed(?:-video-mirror-\d+-[^]+)?)?\/?(#[^]+)?$/.test(url),
    isChannel: /^https?:\/\/(www\.)?animeultima.io\/(?:watch\/[^]+-english-subbed-dubbed-online)\/?(#[^]+)?$/.test(url)
  };
})();