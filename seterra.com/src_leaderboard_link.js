// ==UserScript==
// @name         Seterra to Speedrun.com
// @version      1.2
// @namespace    https://github.com/JulienCoutault/TamperMonkey
// @description  I'm too lazy to search the leaderbord on speedrun.com
// @author       Programmateur01
// @match        https://online.seterra.com/en/vgp/*
// @updateURL    https://raw.githubusercontent.com/JulienCoutault/TamperMonkey/master/seterra.com/src_leaderboard_link.js
// @downloadURL  https://raw.githubusercontent.com/JulienCoutault/TamperMonkey/master/seterra.com/src_leaderboard_link.js
// ==/UserScript==

(function() {
    function __searchInLevels(mapName) {
        return $.ajax({
            url: 'https://www.speedrun.com/api/v1/games/k6q4rqzd/levels',
            method: 'GET',
            async: true,
            success: function(response, status, xhr) {
                response.data.forEach(function (level) {
                    if (level.name.replace(/([^\x00-\x7F]\s)/g, "") === mapName) {
                        srcUrl = level.weblink;
                    }
                });
            },
        });
    }
    
    function __searchInCategories(mapName) {
        return $.ajax({
            url: 'https://www.speedrun.com/api/v1/games/k6q4rqzd/categories',
            method: 'GET',
            async: true,
            success: function(response, status, xhr) {
                response.data.forEach(function (category) {
                    if (category.name === mapName) {
                        srcUrl = category.weblink;
                    }
                });
            },
        });
    }
    
    let mapName = $('#lblTitleLeft').html();
    
    $.when(__searchInLevels(mapName), __searchInCategories(mapName)).done(function() {
        let leaderboardLink = '<div style="font-size: 12px; margin-top: 15px; text-align: center; background-color: #0F7A4D; border-radius: 20px; padding: 15px; padding-top: 15px; padding-bottom: 20px; border: solid 1px #cccccc; width: 160px;">' +
                '<a href="' + srcUrl + '" target="_blank" style="color: white"><center><img src="https://www.speedrun.com/images/trophy.png" style="width:60px;"></center><br>' + mapName + ' Leaderboard</a>' +
            '</div>';
        $('#rtcol').append(leaderboardLink);
    });
})();






