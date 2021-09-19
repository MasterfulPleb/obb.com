'use strict';
const express     = require('express');
  const app       = express();
const expressWs   = require('express-ws')(express()); 
  const wsapp       = expressWs.app;
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

app.set('view engine', 'pug');
app.use(helmet());
app.use(favicon('./public/favicon.ico'));
app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    getData(pool).then(data => res.render('index', data));
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


var wss = expressWs.getWss('/ws');
wsapp.ws('/ws', function(ws, req) {
    console.log('socket connected');
    ws.on('message', function(msg) {
        console.log(msg.data);
        wss.clients.forEach(function (client) {
            client.send(msg.data);
        });
    });
});

wsapp.listen(3002);

app.listen(3000);