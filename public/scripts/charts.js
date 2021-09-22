'use strict';

document.addEventListener('DOMContentLoaded', function() {
    fetch('https://test.ouijabeederboard.com/charts/commentsPie')
      .then(res => res.json())
      .then(data => {
        console.log(data);
        const chart = Highcharts.chart('chart', data);
      });
});