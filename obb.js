'use strict';
const express = require('express');
const app = express();

app.use('/public', express.static('public'))

app.get('/', function (req, res) {
    res.sendFile('/obb/index.html', {root: __dirname});
});

app.listen(3000);
