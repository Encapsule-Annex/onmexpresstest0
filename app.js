
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
app.get('/models', models.getModels);                                         // GET a JSON array containing this node's supported onm data models.
app.get('/stores', models.getStores);                                         // GET a JSON array containing this node's memory-resident onm data stores.
app.get('/store/addresses/:store', models.getStoreAddresses);                 // GET a JSON array containing the specified onm data store's namespace addresses.
app.get('/store/addresses/:store/:address', models.getStoreAddresses);        // GET a JSON array containing the specified onm data store's namespace addresses starting at the specified address.
app.get('/store/data/:store', models.getStoreData)                            // GET the specifed onm data store's JSON serialization.
app.get('/store/data/:store/:address', models.getStoreData);                  // GET the specified onm data store's JSON serializaton starting at the specified address.
app.post('/store/create/:model', models.postCreateStore);                     // POST to create a new onm data store using the specified onm data model. This API is _not_ idempotent.
app.post('/store/data/:store/:address', models.postCreateComponent);          // POST to create a store store component at the specified unresolved address. This method is _not_ idempotent.
app.post('/store/data/:store/:address/:data', models.postReplaceComponent);   // PUT to overwrite the store component data at the specified address. This method is idempotent iff the store is unobserved. Otherwise, it depends.
app.delete('/stores', models.deleteStores);                                   // DELETE all in-memory stores
app.delete('/store/:store' , models.deleteStore);                             // DELETE the specified in-memory store
app.delete('/store/:store/:address', models.deleteStore);                     // DELETE the specified data component in the indicated in-memory store.









// development only
//if ('development' == app.get('env')) {
app.use(express.errorHandler());
//}

http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
