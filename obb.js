'use strict';
const express = require('express');
const app = express();

app.set('view engine', 'pug');

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { message: 'Derp' })
    //res.sendFile('/obb/index.html', {root: __dirname});
});

app.get('*', (req, res) => res.redirect('/'));

app.listen(3000);
