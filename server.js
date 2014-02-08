
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var models = require('./routes/models');
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

// this is where the errorHandler was

app.get('/', routes.index);
app.get('/users', user.list);

// API for experimenting with shared onm data store instances in node.js.
//
// 
// GET, and DELETE methods are idempotent.
// POST methods are not idempotent [1]

app.get('/meta', models.getAppMeta);                                          // GET a JSON container of information about this app.
app.get('/models', models.getModels);                                         // GET a JSON array containing this node's supported onm data models.
app.get('/stores', models.getStores);                                         // JSON array containing this node's memory-resident onm data stores.
app.get('/store/addresses/:store', models.getStoreAddresses);                 // GET a JSON array containing the specified onm data store's namespace addresses.
app.get('/store/addresses/:store/:address', models.getStoreAddresses);        // GET a JSON array containing the specified onm data store's namespace addresses starting at the specified address.
app.get('/store/data/:store', models.getStoreData);                           // GET the specifed onm data store's JSON serialization.
app.get('/store/data/:store/:address', models.getStoreData);                  // GET the specified onm data store's JSON serializaton starting at the specified address.
app.post('/store/create/:model', models.postCreateStore);                     // POST to create a new onm data store using the specified onm data model.
app.post('/store/data/:store/:address', models.postCreateComponent);          // POST to create a store store component at the specified unresolved address.
app.post('/store/data/:store/:address/:data', models.postNamespaceData);      // POST to overwrite the store component data at the specified address.
app.delete('/stores', models.deleteStores);                                   // DELETE all in-memory stores.
app.delete('/store/:store' , models.deleteStore);                             // DELETE the specified in-memory store.
app.delete('/store/:store/:address', models.deleteStore);                     // DELETE the specified data component in the indicated in-memory store.

// [1] there are some special cases where updating a component's
// data via POST is idempotent. Specifically, if onm namespace
// versioning is disabled, and there are no routines observing
// the target onm.Store, then the operation is idempotent.
// You're unlikely to encounter these outside of a test program.
// So just assume all POST methods are not idempotent.

// Chris moved the error handler down here.
// (might be wrong?)

// development only
//if ('development' == app.get('env')) {
app.use(express.errorHandler());
//}

http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
