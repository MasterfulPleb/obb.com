'use strict';
const express = require('express');
const app = express();
const pug = require('pug');
const mariadb = require('mariadb')

app.set('view engine', 'pug');

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    mariadb.createConnection({
        socketPath: '/var/run/mysqld/mysqld.sock',
        user: 'root',
        database: 'bee_movie'
    })
    .then(conn => {
        conn.query('SELECT author, COUNT(2) AS "totalComments"' +
            ' FROM comments GROUP BY author ORDER BY COUNT(2) DESC;')
        .then(arr => res.render('index', { array: arr }))
        .catch(err => console.error('mariadb query error: ' + err));
    })
    .catch(err => console.error('mariadb connection error: ' + err));
});

app.get('*', (req, res) => res.redirect('/'));

app.listen(3000);
