/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var onmApi = require('./routes/onm-api');
var http = require('http');
var path = require('path');

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

app.get('/', routes.index);

// API for experimenting with shared onm data store instances in node.js.
//
// 
// GET, and DELETE methods are idempotent.
// POST methods are not idempotent [1]

app.get('/meta', onmApi.getAppMeta);                                              // GET a JSON container of information about this app.
app.get('/models', onmApi.getModels);                                             // GET a JSON array containing this node's supported onm data models.
app.get('/stores', onmApi.getStores);                                             // GET a JSON array containing this node's memory-resident onm data stores.
app.get('/addresses/:store?/:address?', onmApi.getStoreAddresses);                // GET a JSON array containing all the addresses in the specified store starting at the given address.
app.get('/data/:store?/:address?', onmApi.getStoreData);                          // GET a JSON object containing the serialized contents of the specified store namespace.
app.post('/create/store/:model?', onmApi.postCreateStore);                        // POST to create a new onm data store using the specified onm data model.
app.post('/create/component/:store?/:address?', onmApi.postCreateComponent);      // POST to create a store store component at the specified unresolved address.
app.post('/update/component/:store?/:address?/:data?', onmApi.postNamespaceData); // POST to overwrite the store component data at the specified address.
app.delete('/remove/stores', onmApi.deleteStores);                                // DELETE all in-memory stores.
app.delete('/remove/store/:store?' , onmApi.deleteStore);                         // DELETE the specified in-memory store.
app.delete('/remove/component/:store?/:address?', onmApi.deleteStore);            // DELETE the specified data component in the indicated in-memory store.

// [1] there are some special cases where updating a component's
// data via POST is idempotent. Specifically, if onm namespace
// versioning is disabled, and there are no routines observing
// the target onm.Store, then the operation is idempotent.
// You're unlikely to encounter these outside of a test program.
// So just assume all POST methods are not idempotent.

// development only
//if ('development' == app.get('env')) {
app.use(express.errorHandler());
//}

http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
