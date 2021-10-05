'use strict';

const baseURL = new URL(window.location.href).origin;
var darkmode,
    lastChart,
    chart;

document.addEventListener('DOMContentLoaded', function() {
    // checks cookies and sets darkmode/view accordingly
    darkmode = checkCookie('darkmode', true);
    if (!darkmode) changeMode(false);
    document.getElementById('darkmode').addEventListener('change', () => {
        if (document.getElementById('darkmode').checked) changeMode(true);
        else changeMode(false);
        if (!darkmode) {
            lastChart.chart.backgroundColor = '#faebd7';
            if (lastChart.chart.type == 'heatmap') lastChart.colorAxis[0].stops[0][1] = '#faebd7';
        } else {
            lastChart.chart.backgroundColor = '#282828';
            if (lastChart.chart.type == 'heatmap') lastChart.colorAxis[0].stops[0][1] = '#282828';
        }
        chart = Highcharts.chart('chart', lastChart);
    });

    // listeners & stuff for navigation menu
    const navItems = document.getElementById('nav-items-wrap');
    document.getElementById('menu-btn').addEventListener('click', () => {
        if (navItems.className == 'show') navItems.className = 'hide';
        else navItems.className = 'show';
    });
    document.getElementById('nav-comments-user').addEventListener('click', () => hashDirect('#commentsPie'));
    document.getElementById('nav-comments-day').addEventListener('click', () => hashDirect('#commentsHeat'));
    document.getElementById('nav-letters-used').addEventListener('click', () => hashDirect('#lettersColumn'));

    // checks URL hash to see if certain chart requested
    hashDirect();
    window.onhashchange = () => hashDirect();
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

//fetches proper chart based on hash and performs modifications
function hashDirect(newHash = '') {
    var hash;
    if (newHash == '') hash = new URL(window.location.href).hash;
    else {
        window.history.pushState({}, '', newHash);
        hash = newHash;
    }
    if (hash == '') {
        hashDirect('#commentsPie')
    } else if (hash == '#commentsHeat') {
        fetchChart('commentsHeat', (data) => {
            if (!darkmode) data.colorAxis[0].stops[0][1] = '#faebd7';
            data.chart.events = {
                drilldown: function (e) {
                    var chart = this;
                    chart.yAxis[0].update({
                        title: { text: 'Hours' },
                        type: 'linear',
                        categories: false
                    });
                    chart.xAxis[0].update({
                        title: { text: 'Minutes' },
                        type: 'linear',
                        categories: false
                    });
                },
                drillup: function (e) {
                    var chart = this;
                    chart.yAxis[0].update({
                        title: 'Days',
                        type: 'category',
                        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    });
                    chart.xAxis[0].update({
                        title: 'Weeks',
                        type: 'category',
                        categories: ['7/4','7/11','7/18','7/25','8/1','8/8','8/15','8/22','8/29','9/5','9/12','9/19','9/26']
                    });
                }
            };
        });
    } else {
        fetchChart(hash.slice(1));
    }
}
function fetchChart(/**@type {String}*/chartid, mods = () => {}) {
    fetch(baseURL + '/charts/' + chartid)
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (!darkmode) data.chart.backgroundColor = '#faebd7';
        mods(data);
        lastChart = data;
        chart = Highcharts.chart('chart', data);
      });
}