'use strict';

let darkmode;
let lastChart;
document.addEventListener('DOMContentLoaded', function() {
    // checks cookies and sets darkmode/view accordingly
    darkmode = checkCookie('darkmode', true);
    if (!darkmode) changeMode(false);
    document.getElementById('darkmode').addEventListener('change', () => {
        if (document.getElementById('darkmode').checked) changeMode(true);
        else changeMode(false);
        if (!darkmode) lastChart.chart.backgroundColor = '#faebd7';
        else lastChart.chart.backgroundColor = '#282828';
        const chart = Highcharts.chart('chart', lastChart);
    });

    // listeners & stuff for navigation menu
    let navItems = document.getElementById('nav-items-wrap');
    document.getElementById('menu-btn').addEventListener('click', () => {
        if (navItems.className == 'show') navItems.className = 'hide';
        else navItems.className = 'show';
    });
    document.getElementById('nav-comments-user').addEventListener('click', () => {
        fetch('https://test.ouijabeederboard.com/charts/commentsPie')
          .then(res => res.json())
          .then(data => {
            console.log(data);
            if (!darkmode) data.chart.backgroundColor = '#faebd7';
            lastChart = data;
            const chart = Highcharts.chart('chart', data);
          });
    })
    document.getElementById('nav-comments-day').addEventListener('click', () => {
        fetch('https://test.ouijabeederboard.com/charts/commentsHeat')
          .then(res => res.json())
          .then(data => {
            console.log(data);
            if (!darkmode) data.chart.backgroundColor = '#faebd7';
            lastChart = data;
            const chart = Highcharts.chart('chart', data);
          });
    })

    fetch('https://test.ouijabeederboard.com/charts/commentsPie')
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (!darkmode) data.chart.backgroundColor = '#faebd7';
        lastChart = data;
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


function changeMode(dark = true, setCook = true) {
    if (setCook) setCookie('darkmode', dark, 365);
    if (!dark) {
        darkmode = false;
        document.getElementById('body').style.backgroundColor = 'antiquewhite';
        document.getElementById('body').style.color = 'revert';
    } else {
        darkmode = true;
        document.getElementById('body').style.backgroundColor = '';
        document.getElementById('body').style.color = '';
    }
}