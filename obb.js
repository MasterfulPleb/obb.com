'use strict';
const express = require('express');
const app = express();

app.get('/', function (req, res) {
    res.sendFile('/obb/content/index.html', {root: __dirname});
});

app.listen(3000);
