'use strict';

import * as mariadb from 'mariadb';

export {charts};

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
type DBdata = {
    timestamp: number,
    body: string,
    letters: number,
    author: string
}[];

const charts = {
    build: function(pool: mariadb.Pool, data: Data) {
        pool.query('SELECT timestamp, author FROM comments;')
            .then(authorStamps => {
                buildCommentsHeat(authorStamps)
                    .then(days => buildTimeline(days, authorStamps))
                buildRepliesDependency(authorStamps, data)
            });
        pool.query('SELECT body, COUNT(*) AS "letters" FROM comments GROUP BY body;')
            .then(letters => buildLettersColumn(letters));
        buildCommentsPie(data);
        // new charts go here
    },
    commentsPie,
    commentsHeat,
    lettersColumn,
    repliesDependency,
    timeline
};


var commentsPie = {
    chart: {
        type: 'pie',
        colorCount: 20,
        backgroundColor: '#282828'
    },
    title: {
        text: 'Comments per user',
        style: { 'color': "#999999" }
    },
    subtitle: {
        text: "Try tapping/clicking 'less than 300, 100, etc.'",
        style: { 'color': "#999999" }
    },
    caption: {
        text: 'This chart is interactive!',
        style: { 'color': "#999999" }
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
function buildCommentsPie(data: Data) {
    let lt300=0, lt100=0, lt50=0, lt10=0, lt5=0, lt2=0;
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
    lt300 += lt100 += lt50 += lt10 += lt5 += lt2;
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
    charts.commentsPie = commentsPie;
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
        style: { color: '#999999' }
    },
    subtitle: {
        text: 'Try tapping/clicking a square',
        style: { color: '#999999' }
    },
    caption: {
        text: 'This chart is interactive!',
        style: { color: '#999999' }
    },
    xAxis: {
        title: { text: 'Weeks' },
        categories: ['7/4','7/11','7/18','7/25','8/1','8/8','8/15','8/22','8/29','9/5','9/12','9/19','9/26']
    },
    yAxis: {
        title: { text: 'Days' },
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
            color: '#999999',
            fontWeight: 'undefined',
            textDecoration: 'undefined'
        },
        series: []
    }
};
async function buildCommentsHeat(stamps: DBdata) {
    let topData: {
        x: number,
        y: number,
        value: number,
        drilldown: string|null
    }[] = [];
    let drilldownSeries: {name: string, id: string, time: Date, stamps: Date[], data: [number, number, number][]}[] = [{
        name: new Date(1625630400000).toLocaleDateString().slice(0,-5),
        id: new Date(1625630400000).toLocaleDateString().slice(0,-5),
        time: new Date(1625630400000),
        stamps: [],
        data: []
    }];
    // sorts timestamps into series
    for (let i = 0; i < stamps.length; i++) {
        let time = new Date(stamps[i].timestamp * 1000);
        let series = drilldownSeries[drilldownSeries.length - 1];
        let seriesEnd = new Date(series.time.getTime() + 86400000);
        if (time < seriesEnd) {
            series.stamps.push(time);
        } else {
            drilldownSeries.push({
                name: seriesEnd.toLocaleDateString().slice(0,-5),
                id: seriesEnd.toLocaleDateString().slice(0,-5),
                time: seriesEnd,
                stamps: [],
                data: []
            });
            i--;
        }
    }
    // finishes configuring drilldown, generates coordinates & builds top level series
    let dataTemplate: [number, number, 0][] = [];
    for (let x=0, y=0; y<24; x==59 ? x=0 & y++ : x++ ) {
        dataTemplate.push([x, y, 0]);
    }
    for (let i=0, x=0, y=3; i < drilldownSeries.length; i++, y==6 ? y=0 & x++ : y++) {
        drilldownSeries[i].data = JSON.parse(JSON.stringify(dataTemplate));
        // adds a count for every timestamp on that day
        for (let time of drilldownSeries[i].stamps) {
            let hours = time.getHours();
            let minutes = time.getMinutes();
            let index = drilldownSeries[i].data.findIndex(arr =>
                    arr[0] == minutes ? arr[1] == hours ? true : false : false);
            drilldownSeries[i].data[index][2]++;
        }
        // builds top level series from drilldown series
        topData.push({
            x: x,
            y: y,
            value: drilldownSeries[i].stamps.length,
            drilldown: drilldownSeries[i].id
        });
        delete drilldownSeries[i].time;
        delete drilldownSeries[i].stamps;
    }
    // appends the parsed data to the chart object
    commentsHeat.drilldown.series = drilldownSeries;
    commentsHeat.series[0].data = topData;
    charts.commentsHeat = commentsHeat;
    console.log('commentsHeat loaded');
    let dailyData = JSON.parse(JSON.stringify(commentsHeat.series[0].data));
    for (let day of dailyData) {
        delete day.x;
        delete day.y;
        delete day.drilldown;
    }
    return dailyData;
}

