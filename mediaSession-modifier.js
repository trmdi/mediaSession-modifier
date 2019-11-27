// ==UserScript==
// @name        mediaSession-modifier
// @version     2019.11.27.01
// @author      trmdi
// @namespace   trmdi
// @include      *
// @grant       none
// @description Modify the mediaSession value of websites
// ==/UserScript==

const data = (function(w) {
    const websites = {
        //
        // Add data for websites here
        //
        "zingmp3.vn": {
            song: {
                get title() {
                    let e = document.querySelector(".z-player-info-detail .z-song-name");
                    return e? e.innerText : null;
                },
                get artist() {
                    let e = document.querySelector(".z-player-info-detail .z-artists");
                    return e? e.innerText.replace(/[ -]*/,"") : null;
                },
                get album() {
                    return "ZingMP3";
                },
                get artwork() {
                    let e = document.querySelector(".z-player-info-detail .thumb-40 img");
                    return e? e.src.replace(/w\d+/,"w1366") : null;
                }
            },
            action: {
                play: function() { document.querySelector(".z-btn-play").click(); },
                previoustrack: function() { document.querySelector(".z-btn-previous").click(); },
                nexttrack: function() { document.querySelector(".z-btn-next").click(); },
            }
        },
        "open.spotify.com": {
            song: {
                get title() {
                    let e = document.querySelector(".track-info__name");
                    return e? e.innerText : null;
                },
                get artist() {
                    let e = document.querySelector(".track-info__artists");
                    return e? e.innerText : null;
                },
                get album() {
                    return "Spotify";
                },
                get artwork() {
                    let e = document.querySelector(".now-playing__cover-art .cover-art-image[style*=http]");
                    return e? e.getAttribute("style").match(/http.*(?=\")/)[0] : null;
                }
            },
            action: {
                play: function() { document.querySelector(".control-button[class*=spoticon-play], .control-button[class*=spoticon-pause]").click(); },
                previoustrack: function() { document.querySelector(".control-button[class*=spoticon-skip-back]").click(); },
                nexttrack: function() { document.querySelector(".control-button[class*=spoticon-skip-forward]").click(); },
            }
        }
        //
        // data end
        //
    };
    return websites[w];
})(window.location.hostname);

if (!data) return;

const mediaMetadata = new MediaMetadata();
mediaMetadata.artwork = [{src: null}];

const callback = function() {
    if (mediaMetadata.title !== data.song.title || mediaMetadata.artist !== data.song.artist
        || mediaMetadata.album !== data.song.album || mediaMetadata.artwork[0].src !== data.song.artwork) {

        mediaMetadata.title = data.song.title;
        mediaMetadata.artist = data.song.artist;
        mediaMetadata.album = data.song.album;
        mediaMetadata.artwork = [{src: data.song.artwork}];
        //console.log("Playing: ", mediaMetadata);

        navigator.mediaSession.metadata = mediaMetadata;
        Object.keys(data.action).forEach(function(i) {
            navigator.mediaSession.setActionHandler(i, data.action[i]);
        });
    }
}
const songObserver = new MutationObserver(callback);
songObserver.observe(document.body, { childList: true, subtree: true });
