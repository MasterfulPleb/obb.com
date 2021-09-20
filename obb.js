'use strict';
const express     = require('express');
  const app       = express();
const expressWs   = require('express-ws')(express()); 
  const wsapp     = expressWs.app;
  const wss       = expressWs.getWss('/ws');
const helmet      = require('helmet');
const favicon     = require('serve-favicon');
const pug         = require('pug');
const Chart       = require('chart.js');
const mariadb     = require('mariadb');
  const pool      = mariadb.createPool({
    socketPath: '/var/run/mysqld/mysqld.sock',
    user: 'root',
    database: 'bee_movie',
    connectionLimit: 5,
  });
const { getData } = require('./get-data.js');

var data = {};
refreshData();
function refreshData() {
    getData(pool)
      .then(d => data = d)
      .finally(setTimeout(refreshData, 10000))
}

app.set('view engine', 'pug');
app.use(helmet());
app.use(favicon('./public/favicon.ico'));
app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    res.render('index', data);
});
app.get('/charts', (req, res) => {
    res.render('charts')
});
app.get('/newest', (req, res) => {
    pool.query('SELECT permalink ' +
        'FROM comments ORDER BY timestamp DESC LIMIT 1;')
    .then(perma => {
        var link = 'https://www.reddit.com' + perma[0].permalink + '?context=3';
        res.redirect(link);
    });
});
app.get('/old.newest', (req, res) => {
    pool.query('SELECT permalink ' +
        'FROM comments ORDER BY timestamp DESC LIMIT 1;')
    .then(perma => {
        var link = 'https://old.reddit.com' + perma[0].permalink + '?context=3';
        res.redirect(link);
    });
});
app.get('*', (req, res) => res.redirect('/'));

wsapp.ws('/ws', function(ws, req) {
    console.log('socket connected');
    ws.on('message', (msg) => {
        if (msg == 'ping') ws.send('pong')
        else if (msg == 'update') {
            let d = formatData();
            ws.send(d);
        }
    })
});

var lastSent = {};
setInterval(streamData, 10000);
function streamData() {
    if (wss.clients.size == 0) return
    if (lastSent == data) {
        console.log('no new data, sending ping to ' + wss.clients.size + ' clients');
        wss.clients.forEach((client) => {
            client.send('ping');
        });
    } else {
        lastSent = data;
        console.log('new data, sending to ' + wss.clients.size + ' clients');
        let d = formatData();
        wss.clients.forEach((client) => {
            client.send(d);
        });
    }
}
function formatData() {
    let wsdata = Object.assign({}, data);
    wsdata.progress = data.written.length;
    delete wsdata.written;
    delete wsdata.remaining;
    let d = JSON.stringify(wsdata);
    return wsdata
}


wsapp.listen(3002);

app.listen(3000);