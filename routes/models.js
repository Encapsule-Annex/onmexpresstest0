
var onm = require('onm');
var uuid = require('node-uuid');

var public = {};
public.models = {};
public.models['scdl'] = {
    model: new onm.Model(require('onmd-scdl').DataModel),
    package: require('onmd-scdl/package.json')
};

public.stores = {};



var scdlModel = new onm.Model(require('onmd-scdl').DataModel);
var scdlStore = new onm.Store(scdlModel);

var countCatalogues = 0;
var countCataloguesLimit = 5;

var addressCatalogueNew = scdlModel.createPathAddress("scdl.catalogues.catalogue");

exports.getAppMeta = function(req, res) {
    var packages = {};
    appJSON = require('../package.json');
    packages[appJSON.name] = appJSON;
    packages['onm'] = require('onm/package.json');
    packages['onmd-scdl'] = require('onmd-scdl/package.json');
    res.send(packages);
};

exports.getScdlModel = function(req, res) {
    scdlModelDeclaration = require('onmd-scdl').DataModel;
    res.send(scdlModelDeclaration);
};

exports.getCatalogueData = function(req, res) {
    res.send(scdlStore.implementation.dataReference);
};

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
        res.send(404, "No such store '" + req.params.store + "' on this server.");
    } else {
        var address = req.params.address || "0";
        var message = "getStoreAddress('" + req.params.store + "', '" + address + "')";
        res.send(200, message);
    }
};

exports.getStoreData = function(req, res) {
    var store = public.stores[req.params.store];
    if (store === void 0) {
        res.send(404, "No such store '" + req.params.store + "' on this server.");
    } else {
        var address = req.params.address || store.model.jsonTag;
        console.log("attempting to open '" + req.params.store + "::" + address + "'.");
        res.send(200, store.implementation.dataReference);
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

exports.postCreateComponent=  function(req, res) {
    res.send(501);
};

exports.putComponentData = function(req, res) {
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