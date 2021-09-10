'use strict';
const express = require('express');
const app = express();

app.get('/public/styles', function (req, res) {
    res.sendFile('/obb/public/styles/index.css', {root: __dirname});
});

app.get('/', function (req, res) {
    res.sendFile('/obb/index.html', {root: __dirname});
});

app.listen(3000);
