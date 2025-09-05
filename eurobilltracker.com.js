// ==UserScript==
// @name         EBT++
// @namespace    https://github.com/JulienCoutault/TamperMonkey
// @version      0.2.1
// @description  EBT pages enhancement
// @author       Programmateur01
// @match        *.eurobilltracker.com/*
// @icon         https://forum.eurobilltracker.com/ebt_forum_logo.gif
// @updateURL    https://raw.githubusercontent.com/JulienCoutault/TamperMonkey/master/eurobilltracker.com.js
// @downloadURL  https://raw.githubusercontent.com/JulienCoutault/TamperMonkey/master/eurobilltracker.com.js
// ==/UserScript==

var _lang = 'en';
var _reg_number = /[^0-9.]/g;
const translations = {
    'en': {
        'average.wanted' : 'average wanted',
        'average.fail' : 'You cannot achieve an average value of {average} € with {value} € notes.',
        'average.result' : 'You need to encode {notes} notes of {value} € to reach an average value of {average} €.',
    },
    'fr': {
        'average.wanted' : 'moyenne souhaitée',
        'average.fail' : 'Vous ne pouvez pas atteindre une valeur moyenne de {average} € avec des billets de {value} €.',
        'average.result' : 'Vous devez encoder {notes} billets de {value} € pour atteindre une valeur moyenne de {average} €.',
        'new': 'nouveaux',
        'notes': 'billets',
        'sort': 'tri',
        'time': 'temps',
    }
}

function get_text(key, params = {}) {
    let text;

    if (key in translations[_lang]) {
      text = translations[_lang][key];
    } else if (key in translations['en']) {
        // display english by default
      text = translations['en'][key];
    } else {
      text = key; // fallback: return the key itself if missing
    }
    
    // put params
    for (const [paramKey, paramValue] of Object.entries(params)) {
        text = text.replace(new RegExp(`{${paramKey}}`, "g"), paramValue);
    }

    return text;
}

