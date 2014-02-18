/**
 * Module dependencies.
 */

"use strict";

var onm = require('onm');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

var onmModelDictionary = {};
var onmStoreDictionary = {};

onmModelDictionary['scdl'] = {
    model: new onm.Model(require('onmd-scdl').DataModel),
    package: require('onmd-scdl/package.json')
};

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

app.get('/', routes.index);

var onmRoutes = require('onm-server-rest-routes')(app, null, onmModelDictionary, onmStoreDictionary);
onmRoutes.registerRoute_GetAppMeta();
onmRoutes.registerRoute_GetModels();
onmRoutes.registerRoute_GetStores();
onmRoutes.registerRoute_GetStoreAddresses();
onmRoutes.registerRoute_GetStoreData();
onmRoutes.registerRoute_PostCreateStore();
onmRoutes.registerRoute_PostCreateComponent();
onmRoutes.registerRoute_PostUpdateComponent();
onmRoutes.registerRoute_DeleteRemoveStores();
onmRoutes.registerRoute_DeleteRemoveStore();
onmRoutes.registerRoute_DeleteRemoveComponent();

app.use(express.errorHandler());

http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
