// ==UserScript==
// @name         EBT user profile page enhancement
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  EBT user profile page enhancement
// @author       Programmateur01
// @match        https://*.eurobilltracker.com/profile/?user=*
// @updateURL    https://raw.githubusercontent.com/JulienCoutault/TamperMonkey/master/eurobilltracker.com/profile.js
// @downloadURL  https://raw.githubusercontent.com/JulienCoutault/TamperMonkey/master/eurobilltracker.com/profile.js
// ==/UserScript==

function __getUserData() {
    var divs = Array.from(document.getElementsByClassName('profileItem'));
    let cur = 0; // useful if some infos are not displayed in the profile
    let user = {};

    user.hits = parseInt(divs[cur++].innerText.split(':')[1].trim(), 10);
    user.notes = parseInt(divs[cur++].innerText.split(':')[1].trim(), 10);

    if (user.hits == 0) {
        user.hit_ratio = undefined;
        user.hit_partners = 0;
    } else if (user.hits == 1) {
        user.hit_ratio = user.notes;
    } else {
        user.hit_ratio = parseFloat(divs[cur++].innerText.trim().split(":")[2].trim());
    }

    cur++; // skip the "creation_date" div
    cur++; // skip the "city" div
    cur++; // skip the "last_note_inserted_date" div
    cur++; // skip the "list_hit_partners" div

    cur++; // skip the "rank_inter" div
    cur++; // skip the "rank_country" div
    cur++; // skip the "rank_city" div

    if (divs.length > cur) {
        // note stats displayed
        user.note_value = parseInt(divs[cur++].innerText.split(':')[1].replace('€', '').trim(), 10);
        user.note_value_average = parseFloat(divs[cur++].innerText.split(':')[1].replace('€', '').trim());
    }

    return user;
}

(async function() {
    console.log(__getUserData())
})();
