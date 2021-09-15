'use strict';
const express = require('express');
const app = express();
const favicon = require('serve-favicon');
const pug = require('pug');
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
    try {
        var leaderboard = await conn.query('SELECT author, ' +
            'COUNT(*) AS "comments" FROM comments ' +
            'GROUP BY author ORDER BY COUNT(*) DESC;');
        var lastCommentPerma = await conn.query('SELECT permalink ' +
            'FROM comments ORDER BY timestamp DESC LIMIT 1;');
        lastCommentURL = 'https://www.reddit.com' + lastCommentPerma + '?context=3';
    } catch (err) {
        console.error('mariadb query error: ' + err);
    }
    res.render('index', { leaderboard: leaderboard, lastCommentURL: lastCommentURL });
});

app.get('*', (req, res) => res.redirect('/'));

app.listen(3000);
