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
//const Highcharts    = require('highcharts');
  //require('highcharts/modules/exporting')(Highcharts);
const { getData }   = require('./get-data.js');

app.set('view engine', 'pug');
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
        "script-src": ["'self'", "https://test.ouijabeederboard.com/public/scripts/index.js"],
    }
}))
app.use(favicon('./public/favicon.ico'));
app.use('/public', express.static('public'));

app.get('/', (_req, res) => res.send(preRender));
app.get('/charts', (_req, res) => res.render('charts'));
app.get('/charts/commentsPie', (_req, res) => res.send(commentsPie));
app.get('/newest', (_req, res) => {
    pool.query('SELECT permalink ' +
        'FROM comments ORDER BY timestamp DESC LIMIT 1;')
    .then(perma => {
        var link = 'https://www.reddit.com' + perma[0].permalink + '?context=3';
        res.redirect(link);
    });
});
app.get('/old.newest', (_req, res) => {
    pool.query('SELECT permalink ' +
        'FROM comments ORDER BY timestamp DESC LIMIT 1;')
    .then(perma => {
        var link = 'https://old.reddit.com' + perma[0].permalink + '?context=3';
        res.redirect(link);
    });
});
app.get('*', (_req, res) => res.redirect('/'));

wsapp.ws('/ws', function(ws, _req) {
    console.log('socket connected');
    ws.on('message', (msg) => {
        if (msg == 'ping') ws.send('pong');
        else if (msg == 'update') ws.send(wsdata);
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
var wsdata;
var preRender;
var oldProgress;
var oldLeaderboard;
var pingTimer = 0;
refreshData(true);
setTimeout(updateCharts, 5000)

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
        wsdata = JSON.stringify(formatData());
        wss.clients.forEach((client) => {
            client.send(wsdata);
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
async function updateCharts() {
    buildCommentsPie();
    setTimeout(updateCharts, 600000);
}


var commentsPie = {
    chart: {
        type: 'pie',
        backgroundColor: '#282828'
    },
    title: {
        text: 'Comments per user'
    },
    series: [{
        name: 'Comments',
        data: []
    }]
};

function buildCommentsPie() {
    commentsPie.series[0].data = []
    for (let user of data.leaderboard) {
        commentsPie.series[0].data.push({
            name: user.author,
            y: user.comments
        });
    }
}