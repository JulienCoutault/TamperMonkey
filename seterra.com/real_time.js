// ==UserScript==
// @name         Seterra real time
// @version      1.2
// @namespace    https://github.com/JulienCoutault/TamperMonkey
// @description  We want the real time !
// @author       Programmateur01
// @match        https://online.seterra.com/*/*/*
// @match        https://online.seterra.com/*/*/*?*
// @match        http://onlinebeta.seterra.com/*/*/*
// @match        http://onlinebeta.seterra.com/*/*/*?*
// @updateURL    https://raw.githubusercontent.com/JulienCoutault/TamperMonkey/master/seterra.com/real_time.js
// @downloadURL  https://raw.githubusercontent.com/JulienCoutault/TamperMonkey/master/seterra.com/real_time.js
// ==/UserScript==

(function() {
    'use strict';

    function __getRealTimeAttack() {
        let totalSeconds = Math.floor(gameDuration / 1000);
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        let csec = gameDuration % 1000;
        let pad = "00";
        pad = pad.toString();
        seconds = seconds.toString();
        seconds = pad.substring(0, pad.length - seconds.length) + seconds;
        let cseconds = csec.toString();
        cseconds = pad.substring(0, 3 - cseconds.length) + cseconds;

        return minutes + ":" + seconds + '.' + cseconds;
    }


    $('#lblFinalScore2').on('DOMSubtreeModified', function() {
        if (!document.getElementById('__realTimeAttack')) {
            $('#lblFinalScore2').after('<div id="__realTimeAttack">(' + __getRealTimeAttack() + ')</div>');
        } else {
            $('#__realTimeAttack').html('(' + __getRealTimeAttack() + ')');
        }
    })

})();





