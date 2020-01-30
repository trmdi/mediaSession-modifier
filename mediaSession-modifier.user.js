// ==UserScript==
// @name        mediaSession-modifier
// @version     2019.12.25.02
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
                    let e = document.querySelector(".z-player-info-detail .z-song-name a");
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
                pause: function() {
                    if (!document.querySelector("audio").paused) {
                        document.querySelector(".z-btn-play").click();
                    }
                },
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
        },
        "soundcloud.com": {
            song: {
                get title() {
                    let e = document.querySelector(".playbackSoundBadge__titleLink");
                    return e? e.getAttribute("title") : null;
                },
                get artist() {
                    let e = document.querySelector(".playbackSoundBadge__lightLink");
                    return e? e.getAttribute("title") : null;
                },
                get album() {
                    return "SoundCloud";
                },
                get artwork() {
                    let e = document.querySelector(".playControls__soundBadge [style*=background-image]");
                    return e? e.getAttribute("style").match(/http.*(?=\")/)[0].replace(/-t\d+x\d+\./, "-original.") : null;
                }
            },
            action: {
                play: function() { document.querySelector("button.playControls__play").click(); },
                previoustrack: function() { document.querySelector("button.playControls__prev").click(); },
                nexttrack: function() { document.querySelector("button.playControls__next").click(); },
            },
            updateAgain: function(mutationsList) {
                // otherwise, it won't work properly for the first song played
                mutationsList.forEach(function(mutation) {
                    if (this.updateAgainEnabled && mutation.target === document.querySelector(".playbackTimeline__timePassed")) {
                        this.updateAgainEnabled = false;
                        console.log("update again...");
                        updateMediaSession();
                    }
                }, this);
            }
        },
        "www.youtube.com": {
            song: {
                get title() {
                    return navigator.mediaSession.metadata? navigator.mediaSession.metadata.title : null;
                },
                get artist() {
                    return navigator.mediaSession.metadata? navigator.mediaSession.metadata.artist : null;
                },
                get album() {
                    return navigator.mediaSession.metadata? "YouTube" : null;
                },
                get artwork() {
                    return navigator.mediaSession.metadata? navigator.mediaSession.metadata.artwork[0].src.replace(/\/([^\/]*?default)(\.jpg)/, "/maxresdefault$2") : null;
                }
            },
            action: {
                play: function() { document.querySelector(".ytp-play-button").click(); },
                previoustrack: function() { history.go(-1); },
                nexttrack: function() { document.querySelector(".ytp-next-button").click(); },
            },
            updateAgain: function(mutationsList) {
                mutationsList.forEach(function(mutation) {
                    if (this.updateAgainEnabled && mutation.target === document.querySelector(".ytp-time-current")) {
                        this.updateAgainEnabled = false;
                        updateMediaSession();
                    }
                }, this);
            }
        },
        //
        // data end
        //
    };
    return websites[w];
})(window.location.hostname);

if (!data) return;

if (window.MediaMetadata === undefined) {
    alert("Please enable \"Enhanced Media Controls\" in the Plasma Integration extension's Preferences to allow the script to work.");
    return;
}

const mediaMetadata = { title: null, artist: null, album: null, artwork: [{src: null}] };

const updateMediaSession = function() {
    navigator.mediaSession.metadata = new window.MediaMetadata(mediaMetadata);
    Object.keys(data.action).forEach(function(i) {
        navigator.mediaSession.setActionHandler(i, data.action[i]);
    });
    console.log("mediaSession is updated", mediaMetadata);
}

const callback = function(mutationsList, observer) {
    if (mediaMetadata.title === data.song.title && mediaMetadata.artist === data.song.artist
        && mediaMetadata.album === data.song.album && mediaMetadata.artwork[0].src === data.song.artwork) {

        if (typeof data.updateAgain === "function" && data.updateAgainEnabled) {
            data.updateAgain(mutationsList);
        }
        return;
    }

    mediaMetadata.title = data.song.title;
    mediaMetadata.artist = data.song.artist;
    mediaMetadata.album = data.song.album;
    mediaMetadata.artwork = [{src: data.song.artwork}];

    updateMediaSession();
    data.updateAgainEnabled = true;
}
const songObserver = new MutationObserver(callback);
songObserver.observe(document.body, { childList: true, subtree: true });
