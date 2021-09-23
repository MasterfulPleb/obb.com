'use strict';

//let fetchChart = fetch('https://test.ouijabeederboard.com/charts/commentsPie')

document.addEventListener('DOMContentLoaded', function() {
    fetchChart
      .then(res => res.json())
      .then(data => {
        console.log(data);
        const chart = Highcharts.chart('chart', data);
      });
});