function ucfirst(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

// START User Profile
function __getUserData() {
    let divs = Array.from(document.getElementsByClassName('profileItem'));
    let curr = 0; // useful if some infos are not displayed in the profile
    let user = {
        'html': {
            'profileItem': {},
        },
    };

    user.hits = parseInt(divs[curr++].innerText.split(':')[1].replace(_reg_number, ''), 10);
    user.notes = parseInt(divs[curr++].innerText.split(':')[1].replace(_reg_number, ''), 10);

    if (user.hits == 0) {
        user.hit_ratio = undefined;
        user.hit_partners = 0;
    } else if (user.hits == 1) {
        user.hit_ratio = user.notes;
    } else {
        user.hit_ratio = parseFloat(divs[curr++].innerText.trim().split(":")[2].replace(_reg_number, ''));
    }

    if (/href="\/my_hits\/\?find=user/.test(divs[curr].innerHTML)) {
        // if you have hit in common
        curr++; // skip the div
    }

    if (/href="\/profile\/\?user=\d+.*allcommon=1"/.test(divs[curr].innerHTML)) {
        // if you have hitpartener in common
        curr++; // skip the div
    }

    curr++; // skip the "creation_date" div
    curr++; // skip the "city" div
    curr++; // skip the "last_note_inserted_date" div
    if (user.hits > 0) {
        // exist only if user have hits
        curr++; // skip the "list_hit_partners" div
    }

    curr++; // skip the "rank_inter" div
    curr++; // skip the "rank_country" div
    curr++; // skip the "rank_city" div

    if (divs.length > curr) {
        // note stats displayed
        user.html.profileItem.note_value = curr;
        user.note_value = parseInt(divs[curr++].innerText.split(':')[1].replace(_reg_number, ''), 10);
        user.html.profileItem.note_value_average = curr;
        user.note_value_average = parseFloat(divs[curr++].innerText.split(':')[1].replace(_reg_number, ''));
    }

    return user;
}

function __addAverageForm(user) {
    // An nice idea from Trezay
    let divs = Array.from(document.getElementsByClassName('profileItem'));

    function createDivInput(user) {
        // Create div for input
        const div = document.createElement("div");
        div.classList.add('profileItem');

        // label
        const label = document.createElement("label");
        label.textContent = `${ucfirst(get_text('average.wanted'))} :`;
        label.setAttribute("for", "average");
        label.style = "display: inline-block; width: 140px";

        // input
        const input = document.createElement("input");
        input.name = "average";
        input.id = "input-average";
        input.value = user.note_value_average;
        input.style = "width: 50px";

        // euro
        const symbol = document.createElement("span");
        symbol.textContent = " €";

        div.appendChild(label);
        div.appendChild(input);
        div.appendChild(symbol);

        return div;
    }

    function createDivSelect() {
        // Create div for select
        const div = document.createElement("div");
        div.classList.add('profileItem');

        // label
        const label = document.createElement("label");
        label.textContent = `${ucfirst(get_text('notes'))} :`;
        label.style = `display: inline-block;width: 140px`;
        label.setAttribute("for", "note");

        // select
        const select = document.createElement("select");
        select.name = "note";
        select.id = "select-note";
        select.style = "width: 54px";

        // options
        const options = [5, 10, 20, 50, 100, 200, 500];
        options.forEach(value => {
            const option = document.createElement("option");
            option.value = value.toString();
            option.textContent = option.value;
            select.appendChild(option);
        });

        div.appendChild(label);
        div.appendChild(select);

        return div;
    }

    function createDivResult() {
        // Create div for select
        const div = document.createElement("div");
        div.id = 'average-result';
        div.classList.add('profileItem');

        return div;
    }

    const div_input = createDivInput(user);
    const div_select = createDivSelect();
    const div_result = createDivResult();

    // add divs into the page
    divs[user.html.profileItem.note_value_average].insertAdjacentElement("afterend", div_input);
    div_input.insertAdjacentElement("afterend", div_select);
    div_select.insertAdjacentElement("afterend", div_result);

    // add events
    function compute() {
        const selectedValue = parseInt(document.getElementById('select-note').value, 10);
        const selectedAverage = parseFloat(document.getElementById('input-average').value);
        let targetAverage;
        
        // special case because ebt round average to 2 decimals
        if (user.note_value_average < selectedAverage) {
            targetAverage = selectedAverage - 0.005;
        } else {
            targetAverage = selectedAverage + 0.004;
        }
        console.log(`targetAverage=${targetAverage}, selectedValue=${selectedValue}, user.notes=${user.notes}, user.note_value=${user.note_value}`);

        let targetNotes = Math.ceil((targetAverage * user.notes - user.note_value) / (selectedValue - targetAverage));

        if (targetNotes < 0) {
            document.getElementById('average-result').innerText = get_text('average.fail', {value: selectedValue, average: selectedAverage});
        } else {
            document.getElementById('average-result').innerText = get_text('average.result', {notes: targetNotes, value: selectedValue, average: selectedAverage});
        }
    }
    document.getElementById('input-average').addEventListener("input", (e) => {
        compute()
    });
    document.getElementById('select-note').addEventListener("change", (e) => {
        compute()
    });
}

function _loadProfileUser(id) {
    const user = __getUserData();
    user.id = id;
    console.log(user);

    __addAverageForm(user);
}
// END User Profile

// START Hits list
function __addSelectSort(url_params) {
    const form = document.querySelector('[name="filter"]');
    function createSelectDiv(url_params) {
        // 
        const td = document.createElement("td");
        td.classList.add('top')

        // label
        const label = document.createElement("label");
        label.textContent = `${ucfirst(get_text('sort'))} `;
        label.setAttribute("for", "hitsort");

        // select
        const select = document.createElement("select");
        select.name = "hitsort";
        select.id = "hitsort-select";
        select.onchange = () => form.submit();

        

        // options
        [
            ['',  ucfirst(get_text('new'))],
            ['days', ucfirst(get_text('time'))],
            ['km', ucfirst(get_text('distance'))],
        ].forEach(value => {
            const option = document.createElement("option");
            option.value = value[0];
            option.textContent = value[1];
            select.appendChild(option);
        });

        // set selected value
        if (select.name in url_params) {
            select.value = url_params[select.name];
        }

        td.appendChild(label);
        td.appendChild(select);

        return td;
    }

    const div = createSelectDiv(url_params);
    const lastTd = form.querySelector('td:last-of-type');
    lastTd.parentNode.insertBefore(div, lastTd.nextSibling);
    // lastTd.insertAfter(div);
}

function _loadHitsList(url_params) {
    __addSelectSort(url_params);
}
// END Hits list

(function() {
    const url = new URL(window.location);
    const url_params = Object.fromEntries(url.searchParams.entries());
    _lang = url.host.split('.')[0];

    switch (url.pathname) {
        case '/profile/':
                if ('user' in url_params) {
                    _loadProfileUser(url_params.user)
                }
            break;
        case '/my_hits/': // profile hits
        case '/hits/':    // general hits
            _loadHitsList(url_params)
            break;
    }
})();
