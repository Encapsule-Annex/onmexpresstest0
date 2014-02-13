
var onm = require('onm');
var uuid = require('node-uuid');

var public = {};
public.models = {};
public.models['scdl'] = {
    model: new onm.Model(require('onmd-scdl').DataModel),
    package: require('onmd-scdl/package.json')
};

public.stores = {};

// Keep this. Reconnect with some consideration to naming.
exports.getAppMeta = function(req, res) {
    var packages = {};
    appJSON = require('../package.json');
    packages[appJSON.name] = appJSON;
    packages['onm'] = require('onm/package.json');
    packages['onmd-scdl'] = require('onmd-scdl/package.json');
    res.send(packages);
};

// Enumerate the onm data models supported by this node instance.
// Use the data model to create an onm store via POST /store/create/:model
//
// app.get('/models', models.getModels);
//
exports.getModels = function(req, res) {
    var models = [];
    for (modelName in public.models) {
        var modelRecord = {
            modelName: modelName,
            modelPackage: public.models[modelName].package
	};
        models.push(modelRecord);
    };
    res.send(200, models);
};


// Enumerate the in-memory onm stores managed by this node instance.
//
// app.get('/stores', models.getStores);
//
exports.getStores = function(req, res) {
    var stores = [];
    for (key in public.stores) {
        var storeRecord = {
            dataModel: public.stores[key].model.jsonTag,
            storeKey: key
	};
        stores.push(storeRecord);
    }
    res.send(200, stores);
};

// Traverse the namespace structure of the specified store starting at the given
// address (or the root address of the store if unspecified). Return an array of
// onm.Address hash strings for each namespace.
//
// app.get('/addresses/:store?', models.getStoreAddresses);
// app.get('/addresses/:store?/:address?', models.getStoreAddresses);
//
exports.getStoreAddresses = function(req, res) {
    var store = public.stores[req.query.store];
    if ((store == null) || !store) {
        res.send(404, "Data store '" + req.query.store + "' does not exist.");
    } else {
        var addressHash = req.query.address || store.model.jsonTag;
        address = undefined
        try {
            address = store.model.createAddressFromHashString(addressHash);
            var namespace = store.openNamespace(address);
            
            var addresses = [];

            var processNamespace = function (address_) {
                addresses.push(address_.getHashString());
                var model = address_.getModel();
                if (model.namespaceType === "extensionPoint") {
                    var namespace = store.openNamespace(address_);
                    namespace.visitExtensionPointSubcomponents( function(address_) {
                        processNamespace(address_);
		    });

		} else {
                    address_.visitChildAddresses( function(address_) {
                        processNamespace(address_);
                    });
		}
	    };
            processNamespace(address);
            var result = {};
            result[req.query.store] = addresses;
            res.send(200, result);
	} catch (exception) {
            res.send(412, exception);
	}
    }
};

// Retrieve the JSON serialization of the given store, or the serialization of
// the given sub-namespace of the store (if specified).
//
// app.get('/data/:store?', models.getStoreData);
// app.get('/data/:store?/:address?', models.getStoreData);
//
exports.getStoreData = function(req, res) {
    var store = public.stores[req.query.store];
    if ((store == null) || !store) {
        res.send(404, "No such store '" + req.query.store + "' on this server.");
    } else {
        var addressHash = req.query.address || store.model.jsonTag;
        var address = undefined;
        try {
            address = store.model.createAddressFromHashString(addressHash);
            var namespace = store.openNamespace(address);
            var data = {};
            data[address.getModel().jsonTag] = namespace.implementation.dataReference;
            res.send(200, data);
	} catch (exception) {
            res.send(412, exception);
	}
    }
};

// Create a new in-memory data store instance using the the indicated onm data model.
//
// app.post('/create/store', models.postCreateStore);
//
exports.postCreateStore = function(req, res) {
    if (!req._body || (req.body == null) || !req.body) {
        res.send(400, "Invalid POST missing required request body.");
        return;
    }
    if ((req.body.model == null) || !req.body.model) {
        res.send(400, "Invalid POST missing 'model' property in request body.");
        return;
    }
    var onmDataModelRecord = public.models[req.body.model];
    if ((onmDataModelRecord == null) || !onmDataModelRecord || (onmDataModelRecord.model == null) || !onmDataModelRecord.model) {
        res.send(403, "The specified onm data model '" + req.body.model + "' is unsupported by this server.");
        return;
    }
    var storeUuid = uuid.v4();
    var store = public.stores[storeUuid] = new onm.Store(onmDataModelRecord.model);
    var storeRecord = {
       dataModel: store.model.jsonTag,
        storeKey: storeUuid
    }
    console.log("created in-memory data store '" + storeUuid + "'.");
    res.send(200, storeRecord);
};

