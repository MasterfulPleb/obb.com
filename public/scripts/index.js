'use strict';

//const { EventEmitter } = require('ws');//delete before committing

/**@type {WebSocket}*/var ws;
/*/**@type {EventEmitter}*/var socket;
/**@type {NodeJS.Timeout}*/var alive;

tryConnection();

function tryConnection(retry = true) {
    if (retry) {
        try { // try normal WebSocket
            configureSocket();
        } catch (_err) { // fallback to socket.io
            socket = io('wss://test.ouijabeederboard.com/ws',{
                // use WebSocket first, if available
                transports: ["websocket", "polling"]
            })
            socket.on("connect_error", () => {
                // revert to classic upgrade
                socket.io.opts.transports = ["polling", "websocket"];
            });
            socket.on('message', (msg) => {
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
                        
                    }
                }
            })
        }
        alive = setTimeout(tryConnection, 60000, false);
    } else console.log('websocket connection failed');
}
function configureSocket() {
    ws = new WebSocket('wss://test.ouijabeederboard.com/ws');
    ws.onopen = (ev) => console.log('websocket connected');
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