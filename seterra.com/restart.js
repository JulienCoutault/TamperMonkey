// ==UserScript==
// @name         Seterra Restart game
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Restart the game use F5
// @author       Programmateur01
// @match        https://online.seterra.com/*/*/*

// ==/UserScript==

(function() {
    $(document).keydown(function(e) {
        if ((e.which || e.keyCode) == 116) {
            e.preventDefault();
            setReviewMode(0);
            setGameMode();
            return false;
        }
    });
})();
