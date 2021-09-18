'use strict';
const express = require('express');
const app = express();
const favicon = require('serve-favicon');
const pug = require('pug');
const fs = require('fs/promises');
const Chart = require('chart.js');
const mariadb = require('mariadb');
const pool = mariadb.createPool({
    socketPath: '/var/run/mysqld/mysqld.sock',
    user: 'root',
    database: 'bee_movie',
    connectionLimit: 5,
});

app.set('view engine', 'pug');

app.use(favicon('./public/favicon.ico'));

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    getData().then(data => res.render('index', data))
});

app.get('/charts', (req, res) => {

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

app.listen(3000);

async function getData() {
    const prep = await Promise.all([
        pool.getConnection(),
        fs.readFile('/home/justin/scraper/bee-movie-comment-updater/written.txt', {encoding: 'utf8'}),
        fs.readFile('/home/justin/scraper/bee-movie-comment-updater/remaining.txt', {encoding: 'utf8'})
    ]);
    var conn = prep[0];
    const query = Promise.all([
        conn.query('SELECT author, ' +
            'COUNT(*) AS "comments" FROM comments ' +
            'GROUP BY author ORDER BY COUNT(*) DESC;'),
        conn.query('SELECT COUNT(*) ' +
            'AS comments24h FROM comments ' +
            'WHERE timestamp > (UNIX_TIMESTAMP() - 86400);')
    ]);
    var written = prep[1] + prep[2].slice(0, 1);
    var remaining = prep[2].slice(1);
    var lastWritten = parseLastWritten(written);
    var firstRemaining = parseFirstRemaining(remaining);
    var percent = parseInt(written.length * 10000 / (written.length + remaining.length)) / 100;
    const querys = await query;
    conn.release();
    var leaderboard = querys[0];
    var percent24 = parseInt(querys[1][0].comments24h * 10000 / (written.length + remaining.length)) / 100;
    return {
        leaderboard: leaderboard,
        lastWritten: lastWritten,
        firstRemaining: firstRemaining,
        written: written,
        remaining: remaining,
        percent: percent,
        percent24: percent24
    }
}
function parseLastWritten(written) {
    let temp = written.slice(written.length - 10);
    let lw = '';
    for (let i = 0; i < 10; i++) {
        lw += temp.slice(i, i+1);
        if (i != 9) lw += ' '
    }
    return lw
}
function parseFirstRemaining(remaining) {
    let temp = remaining.slice(0, 10);
    let fr = '';
    for (let i = 0; i < 10; i++) {
        fr += temp.slice(i, i+1);
        if (i != 9) fr += ' ';
    }
    return fr
}