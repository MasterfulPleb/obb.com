'use strict';

const WebSocket = require("ws");

let ws = new WebSocket('wss://test.ouijabeederboard.com/ws');

ws.onopen = (e) => {
    console.log('websocket connected')
};