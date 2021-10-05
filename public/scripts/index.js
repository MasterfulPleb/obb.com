'use strict';

// finishes setting up the page
document.addEventListener('DOMContentLoaded', () => {
    // checks cookies and sets darkmode/view accordingly
    if (!checkCookie('darkmode', true)) changeMode(false);
    document.getElementById('darkmode').addEventListener('change', () => {
        if (document.getElementById('darkmode').checked) changeMode(true);
        else changeMode(false);
    });

    // beecloud image size based on viewport
    resizeBeeCloud();
    window.onresize = () => resizeBeeCloud();

    // custom colors
    document.getElementById('Moose_Hole').children[2].innerHTML = '<span>4</span><span>2</span><span>0</span>';
    document.getElementById('yer--mum').children[2].innerHTML = '2<span>69</span>';
    document.getElementById('ddodd69').children[2].innerHTML = '2<span>69</span>';
    document.getElementById('motobrowniano').children[2].innerHTML = '<span>9</span><span>4</span><span>1</span><span>2</span>';
    document.getElementById('THROWAWAYBlTCH').children[0].innerHTML = '<span>10.</span>';
    document.getElementById('THROWAWAYBlTCH').children[1].innerHTML = '<span>THROWAWAYBlTCH</span>';

    // listeners & stuff for navigation menu
    const view = getCookie('view');
    if (view == '') {
        if (window.visualViewport.width < 900) {
            changeView('leaderboard');
        }
    } else changeView(view, false);
    const navItems = document.getElementById('nav-items-wrap');
    document.getElementById('menu-btn').addEventListener('click', () => {
        if (navItems.className == 'show') navItems.className = 'hide';
        else navItems.className = 'show';
    });
    document.getElementById('nav-leaderboard').addEventListener('click', () => changeView('leaderboard'));
    document.getElementById('nav-progress').addEventListener('click', () => changeView('progress'));
    document.getElementById('nav-stats').addEventListener('click', () => changeView('stats'));
    document.getElementById('nav-dashboard').addEventListener('click', () => changeView('dash'));
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


function changeView(view, setCook = true) {
    document.getElementById('nav-items-wrap').className = 'hide';
    if (setCook) setCookie('view', view, 365);
    const body = document.getElementById('body'),
        content = document.getElementById('content'),
        data = document.getElementById('data'),
        leaderboard = document.getElementById('leaderboard'),
        liveProgress = document.getElementById('live-progress'),
        stats = document.getElementById('stats'),
        textWall = document.getElementById('text-wall'),
        wah = document.getElementById('we-are-here'),
        percent = document.getElementById('percent'),
        percent24 = document.getElementById('percent24');
    if (view == 'leaderboard') {
        leaderboard.style.marginRight = '0';
        data.className = liveProgress.className =
            stats.className = textWall.className = 'hide';
        content.className = 'dash';
        content.style.justifyContent = 'center';
        leaderboard.style.maxWidth = '30em';
        leaderboard.className = 'show';
    } else if (view == 'progress') {
        content.className = 'single';
        leaderboard.className = stats.className = 'hide';
        textWall.className = data.className = liveProgress.className = 'show';
        wah.style.display = percent.style.display = percent24.style.display = 'block';
    } else if (view == 'stats') {
        content.className = 'single';
        leaderboard.className = textWall.className =
            liveProgress.className = 'hide';
        data.className = stats.className = 'show';
    } else if (view == 'dash') {
        leaderboard.style.marginRight = '';
        body.style.fontSize = '';
        content.className = 'dash';
        content.style.justifyContent = 'normal';
        leaderboard.style.maxWidth = '20em';
        leaderboard.className = data.className = liveProgress.className =
            stats.className = textWall.className = 'show';
        wah.style.display = percent.style.display = percent24.style.display = 'none';
    }
}
function changeMode(darkmode = true, setCook = true) {
    if (setCook) setCookie('darkmode', darkmode, 365);
    if (!darkmode) {
        document.getElementById('body').style.backgroundColor = 'antiquewhite';
        document.getElementById('body').style.color = 'revert';
        let rows = document.getElementById('leaderboard').children;
        for (let i = 0; i < rows.length; i++) {
            if (i % 2 != 0) {
                if (rows[i].id != 'Mclovin11859') rows[i].style.backgroundColor = 'rgb(230, 230, 230)';
            }
        }
    } else {
        document.getElementById('body').style.backgroundColor = '';
        document.getElementById('body').style.color = '';
        let rows = document.getElementById('leaderboard').children;
        for (let i = 0; i < rows.length; i++) {
            if (i % 2 != 0) {
                rows[i].style.backgroundColor = '';
            }
        }
    }
}
function resizeBeeCloud() {
    const cloud = document.getElementById('bee-cloud');
    if (window.visualViewport.width < 900) {
        cloud.src = '/public/images/smolestbeecloud.png';
    } else if (window.visualViewport.width < 1920) {
        cloud.src = '/public/images/smolbeecloud.png';
    } else {
        cloud.src = '/public/images/beecloud.png';
    }
}