'use strict';

let fetchChart = fetch('https://test.ouijabeederboard.com/charts/commentsPie')
    .then(res => res.json())

document.addEventListener('DOMContentLoaded', function() {
    fetchChart
      .then(data => {
        console.log(data);
        const chart = Highcharts.chart('chart', data);
      });
});