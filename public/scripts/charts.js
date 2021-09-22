'use strict';

document.addEventListener('DOMContentLoaded', function() {
    const chart = Highcharts.chart('chart', {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Comments per user'
        },
        series: [{
            name: 'someone',
            data: [{
                name: 'someone',
                y: 1234
            }, {
                name: 'someone else',
                y: 3456
            }, {
                name: 'ligma',
                y: 2345
            }, {
                name: 'joe',
                y: 6879
            }, {
                name: 'jack mehoff',
                y: 1456
            }]
        }]
    });
});