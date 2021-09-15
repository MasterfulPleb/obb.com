'use strict';
const express = require('express');
const app = express();
const favicon = require('serve-favicon');
const pug = require('pug');
const fs = require('fs/promises');
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

app.get('/', async function (req, res) {
    const conn = await pool.getConnection();
    var written = await fs.readFile('/home/justin/scraper/bee-movie-comment-updater/written.txt', {encoding: 'utf8'});
    var remaining = await fs.readFile('/home/justin/scraper/bee-movie-comment-updater/remaining.txt', {encoding: 'utf8'});
    var temp = written.slice(written.length - 10);
    var lastWritten = '';
    for (let i = 0; i < 10; i++) {
        lastWritten += temp.slice(i, i+1);
        lastWritten += ' ';
    }
    temp = remaining.slice(0, 10);
    var firstRemaining = '';
    for (let i = 0; i < 10; i++) {
        firstRemaining += temp.slice(i, i+1);
        if (i != 9) firstRemaining += ' ';
    }
    try {
        var leaderboard = await conn.query('SELECT author, ' +
            'COUNT(*) AS "comments" FROM comments ' +
            'GROUP BY author ORDER BY COUNT(*) DESC;');
        var lastCommentPerma = await conn.query('SELECT permalink ' +
            'FROM comments ORDER BY timestamp DESC LIMIT 1;');
        var lastCommentURL = 'https://www.reddit.com' + lastCommentPerma[0].permalink + '?context=3';
        var lastCommentOld = 'https://old.reddit.com' + lastCommentPerma[0].permalink + '?context=3';
    } catch (err) {
        console.error('mariadb query error: ' + err);
    } finally {
        conn.release();
    }
    res.render('index', {
        leaderboard: leaderboard,
        lastCommentURL: lastCommentURL,
        lastCommentOld: lastCommentOld,
        lastWritten: lastWritten,
        firstRemaining: firstRemaining
    });
});

app.get('*', (req, res) => res.redirect('/'));

app.listen(3000);
