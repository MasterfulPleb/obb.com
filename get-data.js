'use strict';
exports.getData = getData;

const fs = require('fs/promises');
const mariadb = require('mariadb');

async function getData(/**@type {mariadb.Pool}*/pool) {
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
    var progress = written.length;
    return {
        leaderboard: leaderboard,
        lastWritten: lastWritten,
        firstRemaining: firstRemaining,
        written: written,
        remaining: remaining,
        percent: percent,
        percent24: percent24,
        progress: progress
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
        if (i != 9) fr += ' '
    }
    return fr
}