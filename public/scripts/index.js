'use strict';

let ws = new WebSocket('wss://test.ouijabeederboard.com/ws')

ws.onopen = (e) => {
    console.log('websocket connected')
};

ws.on('message', (msg) => {
    
});