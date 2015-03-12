/**
 * Created by chandler on 3/10/15.
 */
var express = require('express');
var app = express();

app.use('/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/dist', express.static(__dirname + '/../dist'));
app.use('/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/partials', express.static(__dirname + '/public/partials'));
app.use('/modules', express.static(__dirname + '/public/modules'));
app.use('/services', express.static(__dirname + '/public/services'));

app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('public/index.html', { root: __dirname });
});

app.listen(3000, function() {
    console.log('Web Server is running')
}); //the port you want to use