var lettersColumn = {
    chart: {
        type: 'column',
        backgroundColor: '#282828'
    },
    title: {
        text: '# of letters/numbers used',
        style: { color: '#999999' }
    },
    legend: {
        enabled: false
    },
    xAxis: {
        title: { text: 'Character' },
        categories: [],
        crosshair: true
    },
    yAxis: {
        title: { text: 'Count' },
        min: 0
    },
    tooltip: {
        headerFormat: '<span>{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">Count: </td>' +
            '<td style="padding:0"><b>{point.y}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: [{
        name: 'Letters',
        data: []
    }]
};
function buildLettersColumn(letters: DBdata) {
    let arr = letters.slice(11).concat(letters.slice(0, 10));
    for (let i = 0; i < arr.length; i++) {
        lettersColumn.xAxis.categories.push(arr[i].body);
        lettersColumn.series[0].data.push(arr[i].letters);
    }
    charts.lettersColumn = lettersColumn;
    console.log('lettersColumn loaded');
}

var repliesDependency = {
    chart: {
        backgroundColor: '#282828'
    },
    title: {
        text: 'Replies between top 22 contributors',
        style: { color: '#999999' }
    },
    subtitle: {
        text: 'Dependency wheel showing # of times each user with over 200 comments replied to eachother',
        style: { color: '#999999' }
    },
    series: [{
        name: 'Comments from → to',
        keys: ['from', 'to', 'weight'],
        data: [],
        type: 'dependencywheel',
        dataLabels: {
            color: '#999999',
            textPath: {
                enabled: true,
                attributes: {
                    dy: 5
                }
            },
            distance: 10
        },
        size: '95%'
    }]
};
function buildRepliesDependency(authors: DBdata, data: Data) {
    var whitelist = [];
    for (let i = 0; i < 22; i++) {// determines # of users in chart
        whitelist.push(data.leaderboard[i].author);
    }
    var relations = {};
    for (let i = 1; i < authors.length; i++) {// builds relations object
        if (!whitelist.includes(authors[i].author)) continue;
        if (!whitelist.includes(authors[i-1].author)) continue;
        if (relations[authors[i].author] == undefined) {
            relations[authors[i].author] = {};
            relations[authors[i].author][authors[i-1].author] = 1;
        } else if (relations[authors[i].author][authors[i-1].author] == undefined) {
            relations[authors[i].author][authors[i-1].author] = 1;
        } else relations[authors[i].author][authors[i-1].author]++;
    }
    for (let replier in relations) {// flattens relations object into array in chart data
        for (let repliee in relations[replier]) {
            repliesDependency.series[0].data.push([
                replier,
                repliee,
                relations[replier][repliee]
            ]);
        }
    }
    charts.repliesDependency = repliesDependency;
    console.log('repliesDependency loaded');
}

