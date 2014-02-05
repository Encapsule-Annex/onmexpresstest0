
var onm = require('onm');
var uuid = require('node-uuid');

var public = {};
public.models = {};
public.models['scdl'] = {
    model: new onm.Model(require('onmd-scdl').DataModel),
    package: require('onmd-scdl/package.json')
};

public.stores = {};

exports.getAppMeta = function(req, res) {
    var packages = {};
    appJSON = require('../package.json');
    packages[appJSON.name] = appJSON;
    packages['onm'] = require('onm/package.json');
    packages['onmd-scdl'] = require('onmd-scdl/package.json');
    res.send(packages);
};

// deprecated
exports.getScdlModel = function(req, res) {
    scdlModelDeclaration = require('onmd-scdl').DataModel;
    res.send(scdlModelDeclaration);
};

// depracated
exports.getCatalogueData = function(req, res) {
    res.send(scdlStore.implementation.dataReference);
};

// deprecated
exports.postCatalogue = function(req, res) {
    if (countCatalogues >= countCataloguesLimit) {
        var model = addressCatalogueNew.getModel();
        var message = "The server-imposed limit of " + countCataloguesLimit +
            " " + model.jsonTag + " objects has been reached.";
	res.send(503, message);
    }
    var namespaceCatalogue = scdlStore.createComponent(addressCatalogueNew);
    var addressCatalogue = namespaceCatalogue.getResolvedAddress();
    var modelCatalogue = addressCatalogue.getModel();
    var dataObject = {};
    dataObject[modelCatalogue.jsonTag] = namespaceCatalogue.implementation.dataReference;
    res.send(dataObject);
    countCatalogues++;
    console.log("... created object " + namespaceCatalogue.getResolvedAddress().getHashString());
};

// deprecated
exports.postReset = function(req, res) {
    var addressCatalogues = scdlModel.createPathAddress("scdl.catalogues");
    var namespaceCatalogues = scdlStore.openNamespace(addressCatalogues);
    namespaceCatalogues.visitExtensionPointSubcomponents( function (address) {
        console.log("... removed object " + address.getHashString());
        scdlStore.removeComponent(address);
    });
    countCatalogues = 0;
    res.send(scdlStore.implementation.dataReference);
};


// NEW STUFF

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

exports.getStoreAddresses = function(req, res) {
    var store = public.stores[req.params.store];
    if (store === void 0) {
        res.send(404, "Data store '" + req.params.store + "' does not exist.");
    } else {
        var addressHash = req.params.address || store.model.jsonTag;
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
            result[req.params.store] = addresses;

            res.send(200, result);



	} catch (exception) {
            res.send(412, exception);
	}
    }
};

exports.getStoreData = function(req, res) {
    var store = public.stores[req.params.store];
    if (store === void 0) {
        res.send(404, "No such store '" + req.params.store + "' on this server.");
    } else {
        var addressHash = req.params.address || store.model.jsonTag;
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


exports.postCreateStore = function(req, res) {
    var onmDataModel = public.models[req.params.model].model;
    if (onmDataModel === void 0) {
        res.send(403, "The specified onm data model '" + req.params.model + "' is unsupported by this server.");
    } else {
        console.log("jsonTag = " + onmDataModel.jsonTag );
        var storeUuid = uuid.v4();
        var store = public.stores[storeUuid] = new onm.Store(onmDataModel);
        var storeRecord = {
            dataModel: store.model.jsonTag,
            storeKey: storeUuid
	};
        res.send(200, storeRecord);
    }
};

exports.postCreateComponent = function(req, res) {
    var store = public.stores[req.params.store];
    if (store === void 0) {
        res.send(404);
    } else {
        var addressHash = req.params.address || store.model.jsonTag;
        var address = undefined
        try {
            address = store.model.createAddressFromHashString(addressHash);
            var namespace = store.createComponent(address)
            var namespaceRecord = {};
            namespaceRecord['uri'] = namespace.getResolvedAddress().getHashString();
            namespaceRecord[address.getModel().jsonTag] = namespace.implementation.dataReference;
            res.send(200, namespaceRecord);

	} catch (exception) {
            res.send(412, exception);
	}
    }
};

exports.postReplaceComponent = function(req, res) {
    res.send(200, "putComponentData");
};

exports.deleteStores = function(req, res) {
    for (storeKey in public.stores) {
        console.log("deleting in-memory data store '" + storeKey + "'.");
        delete public.stores[storeKey];
    }
    res.send(204);
};

exports.deleteStore = function(req, res) {
    var store = public.stores[req.params.store];
    if (store === void 0) {
        res.send(404);
    } else {
        if (req.params.address === void 0) {
            console.log("deleting in-memory data store '" + store + "'.");
            delete public.stores[req.params.store];
            res.send(204);
        } else {
            res.send(501);
	}
    }
};