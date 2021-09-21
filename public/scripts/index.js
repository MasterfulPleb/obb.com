'use strict';

let ws = new WebSocket('wss://test.ouijabeederboard.com/ws');

ws.onopen = (ev) => {
    console.log('websocket connected');
};
ws.onmessage = (msg) => {
    if (msg.data == 'ping') console.log('ping')
    else if (msg.data == 'pong') console.log('pong')
    else {
        const data = JSON.parse(msg.data);
        console.log(data);
        updatePage(data);
    }
};

function updatePage(data) {
    const written = document.getElementById('written');
    const remaining = document.getElementById('remaining');
    const oldLength = written.innerHTML.length;
    const newLength = data.progress;
    const diff = newLength - oldLength;
    console.log(diff + ' new comment' + (diff == 1 ? '' : 's') + ', updating page');
    written.innerHTML += remaining.innerHTML.slice(0, diff);
    remaining.innerHTML = remaining.innerHTML.slice(diff);
    document.getElementById('percent').innerHTML = data.percent;
    document.getElementById('percent24').innerHTML = data.percent24;
    document.getElementById('last-written').innerHTML = data.lastWritten;
    document.getElementById('first-remaining').innerHTML = data.firstRemaining;
    for (let update of data.leaderboard) {
        document.getElementById(update.author).children[2].innerHTML = update.comments
    }
    const leaderboard = document.getElementById('leaderboard')
    for (let i = 0; i < leaderboard.children.length - 1; i++) {
        let score = parseInt(leaderboard.children[i].children[2].innerHTML)
        let nextScore = parseInt(leaderboard.children[i + 1].children[2].innerHTML)
        if (score < nextScore) {
            let t = leaderboard.children[i].children[0].innerHTML
            leaderboard.children[i].children[0].innerHTML = leaderboard.children[i+1].children[0].innerHTML
            leaderboard.children[i+1].children[0].innerHTML = t
            leaderboard.insertBefore(leaderboard.children[i+1], leaderboard.children[i])
        }
    }
}