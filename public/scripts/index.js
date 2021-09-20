'use strict';

let ws = new WebSocket('wss://test.ouijabeederboard.com/ws');

ws.onopen = (ev) => {
    console.log('websocket connected');
};
ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data)
    console.log(data)
    updatePage(data)
}

function updatePage(data) {
    const written = document.getElementById('written')
    const remaining = document.getElementById('remaining')
    const oldLength = written.innerHTML.length
    const newLength = data.progress
    const diff = newLength - oldLength
    if (diff > 0) {
        written.innerHTML += remaining.innerHTML.slice(0, diff)
        remaining.innerHTML = remaining.innerHTML.slice(diff)
        document.getElementById('percent').innerHTML = data.percent
        document.getElementById('percent24').innerHTML = data.percent24
        document.getElementById('last-written').innerHTML = data.lastWritten
        document.getElementById('first-remaining').innerHTML = data.firstRemaining
    }
}