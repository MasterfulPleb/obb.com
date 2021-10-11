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
    document.getElementById('nav-timeline').addEventListener('click', () => hashDirect('#timeline'));
    document.getElementById('nav-replies-dependency').addEventListener('click', () => hashDirect('#repliesDependency'));

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

// changes darkmode on/off - defaults to on - sets cookie
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
        getChart('commentsHeat', (chartData) => {
            if (!darkmode) chartData.colorAxis[0].stops[0][1] = '#faebd7';
            chartData.chart.events = {
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
    } else if (hash == '#timeline') {
        getChart('timeline', (chartData) => {
            chartData.series.push({
                type: 'flags',
                name: 'Events',
                onSeries: 'completion',
                color: '#333333',
                fillColor: 'rgba(255,255,255,0.8)',
                showInLegend: false,
                data: [{
                    x: 1628913600000,
                    title: 'Chat started',
                    text: 'u/motobrowniano opened a chat on reddit for people still contributing'
                }, {
                    x: 1629777600000,
                    title: 'Help found',
                    text: 'u/motobrowniano made a post on r/bee_irl that got a few more people to join the cause'
                }, {
                    x: 1630382400000,
                    title: 'Leaderboard',
                    text: 'u/Digital_Sparrow posts the first leaderboard'
                }, {
                    x: 1631246400000,
                    title: 'Website',
                    text: 'u/Krosis creates the first version of this website, containing only a leaderboard'
                }, {
                    x: 1631592000000,
                    title: 'Leaderboard',
                    text: 'u/Digital_Sparrow makes his final leaderboard post'
                }, {
                    x: 1631592000000,
                    title: 'Website',
                    text: "Website adds a 'live progress' section to show progress/position in the script"
                }, {
                    x: 1632110400000,
                    title: 'Website',
                    text: "Website adds live updating to 'live progress' section for even quicker commenting"
                }, {
                    x: 1632196800000,
                    title: 'Charts',
                    text: 'First chart is made, a pie chart showing comments per user'
                }]
            })
        })
    } else {
        getChart(hash.slice(1));
    }
}
function getChart(/**@type {String}*/chartid, mods = () => {}) {
    fetch(baseURL + '/charts/' + chartid)
      .then(res => res.json())
      .then(chartData => {
        console.log(chartData);
        if (!darkmode) chartData.chart.backgroundColor = '#faebd7';
        mods(chartData);
        lastChart = chartData;
        chart = Highcharts.chart('chart', chartData);
      });
}