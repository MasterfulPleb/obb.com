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

app.use(favicon('/public/favicon.ico'));

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    pool.query('SELECT author, ' +
        'COUNT(*) AS "comments" FROM comments ' +
        'GROUP BY author ORDER BY COUNT(*) DESC;')
    .then(arr => {
        console.log(arr);
        res.render('index', { leaderboard: arr });
    })
    .catch(err => console.error('mariadb query error: ' + err));
});

app.get('*', (req, res) => res.redirect('/'));

app.listen(3000);
