'use strict';

let ws = new WebSocket('wss://test.ouijabeederboard.com/ws');

ws.onopen = (ev) => {
    console.log('websocket connected')
};

ws.onmessage = (msg) => {
    console.log(msg)
    //let data = JSON.parse(msg)
    //console.log(data)
}