var timeline = {
    chart: {
        backgroundColor: '#282828'
    },
    title: {
        text: 'Timeline of writing the Bee Movie script on r/AskOuija',
        style: { color: '#999999' }
    },
    subtitle: {
        text: 'day-by-day breakdown of activity over 84 days',
        style: { color: '#999999' }
    },
    legend: {
        itemStyle: { color: '#999999' }
    },
    xAxis: {
        type: 'datetime',
        minTickInterval: 24 * 36e5,
        labels: { align: 'left' },
        plotBands: [
            {
                from: 1625630400000,
                to: 1627012800000,
                color: 'rgba(0, 227, 255, 0.07)',
                label: {
                    text: '<em>The Beginning</em><br> First third',
                    style: {
                        color: '#999999'
                    },
                    y: 30
                }
            }, {
                from: 1627012800000,
                to: 1630900800000,
                color: 'rgba(255, 120, 0, 0.07)',
                label: {
                    text: '<em>The Dark Times</em><br> Middle third',
                    style: {
                        color: '#999999'
                    },
                    y: 30
                }
            }, {
                from: 1630900800000,
                to: 1632801600000,
                color: 'rgba(25, 255, 15, 0.07)',
                label: {
                    text: '<em>The Final Push</em><br> Last third',
                    style: {
                        color: '#999999'
                    },
                    y: 30
                }
            }, 
        ]
    },
    yAxis: [
        {
            max: 100,
            labels: { enabled: false },
            title: { text: '' },
            gridLineColor: 'rgba(0, 0, 0, 0.2)'
        }, {
            allowDecimals: false,
            max: 1600,
            labels: {
                style: { color: '#5e5e64' }
            },
            title: {
                text: 'Comments per day',
                style: {
                    color: '#5e5e64',
                    fontSize: '1.2em'
                }
            },
            gridLineWidth: 0
        }, {
            allowDecimals: false,
            max: 240,
            labels: {
                style: { color: '#67e34e' }
            },
            title: {
                text: 'Contributors per day',
                style: {
                    color: '#67e34e',
                    fontSize: '1.2em'
                }
            },
            opposite: true,
            gridLineWidth: 0
        }
    ],
    plotOptions: {
        series: {
            marker: {
                enabled: false,
                symbol: 'circle',
                radius: 2
            },
            fillOpacity: 0.5
        },
        flags: {
            tooltip: { xDateformat: '%B %e' },
            accessibility:  {
                point: {
                    valueDescriptionFormat: '{xDescription}. {point.title}: {point.text}.'
                }
            }
        }
    },
    series: [
        {
            type: 'spline',
            name: 'Completion',
            id: 'completion',
            dashStyle: 'dash',
            tooltip: {
                xDateFormat: '%B %e',
                valueSuffix: ' %'
            },
            data: []
        }, {
            yAxis: 1,
            type: 'area',
            name: 'Comments',
            id: 'comments',
            tooltip: { xDateFormat: '%B %e' },
            data: []
        }, {
            yAxis: 2,
            type: 'area',
            name: 'Contributors',
            id: 'contributors',
            step: 'right',
            tooltip: { xDateFormat: '%B %e' },
            data: []
        }, {
            type: 'flags',
            name: 'Events',
            onSeries: 'completion',
            color: '#999999',
            fillColor: 'rgba(255,255,255,0.8)',
            showInLegend: false,
            tooltip: { xDateFormat: '%B %e' },
            stackDistance: 20,
            y: -60,
            data: [{
                x: 1628913600000,
                title: 'Chat created',
                text: 'u/motobrowniano opens a chat on Reddit for people still contributing'
            }, {
                x: 1629777600000,
                title: 'Help found',
                text: 'u/motobrowniano makes a post on r/bee_irl and a few more people join the cause'
            }, {
                x: 1629950400000,
                title: 'Help found',
                text: 'u/The_GreenPinky7 finds a past attempt at writing the script ouija-style and a few of those contributors join the cause'
            }, {
                x: 1630123200000,
                title: 'Discord created',
                text: 'u/Moose_Hole starts a discord server as an alternative to Reddit chat'
            }, {
                x: 1630382400000,
                title: 'Leaderboard',
                text: 'u/Digital_Sparrow posts the first leaderboard'
            }, {
                x: 1631246400000,
                title: 'Website',
                text: 'u/Krosis27 creates the first version of this website, containing only a leaderboard'
            }, {
                x: 1631592000000,
                title: 'Leaderboard',
                text: 'u/Digital_Sparrow makes his final leaderboard post'
            }, {
                x: 1631592000000,
                title: 'Website',
                text: "Website adds a 'live progress' section to show progress/position in the script"
            }, {
                x: 1632110400000,
                title: 'Website',
                text: "Website adds live updating to 'live progress' section for even quicker commenting"
            }, {
                x: 1632196800000,
                title: 'Charts',
                text: 'First chart is made, a pie chart showing comments per user'
            }]
        }, {
            type: 'flags',
            name: 'Milestones',
            color: '#999999',
            shape: 'circlepin',
            showInLegend: false,
            tooltip: { xDateFormat: '%B %e' },
            y: -25,
            data: [{
                x: 1625976000000,
                title: '5,000',
                text: '5,000 total comments'
            }, {
                x: 1626580800000,
                title: '10,000',
                text: '10,000 total comments'
            }, {
                x: 1627790400000,
                title: '15,000',
                text: '15,000 total comments'
            }, {
                x: 1629604800000,
                title: '20,000',
                text: '20,000 total comments'
            }, {
                x: 1630987200000,
                title: '25,000',
                text: '25,000 total comments'
            }, {
                x: 1631764800000,
                title: '30,000',
                text: '30,000 total comments'
            }, {
                x: 1632628800000,
                title: '35,000',
                text: '35,000 total comments'
            }]
        }
    ]
};
function buildTimeline(dailyComments: {value: number}[], authorStamps: DBdata) {
    var days:{
        time:number,
        comments:number,
        percent:number,
        commenters:number
    }[] = [];
    // generates chart data for each day
    var currTime = 1625630400000;
    var nextTime = 1625716800000;
    var authors:string[] = [];
    var commentCount = 0;
    for (let i=0, d=0, l=authorStamps.length; i<l; i++) {
        if (authorStamps[i].timestamp * 1000 < nextTime) {
            if (!authors.some(a => a == authorStamps[i].author)) {
                authors.push(authorStamps[i].author)
            }
        } else {
            days.push({
                time: currTime,
                comments: dailyComments[d].value,
                percent: Math.floor((commentCount += dailyComments[d].value)*10000 / 37061) / 100,
                commenters: authors.length
            });
            authors = [];
            currTime = nextTime;
            nextTime += 86400000;
            d++;
            i--;
        }
        if (i == l-1) {
            days.push({
                time: currTime,
                comments: dailyComments[d].value,
                percent: (commentCount += dailyComments[d].value)*100 / 37061,
                commenters: authors.length
            });
        }
    }
    for (let day of days) {
        // @ts-ignore
        timeline.series[0].data.push([day.time, day.percent]);
        // @ts-ignore
        timeline.series[1].data.push([day.time, day.comments]);
        // @ts-ignore
        timeline.series[2].data.push([day.time, day.commenters]);
    }
    charts.timeline = timeline;
    console.log('timeline loaded');
}