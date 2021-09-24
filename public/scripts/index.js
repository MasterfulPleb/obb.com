'use strict';

/**@type {WebSocket}*/var ws;
/**@type {NodeJS.Timeout}*/var alive;

// initializes the js
document.addEventListener('DOMContentLoaded', () => {
    // checks cookies and sets darkmode/view accordingly
    if (!checkCookie('darkmode', true)) {}// turn off dark mode
    document.getElementById('darkmode').addEventListener('change', () => {
        if (document.getElementById('darkmode').checked) {
            setCookie('darkmode', 'true', 365);
            // turn on dark mode
        } else {
            setCookie('darkmode', 'false', 365);
            // turn off dark mode
        }
    });

    // listeners & stuff for navigation menu
    let view = getCookie('view');
    if (view == '') {
        if (window.visualViewport.width < 900) {
            changeView('leaderboard');
        }
    } else changeView(view, false);
    let navItems = document.getElementById('nav-items-wrap');
    document.getElementById('menu-btn').addEventListener('click', () => {
        if (navItems.className == 'show') navItems.className = 'hide';
        else navItems.className = 'show';
    });
    document.getElementById('nav-leaderboard').addEventListener('click', () => changeView('leaderboard'));
    document.getElementById('nav-progress').addEventListener('click', () => changeView('progress'));
    document.getElementById('nav-stats').addEventListener('click', () => changeView('stats'));
    document.getElementById('nav-dashboard').addEventListener('click', () => changeView('dash'));

    // configures websocket
    tryConnection();
    document.getElementById('websocket').addEventListener('change', () => {
        if (document.getElementById('websocket').checked) {
            setCookie('websocket', 'true', 365);
            clearTimeout(alive);
            tryConnection();
        } else {
            setCookie('websocket', 'false', 365);
            ws.close();
            console.log('websocket closed');
        }
    });
});

function tryConnection(retry = true) {
    let enableSocket = checkCookie('websocket', false);
    if (!enableSocket) console.log('websocket disabled');
    else if (retry) {
        configureSocket();
        alive = setTimeout(tryConnection, 60000, false);
    } else {
        ws.close();
        console.log('websocket connection failed');
    };
}
function configureSocket() {
    if (typeof(ws) != 'undefined') ws.close()
    ws = new WebSocket('wss://test.ouijabeederboard.com/ws');
    ws.onopen = (_ev) => {
        console.log('websocket connected');
        ws.send('update');
    }
    ws.onmessage = (msg) => {
        clearTimeout(alive);
        alive = setTimeout(tryConnection, 60000);
        if (msg.data == 'ping') console.log('ping');
        else if (msg.data == 'pong') console.log('pong');
        else {
            const data = JSON.parse(msg.data);
            if (data.progress > 1) {
                console.log(data);
                updatePage(data);
            } else {
                //this is where charts will be recieved
                //probably not though lol just fetch the JSON
            }
        }
    }
}
function updatePage(data) {
    const written = document.getElementById('written');
    const remaining = document.getElementById('remaining');
    const oldLength = written.innerHTML.length;
    const newLength = data.progress;
    const diff = newLength - oldLength;
    written.innerHTML += remaining.innerHTML.slice(0, diff);
    remaining.innerHTML = remaining.innerHTML.slice(diff);
    document.getElementById('percent').innerHTML = data.percent;
    document.getElementById('percent24').innerHTML = data.percent24;
    document.getElementById('last-written').innerHTML = data.lastWritten;
    document.getElementById('first-remaining').innerHTML = data.firstRemaining;
    const leaderboard = document.getElementById('leaderboard');
    for (let update of data.leaderboard) {
        const row = document.getElementById(update.author);
        const score = update.comments;
        row.children[2].innerHTML = score;
        while (true) {
            let nextrow = row.previousElementSibling;
            if (nextrow == null) break
            let nextScore = parseInt(nextrow.children[2].innerHTML);
            if (score > nextScore) {
                let temp = row.children[0].innerHTML;
                row.children[0].innerHTML = nextrow.children[0].innerHTML;
                nextrow.children[0].innerHTML = temp;
                leaderboard.insertBefore(row, nextrow);
            } else break
        }
    }
    console.log(diff + ' new comment' + (diff == 1 ? '' : 's') + ', page updated');
}

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
    if (setCook) setCookie('view', view, 1);
    //let document.getElementById('content') = document.getElementById('content');
    //let document.getElementById('data') = document.getElementById('data');
    //let document.getElementById('leaderboard') = document.getElementById('leaderboard');
    //let document.getElementById('live-progress') = document.getElementById('live-progress');
    //let document.getElementById('stats') = document.getElementById('stats');
    //let document.getElementById('text-wall') = document.getElementById('text-wall');
    if (view == 'leaderboard') {
        document.getElementById('data').className = 'hide';
        document.getElementById('live-progress').className = 'hide';
        document.getElementById('stats').className = 'hide';
        document.getElementById('text-wall').className = 'hide';
        document.getElementById('content').className = 'dash';
        document.getElementById('content').style.justifyContent = 'center';
        document.getElementById('leaderboard').style.maxWidth = '30em';
        document.getElementById('leaderboard').className = 'show';
    } else if (view == 'progress') {
        document.getElementById('content').className = 'single';
        document.getElementById('leaderboard').className = 'hide';
        document.getElementById('stats').className = 'hide';
        document.getElementById('text-wall').className = 'hide';
        document.getElementById('content').style.justifyContent = 'normal';
        document.getElementById('leaderboard').style.maxWidth = '20em';
        document.getElementById('data').className = 'show';
        document.getElementById('live-progress').className = 'show';
    } else if (view == 'stats') {
        document.getElementById('content').className = 'single';
        document.getElementById('leaderboard').className = 'hide';
        document.getElementById('text-wall').className = 'hide';
        document.getElementById('live-progress').className = 'hide';
        document.getElementById('content').style.justifyContent = 'normal';
        document.getElementById('leaderboard').style.maxWidth = '20em';
        document.getElementById('data').className = 'show';
        document.getElementById('stats').className = 'show';
    } else if (view == 'dash') {
        document.getElementById('content').className = 'dash';
        document.getElementById('leaderboard').className = 'show';
        document.getElementById('leaderboard').style.maxWidth = '20em';
        document.getElementById('content').style.justifyContent = 'normal';
        document.getElementById('data').className = 'show';
        document.getElementById('live-progress').className = 'show';
        document.getElementById('stats').className = 'show';
        document.getElementById('text-wall').className = 'show';
    }
}