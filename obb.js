'use strict';
const express = require('express');
const app = express();
const pug = require('pug');
const mariadb = require('mariadb');
const pool = mariadb.createPool({
        socketPath: '/var/run/mysqld/mysqld.sock',
        user: 'root',
        database: 'bee_movie',
        connectionLimit: 5,
});

app.set('view engine', 'pug');

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    pool.query('SELECT author, ' +
        'COUNT(*) AS "comments" FROM comments ' +
        'GROUP BY author ORDER BY COUNT(*) DESC;')
    .then(arr => res.render('index', { leaderboard: arr }))
    .catch(err => console.error('mariadb error: ' + err));
});

app.get('*', (req, res) => res.redirect('/'));

app.listen(3000);


/*  //let conn;
    try {
        conn = await pool.getConnection();
        const leaderboard = await conn.query('SELECT author, ' +
            'COUNT(*) AS "comments" FROM comments ' +
            'GROUP BY author ORDER BY COUNT(*) DESC;'
        );
        res.render('index', { leaderboard: leaderboard })
    } catch (err) {
        console.error('mariadb connection error: ' + err)
    } finally {
        if (conn) return conn.end()
    }




    //let leaderboard;
    pool.getConnection()
        .then(conn => {
            conn.query('SELECT author, ' +
                'COUNT(*) AS "comments" FROM comments ' +
                'GROUP BY author ORDER BY COUNT(*) DESC;')
            .then(arr => leaderboard = arr)
            .finally(() => conn.release)
        })
        .then(arr => {
            res.render('index', { leaderboard: arr })
            
        })
        .catch(err => console.error('mariadb error: ' + err))




    pool.getConnection()
    .then(conn => {
        conn.query('SELECT author, COUNT(*) AS "comments" ' +
            'FROM comments GROUP BY author ORDER BY COUNT(*) DESC;')
        .then(arr => res.render('index', { array: arr }))
        .catch(err => console.error('mariadb query error: ' + err));
    })
    .catch(err => console.error('mariadb connection error: ' + err));*/
