'use strict';
const express = require('express');
const app = express();
const pug = require('pug');

app.set('view engine', 'pug');

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { message: 'Derp' });
});

app.get('*', (req, res) => res.redirect('/'));

app.listen(3000);
