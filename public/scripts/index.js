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
    document.getElementById('menu-btn').addEventListener('click', () => {
        let navItems = document.getElementById('nav-items-wrap');
        if (navItems.className == 'show') navItems.className = 'hide';
        else if (navItems.className == 'hide') navItems.className = 'show';
    });
    changeView(getCookie('view'));

    // listeners for navigation menu
    document.getElementById('nav-leaderboard').addEventListener('click', () => {
        setCookie('view', 'leaderboard', 365);
        changeView('leaderboard');
    });
    document.getElementById('nav-progress').addEventListener('click', () => {
        setCookie('view', 'progress', 365);
        changeView('progress');
    });
    document.getElementById('nav-stats').addEventListener('click', () => {
        setCookie('view', 'stats', 365);
        changeView('stats');
    });
    document.getElementById('nav-dashboard').addEventListener('click', () => {
        setCookie('view', 'dash', 365);
        changeView('dash');
    });
    if (window.visualViewport.width < 900) changeView('leaderboard');

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
    return ''
}
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function changeView(view) {
    const data = document.getElementById('data')
    const leaderboard = document.getElementById('leaderboard')
    const liveProgress = document.getElementById('live-progress')
    const stats = document.getElementById('stats')
    const textWall = document.getElementById('text-wall')
    if (view == 'leaderboard') {
        leaderboard.className = show;
        data.className = hide;
    } else if (view == 'progress') {
        leaderboard.className = hide;
        data.className = show;
          liveProgress.className = show;
          stats.className = hide;
          textWall.className = hide;
    } else if (view == 'stats') {
        leaderboard.className = hide;
        data.className = show;
          liveProgress.className = hide;
          stats.className = show;
          textWall.className = hide;
    } else if (view == 'dash') {
        leaderboard.className = show;
        data.className = show;
          liveProgress.className = show;
          stats.className = show;
          textWall.className = show;
    }
}