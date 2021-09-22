'use strict';

document.addEventListener('DOMContentLoaded', async function() {
    let data = await fetch('https://test.ouijabeederboard.com/charts/commentsPie');
    console.log(data.json());
    const chart = Highcharts.chart('chart', data.json());
});