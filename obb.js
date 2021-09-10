'use strict';
const express = require('express');
const app = express();

//load resources
app.use('/public', express.static('public'));

//send the actual page
app.get('/', function (req, res) {
    res.sendFile('/obb/index.html', {root: __dirname});
});

//redirects bad paths
app.get('*', function(req, res) {
    res.redirect('/');
});

app.listen(3000);
