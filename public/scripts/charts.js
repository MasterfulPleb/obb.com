'use strict';

document.addEventListener('DOMContentLoaded', async function() {
    let data = await fetch('https://test.ouijabeederboard.com/charts/commentsPie')
    const chart = Highcharts.chart('chart', JSON.parse(data.body));
});