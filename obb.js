'use strict';
const express        = require('express');
  const app          = express();
//const expressWs    = require('express-ws')(express()); 
  //const wsapp      = expressWs.app;
  //const wss        = expressWs.getWss('/ws');
const helmet         = require('helmet');
const favicon        = require('serve-favicon');
const pug            = require('pug');
  const renderIndex  = pug.compileFile('./views/index.pug');
  const renderCharts = pug.compileFile('./views/charts.pug');
const mariadb        = require('mariadb');
  const pool         = mariadb.createPool({
    socketPath: '/var/run/mysqld/mysqld.sock',
    user: 'root',
    database: 'bee_movie',
    connectionLimit: 5,
  });
const { getData }    = require('./get-data.js');

app.set('view engine', 'pug');
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
        "connect-src": ["'self'", "wss:"]
    }
}));
app.use(favicon('./public/favicon.ico'));
app.use('/public', express.static('public'));

app.get('/', (_req, res) => res.send(preRender));
app.get('/charts', (_req, res) => res.send(preRenderCharts));
app.get('/charts/commentsPie', (_req, res) => res.send(commentsPie));
app.get('/charts/commentsHeat', (_req, res) => res.send(commentsHeat));
app.get('/newest', (_req, res) => {
    res.redirect('https://www.reddit.com/r/AskOuija/comments/ofiegh/dam_i_forgot_the_entire_bee_movie_script_can_you/hemsuuz/?context=3');
});
app.get('/old.newest', (_req, res) => {
    res.redirect('https://old.reddit.com/r/AskOuija/comments/ofiegh/dam_i_forgot_the_entire_bee_movie_script_can_you/hemsuuz/?context=3');
});
app.get('*', (_req, res) => res.redirect('/'));

/*wsapp.ws('/ws', function(ws, _req) {
    console.log('socket connected');
    ws.on('message', (msg) => {
        if (msg == 'ping') ws.send('pong');
        else if (msg == 'update') {
            let d = Object.assign({}, wsdata);
            d.leaderboard = data.leaderboard;
            ws.send(JSON.stringify(d));
        }
    })
});

wsapp.listen(3002);*/
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
//var wsdata;
var preRender;
var preRenderCharts;
//var oldProgress;
//var oldLeaderboard;
//var pingTimer = 0;
refreshData(true);
setTimeout(buildCharts, 5000)

async function refreshData(startup = false) {
    getData(pool)
      .then(d => {
        if (data != d) {
            data = d;
            preRender = renderIndex(data);
            preRenderCharts = renderCharts();
        }
        if (startup) {
            //oldProgress = d.progress;
            //oldLeaderboard = d.leaderboard;
            //wsdata = formatData();
            //setInterval(streamData, 250);
        }
      });
      //.finally(setTimeout(refreshData, 1000));
}
/*async function streamData() {
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
        wsdata = formatData();
        let d = JSON.stringify(wsdata);
        wss.clients.forEach((client) => {
            client.send(d);
        });
    }
}*/
/*function formatData() {
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
}*/


