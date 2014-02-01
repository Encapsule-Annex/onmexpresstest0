
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var models = require('./routes/models');
var http = require('http');
var path = require('path');

var onm = require('onm');

var app = express();

// all environments
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 1031);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon(path.join(__dirname, 'public/images/ivory-dragon-16x16.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/data', models.getData);
app.get('/meta', models.getMeta);
app.get('/model', models.getModel);
app.post('/catalogue', models.postCatalogue);
app.post('/reset', models.postReset);


http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
