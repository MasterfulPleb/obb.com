'use strict';
const express       = require('express');
  const app         = express();
const expressWs     = require('express-ws')(express()); 
  const wsapp       = expressWs.app;
  const wss         = expressWs.getWss('/ws');
const helmet        = require('helmet');
const favicon       = require('serve-favicon');
const pug           = require('pug');
  const renderIndex = pug.compileFile('./views/index.pug');
const ts            = require('typescript');
const mariadb       = require('mariadb');
  const pool        = mariadb.createPool({
    socketPath: '/var/run/mysqld/mysqld.sock',
    user: 'root',
    database: 'bee_movie',
    connectionLimit: 5,
  });
const Highcharts    = require('highcharts');
  //require('highcharts/modules/exporting')(Highcharts);
const { getData }   = require('./get-data.js');

app.set('view engine', 'pug');
app.use(helmet());
app.use(favicon('./public/favicon.ico'));
app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    res.send(preRender);
});
app.get('/charts', (req, res) => {
    res.render('charts');
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
        if (msg == 'ping') ws.send('pong');
        else if (msg == 'update') ws.send(JSON.stringify(formatData()));
    })
});

wsapp.listen(3002);
app.listen(3000);

/**
 * @type {{
 * leaderboard: {author: string, comments: number}[],
 * lastWritten: string,
 * firstRemaining: string,
 * written: string,
 * remaining: string,
 * percent: number,
 * percent24: number,
 * progress: number}}
 * */
var data;
var preRender;
var oldProgress;
var oldLeaderboard;
var pingTimer = 0;
refreshData(true);

async function refreshData(startup = false) {
    getData(pool)
      .then(d => {
        if (data != d) {
            data = d;
            preRender = renderIndex(data);
        }
        if (startup) {
            oldProgress = d.progress;
            oldLeaderboard = d.leaderboard;
            setInterval(streamData, 250);
        }
      })
      .finally(setTimeout(refreshData, 1000));
}
async function streamData() {
    if (wss.clients.size == 0) return
    else if (oldProgress == data.progress) {
        pingTimer++;
        if (pingTimer > 80) {
            pingTimer = 0;
            console.log('no new data, sending ping to ' + wss.clients.size +
                ' client' + (wss.clients.size > 1 ? 's' : ''));
            wss.clients.forEach((client) => {
                client.send('ping');
            });
        }
    } else {
        pingTimer = 0;
        console.log('new data, sending to ' + wss.clients.size +
            ' client' + (wss.clients.size > 1 ? 's' : ''));
        wss.clients.forEach((client) => {
            client.send(JSON.stringify(formatData()));
        });
    }
}
function formatData() {
    let d = Object.assign({}, data);
    const diff = d.progress - oldProgress;
    oldProgress = d.progress;
    var changes = 0;
    var leaderboardChanges = [];
    for (let entry of d.leaderboard) {
        if (changes == diff) break
        for (let oldEntry of oldLeaderboard) {
            if (oldEntry.author == entry.author) {
                if (oldEntry.comments != entry.comments) {
                    leaderboardChanges.push(entry);
                    changes++;
                }
                break
            }
        }
    }
    oldLeaderboard = d.leaderboard;
    d.leaderboard = leaderboardChanges;
    delete d.written;
    delete d.remaining;
    return d
}


//Highcharts.chart({})