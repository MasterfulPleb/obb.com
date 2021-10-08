'use strict';

import * as fs from 'fs/promises';
import * as mariadb from'mariadb';

type Data = {
    leaderboard: {
        author: string,
        comments: number
    }[],
    lastWritten: string,
    firstRemaining: string,
    written: string,
    remaining: string,
    percent: number,
    percent24: number,
    progress: number
};

var lastData: Data;

async function getData(pool: mariadb.Pool) {
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
            'WHERE timestamp > (UNIX_TIMESTAMP() - 86400);'),
        conn.query('SELECT ID FROM comments ORDER BY timestamp DESC LIMIT 1;')
    ]);
    var written = prep[1] + prep[2].slice(0, 1);
    var remaining = prep[2].slice(1);
    var lastWritten = parseLastWritten(written);
    var firstRemaining = parseFirstRemaining(remaining);
    var percent = 100;
    const querys = await query;
    conn.release();
    var leaderboard = querys[0];
    var percent24 = 0;
    var progress = written.length;
    lastData = {
        leaderboard: leaderboard,
        lastWritten: lastWritten,
        firstRemaining: firstRemaining,
        written: written,
        remaining: remaining,
        percent: percent,
        percent24: percent24,
        progress: progress
    };
    return lastData;
}
function parseLastWritten(written: string) {
    let temp = written.slice(written.length - 10);
    let lw = '';
    for (let i = 0; i < 10; i++) {
        lw += temp.slice(i, i+1);
        if (i != 9) lw += ' ';
    }
    return lw;
}
function parseFirstRemaining(remaining: string) {
    let temp = remaining.slice(0, 10);
    let fr = '';
    for (let i = 0; i < 10; i++) {
        fr += temp.slice(i, i+1);
        if (i != 9) fr += ' ';
    }
    return fr;
}
export {getData};