// Create a new component data resource in the indicated store using the specified
// address hash to indicate the specific component to create.
//
// app.post('/create/component', models.postCreateComponent);
//
exports.postCreateComponent = function(req, res) {
    if (!req._body || (req.body == null) || !req.body) {
        res.send(400, "Invalid POST missing required request body.");
        return;
    }
    if ((req.body.store == null) || !req.body.store) {
        res.send(400, "Invalid POST mising 'store' property in request body.");
        return;
    }
    if ((req.body.address == null) || !req.body.address) {
        res.send(400, "Invalid POST missing 'address' property in request body.");
        return;
    }

    var store = public.stores[req.body.store];
    if ((store == null) || !store) {
        res.send(404, "The specified onm data store '" + req.body.store + "' does not exist on this server.");
        return;
    }
    var address = undefined
    try {
        address = store.model.createAddressFromHashString(req.body.address);
    } catch (exception) {
        console.error(exception);
        res.send(403, "Invalid address '" + req.body.address + "' is outside of the data model's address space.");
        return;
    }
    try {
        var namespace = store.createComponent(address)
        var namespaceRecord = {};
        namespaceRecord['address'] = namespace.getResolvedAddress().getHashString();
        namespaceRecord[address.getModel().jsonTag] = namespace.implementation.dataReference;
        res.send(200, namespaceRecord);
    } catch (exception) {
        res.send(412, exception);
    }
};

// Overwrite a specific data component in a specific store.
//
// app.post('/store/data', models.postNamespaceData);
//
exports.postUpdateNamespaceData = function(req, res) {
    if (!req._body || (req.body == null) || !req.body) {
        res.send(400, "Invalid POST missing required request body.");
        return;
    }
    if ((req.body.store == null) || !req.body.store) {
        res.send(400, "Invalid POST mising 'store' property in request body.");
        return;
    }
    if ((req.body.address == null) || !req.body.address) {
        res.send(400, "Invalid POST missing 'address' property in request body.");
        return;
    }
    if ((req.body.data == null) || !req.body.data) {
        res.send(400, "Invalid POST missing 'data' property in request body.");
        return;
    }

    var store = public.stores[req.body.store];
    if ((store == null) || !store) {
        res.send(404, "The specified onm data store '" + req.body.store + "' does not exist on this server.");
        return;
    }

    var address = undefined;
    try {
        address = store.model.createAddressFromHashString(req.body.address);
    } catch (exception) {
        console.error(exception);
        res.send(403, "Invalid address '" + req.body.address + "' is outside of the data model's address space.");
        return;
    }

    var namespace = undefined
    try {
        namespace = store.openNamespace(address);
    } catch (exception) {
        console.error(exception);
        res.send(404, "Data component '" + req.body.address + "' does not exist in store '" + req.body.store + "'.");
        return;
    }

    try {
        namespace.fromJSON(req.body.data);
    } catch (exception) {
        console.error(exception);
        res.send(400, "Unable to de-serialize JSON data in request.");
        return;
    }

    res.send(204);
};

// Delete all in-memory onm data stores. Expose w/caution.
//
// app.delete('/stores', models.deleteStores);
//
exports.deleteStores = function(req, res) {
    for (storeKey in public.stores) {
        console.log("deleting in-memory data store '" + storeKey + "'.");
        delete public.stores[storeKey];
    }
    res.send(204);
};

// Delete the named onm data store. Or, if an address is specified delete
// the addressed data component in the given store instead.
//
// app.delete('/store/:store' , models.deleteStore);
// app.delete('/store/:store/:address', models.deleteStore);
// 
exports.deleteStoreOrComponent = function(req, res) {
    if (!req._body || (req.body == null) || !req.body) {
        res.send(400, "Invalid POST missing required request body.");
        return;
    }
    if ((req.body.store == null) || !req.body.store) {
        res.send(400, "Invalid POST missing 'store' property in request body.");
        return;
    }
    var store = public.stores[req.body.store];
    if ((store == null) || !store) {
        res.send(404, "The specified onm data store '" + req.body.store + "' does not exist on this server.");
        return;
    }
    // Delete the store if an address was not specified in the request body.
    if ((req.body.address == null) || !req.body.address) {
        console.log("deleting in-memory data store '" + req.body.store + "'.");
        delete public.stores[req.body.store];
        res.send(204);
        return;
    }
    // Attempt to delete the specified data component.
    var addressHash = req.body.address
    var address = undefined
    try {
        address = store.model.createAddressFromHashString(addressHash);
    } catch (exception) {
        console.error(exception);
        res.send(403, "Invalid address '" + req.body.address + "' is outside of the data model's address space.");
        return;
    }
    try {
        store.removeComponent(address);
        console.log("removed data component '" + addressHash + "' from in-memory store '" + req.body.store + "'.");
        res.send(204);
    } catch (exception) {
        res.send(412, exception);
    }
};