async function buildCharts() {
    buildCommentsPie();
    pool.query('SELECT timestamp FROM comments;')
      .then(stamps => buildCommentsHeat(stamps));
}
var commentsPie = {
    chart: {
        type: 'pie',
        colorCount: 20,
        backgroundColor: '#282828'
    },
    title: {
        text: 'Comments per user',
        style: { 'color': "#797268" }
    },
    subtitle: {
        text: "Try tapping/clicking 'less than 300, 100, etc.'",
        style: { 'color': "#797268" }
    },
    caption: {
        text: 'This chart is interactive!',
        style: { 'color': "#797268" }
    },
    series: [{
        name: 'Comments',
        data: []
    }],
    drilldown: {
        series: [{
            name: 'Less than 300',
            id: 'lt300',
            data: []
        },
        {
            name: 'Less than 100',
            id: 'lt100',
            data: []
        },
        {
            name: 'Less than 50',
            id: 'lt50',
            data: []
        },
        {
            name: 'Less than 10',
            id: 'lt10',
            data: []
        },
        {
            name: 'Less than 5',
            id: 'lt5',
            data: []
        },
        {
            name: 'Single comment',
            id: 'lt2',
            data: []
        }]
    }
};
function buildCommentsPie() {
    commentsPie.series[0].data = [];
    for (let series of commentsPie.drilldown.series) {
        series.data = [];
    }
    let lt300 = 0;
    let lt100 = 0;
    let lt50 = 0;
    let lt10 = 0;
    let lt5 = 0;
    let lt2 = 0;
    for (let i = 0; i < data.leaderboard.length; i++) {
        let row = data.leaderboard[i];
        if (row.comments > 299) {
            commentsPie.series[0].data.push({
                name: row.author,
                y: row.comments,
                drilldown: null
            });
        } else if (row.comments < 300 && row.comments > 99) {
            lt300 += row.comments
            commentsPie.drilldown.series[0].data.push([
                row.author,
                row.comments
            ]);
        } else if (row.comments < 100 && row.comments > 49) {
            lt100 += row.comments
            commentsPie.drilldown.series[1].data.push([
                row.author,
                row.comments
            ]);
        } else if (row.comments < 50 && row.comments > 9) {
            lt50 += row.comments
            commentsPie.drilldown.series[2].data.push([
                row.author,
                row.comments
            ]);
        } else if (row.comments < 10 && row.comments > 4) {
            lt10 += row.comments
            commentsPie.drilldown.series[3].data.push([
                row.author,
                row.comments
            ]);
        } else if (row.comments < 5 && row.comments > 1) {
            lt5 += row.comments
            commentsPie.drilldown.series[4].data.push([
                row.author,
                row.comments
            ]);
        } else if (row.comments == 1) {
            lt2 += row.comments
            commentsPie.drilldown.series[5].data.push([
                row.author,
                row.comments
            ]);
        }
    }
    lt5 += lt2;
    lt10 += lt5;
    lt50 += lt10;
    lt100 += lt50;
    lt300 += lt100;
    commentsPie.series[0].data.push({
        name: 'Less than 300',
        y: lt300,
        drilldown: 'lt300'
    });
    commentsPie.drilldown.series[0].data.push({
        name: 'Less than 100',
        y: lt100,
        drilldown: 'lt100'
    });
    commentsPie.drilldown.series[1].data.push({
        name: 'Less than 50',
        y: lt50,
        drilldown: 'lt50'
    });
    commentsPie.drilldown.series[2].data.push({
        name: 'Less than 10',
        y: lt10,
        drilldown: 'lt10'
    });
    commentsPie.drilldown.series[3].data.push({
        name: 'Less than 5',
        y: lt5,
        drilldown: 'lt5'
    });
    commentsPie.drilldown.series[4].data.push({
        name: 'Single comment',
        y: lt2,
        drilldown: 'lt2'
    });
    console.log('commentsPie loaded');
}
var commentsHeat = {
    chart: {
        type: 'heatmap',
        marginTop: 40,
        marginBottom: 80,
        plotBorderWidth: 1,
        backgroundColor: '#282828',
        events: {}
    },
    title: {
        text: 'Comments per day',
        style: { 'color': "#797268" }
    },
    /*subtitle: {
        text: "Try tapping/clicking a square",
        style: { 'color': "#797268" }
    },*/
    caption: {
        text: 'This chart is a work-in-progress',
        style: { 'color': "#797268" }
    },
    xAxis: {
        title: 'Weeks',
        categories: ['7/4','7/11','7/18','7/25','8/1','8/8','8/15','8/22','8/29','9/5','9/12','9/19','9/26']
    },
    yAxis: {
        title: 'Days',
        reversed: true,
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    colorAxis: [
        {
            min: 0,
            max: 14,
            stops: [
                [0, '#282828'],
                [0.071428, '#dad9ff'],
                [1, '#ff0000']
            ]
        }, {
            min: 0,
            max: 1600,
            minColor: '#dad9ff',
            maxColor: '#ff3f00'
        }
    ],
    legend: {
        align: 'right',
        layout: 'vertical',
        margin: 0,
        verticalAlign: 'top',
        y: 25,
        symbolHeight: 500
    },
    series: [{
        name: 'Comments per day',
        borderWidth: 1,
        colorAxis: 1,
        data: [],
        dataLabels: {
            enabled: true,
            color: '#000000'
        }
    }],
    drilldown: {
        activeAxisLabelStyle: {
            cursor: 'undefined',
            color: '797268',
            fontWeight: 'undefined',
            textDecoration: 'undefined'
        },
        series: []
    }
};
function buildCommentsHeat(stamps) {
    /**
     * @type {{
     *      x: number,
     *      y: number,
     *      value: number,
     *      drilldown: string|null
     *  }[]}
     * */
    let topData = [];
    let drilldownSeries = [{
        name: new Date(1625630400000),
        id: new Date(1625630400000).toLocaleDateString().slice(0,-5).replace('/','-'),
        /**@type {[number, number, number][]}*/
        data: []
    }];
    // sorts timestamps into days
    for (let i = 0; i < stamps.length; i++) {
        let time = new Date(stamps[i].timestamp * 1000);
        let series = drilldownSeries[drilldownSeries.length - 1];
        let seriesEnd = new Date(series.name.getTime() + 86400000);
        if (time < seriesEnd) {
            series.data.push(time);
        } else {
            drilldownSeries.push({
                name: seriesEnd,
                id: seriesEnd.toLocaleDateString().slice(0,-5).replace('/','-'),
                data: []
            });
            i--;
        }
    }
    // finishes configuring drilldown, leaving day's count at end of series data
    for (let i = 0; i < drilldownSeries.length; i++) {
        /**@type {Date[]}*/
        let timestamps = drilldownSeries[i].data;
        if (timestamps == []) break
        drilldownSeries[i].data = [];
        // adds a datapoint for every minute in series
        for (let y = 0; y < 24; y++) {
            for (let x = 0; x < 60; x++) {
                drilldownSeries[i].data.push([x, y, 0]);
            }
        }
        // adds a count for every timestamp on that day
        for (let time of timestamps) {
            let hours = parseInt(time.getHours());
            let minutes = parseInt(time.getMinutes());
            let index = drilldownSeries[i].data.findIndex(arr => arr[0] == minutes ? arr[1] == hours ? true : false : false);
            drilldownSeries[i].data[index][2]++;
        }
        // changes x & y positions to match labels on chart
        for (let j = 0; j < drilldownSeries[i].data.length; j++) {
            //drilldownSeries[i].data[j][0] += 13;
            //drilldownSeries[i].data[j][1] += 7;
        }
        // stores the day's count as the last datapoint, to be popped later
        drilldownSeries[i].data.push(timestamps.length);
    }
    // builds top level series from drilldown series, pops days count
    let emptyIndexes = [];
    for (let i=0, x=0, y=3; i < drilldownSeries.length; i++, y==6 ? y=0 & x++ : y++) {
        let dd;
        let v;
        if (drilldownSeries[i].data.length == 0) {
            dd = null;
            v = 0;
            emptyIndexes.push(i);
        } else {
            dd = drilldownSeries[i].id;
            v = drilldownSeries[i].data.pop();
        }
        topData.push({
            x: x,
            y: y,
            value: v,
            drilldown: dd
        });
    }
    // appends the parsed data to the chart object
    for (let series of drilldownSeries) {
        series.name = series.id
    }
    commentsHeat.drilldown.series = drilldownSeries;
    commentsHeat.series[0].data = topData;
    console.log('commentsHeat loaded');
}