
var onm = require('onm');
var scdlModel = new onm.Model(require('onmd-scdl').DataModel);
var scdlStore = new onm.Store(scdlModel);

var countCatalogues = 0;
var countCataloguesLimit = 25;

var addressCatalogueNew = scdlModel.createPathAddress("scdl.catalogues.catalogue");

exports.getMeta = function(req, res) {
    var packages = {};
    appJSON = require('../package.json');
    packages[appJSON.name] = appJSON;
    packages['onm'] = require('onm/package.json');
    packages['onmd-scdl'] = require('onmd-scdl/package.json');
    res.send(packages);
};

exports.getModel = function(req, res) {
    scdlModelDeclaration = require('onmd-scdl').DataModel;
    res.send(scdlModelDeclaration);
};

exports.getData = function(req, res) {
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