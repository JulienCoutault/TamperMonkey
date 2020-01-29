// ==UserScript==
// @name         Seterra Top 100
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Show Seterra Times outside of Top 5
// @author       _SS, Programmateur01
// @match        https://online.seterra.com/*/*/*
// @match        https://online.seterra.com/*/*/*?*
// @match        http://onlinebeta.seterra.com/*/*/*
// @match        http://onlinebeta.seterra.com/*/*/*?*
// @updateURL    https://raw.githubusercontent.com/JulienCoutault/TamperMonkey/master/seterra.com/top100.js
// @downloadURL  https://raw.githubusercontent.com/JulienCoutault/TamperMonkey/master/seterra.com/top100.js
// ==/UserScript==

(function() {
    function getHighScores() {
        var highScores;
        var data = {};
        data.UserID = $.cookie("memberId");
        $.ajax({
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            url: '/services/services.aspx/GetHighScores',
            data: JSON.stringify(data),
            async: false,
            success: function (response) {
                exHighScores.populateDataSource(JSON.parse(response.d));
            }
        })
    }

    function shorten(input) {
        input = input / 1000;
        input = "" + input;
        input = input.substring(0,4)
        if (input.length == 3) {
            input = input + "0";
        }
        return input;
    }

    function getRealTimeAttack(input) {
        let totalSeconds = Math.floor(input / 1000);
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        let csec = input % 1000;
        let pad = "00";
        pad = pad.toString();
        seconds = seconds.toString();
        seconds = pad.substring(0, pad.length - seconds.length) + seconds;
        let cseconds = csec.toString();
        cseconds = pad.substring(0, 3 - cseconds.length) + cseconds;

        return minutes + ":" + seconds + '.' + cseconds;
    }

    function getT(data, topT) {
        if (data.length > topT) {
            return "Top " + topT + ": " + getRealTimeAttack(data[topT - 1].GameTime);
        }
    }

    function printT(data) {
        console.log(getT(data, 1));
        console.log(getT(data, 10));
        console.log(getT(data, 25));
        console.log(getT(data, 50));
        console.log(getT(data, 100));
        console.log("Total Runs: " + data.length);
    }

    function showTop100__(data) {
        printT(data);

        let totalgametime = 0;
        for (let i = 0; i<data.length; i++) {
            totalgametime += data[i].GameTime;
        }
        let averagegametime = totalgametime / data.length;

        panTop10.after(document.createElement("p"), "Total Length: ~" + Math.round(totalgametime / 60000) +" min");
        panTop10.after(document.createElement("p"), "Average Length: " + shorten(averagegametime) + " sec");
        panTop10.after(document.createElement("p"), "Total Runs: " + data.length);

        var list = document.createElement('ul');

        var wantedTopT = [1,2,3,4,5,6,7,8,9,10,25,50,100];

        for (var i = 0; i < wantedTopT.length; i++) {
            let item = document.createElement('li');
            let time = getT(data, wantedTopT[i]);
            if (time) {
                item.appendChild(document.createTextNode(time));
                list.appendChild(item);
            }
        }

        panTop10.after(list);
        panTop10.after(document.createElement("h"), "Top Times:");
    }

    getHighScores();
    exHighScores.getHighScoreByGameID(gameID).then(function (dataItem) {
        showTop100__(dataItem)
    })
})();
