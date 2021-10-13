'use strict';
const express  = require('express'),
  app          = express(),
helmet         = require('helmet'),
compression    = require('compression'),
favicon        = require('serve-favicon'),
pug            = require('pug'),
  renderIndex  = pug.compileFile('./views/index.pug'),
  renderCharts = pug.compileFile('./views/charts.pug'),
mariadb        = require('mariadb'),
  pool         = mariadb.createPool({
    socketPath: '/var/run/mysqld/mysqld.sock',
    user: 'root',
    database: 'bee_movie',
    connectionLimit: 5,
 }),
{ getData }    = require('./types/built/get-data.js'),
{ charts }     = require('./types/built/build-charts.js'),
preRender      = {};

getData(pool).then(data => {
    preRender.index = renderIndex(data);
    preRender.charts = renderCharts();
    charts.build(pool, data);
});

app.set('view engine', 'pug');
app.use(helmet());
app.use(compression());
app.use(favicon('./public/images/favicon.ico'));
app.use('/public', express.static('public'));
app.use('/public/highcharts', express.static('node_modules/highcharts'));

app.get('/', (_req, res) => res.send(preRender.index));
app.get('/charts(#*)?', (_req, res) => res.send(preRender.charts));
app.get('/charts/commentsPie', (_req, res) => res.send(charts.commentsPie));
app.get('/charts/commentsHeat', (_req, res) => res.send(charts.commentsHeat));
app.get('/charts/lettersColumn', (_req, res) => res.send(charts.lettersColumn));
app.get('/charts/repliesDependency', (_req, res) => res.send(charts.repliesDependency));
app.get('/charts/timeline', (_req, res) => res.send(charts.timeline));
app.get('/newest', (_req, res) => {
    res.redirect('https://www.reddit.com/r/AskOuija/comments/ofiegh/dam_i_forgot_the_entire_bee_movie_script_can_you/hemsuuz/?context=3');
});
app.get('/old.newest', (_req, res) => {
    res.redirect('https://old.reddit.com/r/AskOuija/comments/ofiegh/dam_i_forgot_the_entire_bee_movie_script_can_you/hemsuuz/?context=3');
});
app.get('*', (_req, res) => res.redirect('/'));

app.listen(3000);
