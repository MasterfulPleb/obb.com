'use strict';

let fetchChart = fetch('https://test.ouijabeederboard.com/charts/commentsPie')
    .then(res => res.json())

document.addEventListener('DOMContentLoaded', function() {
    // checks cookies and sets darkmode/view accordingly
    if (!checkCookie('darkmode', true)) changeMode(false);
    document.getElementById('darkmode').addEventListener('change', () => {
        if (document.getElementById('darkmode').checked) changeMode(true);
        else changeMode(false);
    });

    // listeners & stuff for navigation menu
    let navItems = document.getElementById('nav-items-wrap');
    document.getElementById('menu-btn').addEventListener('click', () => {
        if (navItems.className == 'show') navItems.className = 'hide';
        else navItems.className = 'show';
    });


    fetchChart
      .then(data => {
        console.log(data);
        const chart = Highcharts.chart('chart', data);
      });
});


function checkCookie(name, defaultState) {
    let value = getCookie(name);
    if (value == 'true') {
        document.getElementById(name).checked = true
        return true
    } else if (value == 'false') {
        return false
    } else if (value == '') {
        setCookie(name, defaultState ? 'true' : 'false', 365);
        return defaultState
    }
}
function getCookie(cname) {
    let name = cname + '=';
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length);
        }
    }
    return '';
}
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}


function changeMode(darkmode = true, setCook = true) {
    if (setCook) setCookie('darkmode', darkmode, 365);
    if (!darkmode) {
        document.getElementById('body').style.backgroundColor = 'antiquewhite';
        document.getElementById('body').style.color = 'revert';
    } else {
        document.getElementById('body').style.backgroundColor = '';
        document.getElementById('body').style.color = '';
    }
}