
var onm = require('onm');
var scdlModel = new onm.Model(require('onmd-scdl').DataModel);
var scdlStore = new onm.Store(scdlModel);

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
    var namespaceCatalogue = scdlStore.createComponent(addressCatalogueNew);
    res.send(namespaceCatalogue.implementation.dataReference);
    console.log("... created object " + namespaceCatalogue.getResolvedAddress().getHashString());
};

exports.postReset = function(req, res) {
    var addressCatalogues = scdlModel.createPathAddress("scdl.catalogues");
    var namespaceCatalogues = scdlStore.openNamespace(addressCatalogues);
    namespaceCatalogues.visitExtensionPointSubcomponents( function (address) {
        console.log("... removed object " + address.getHashString());
        scdlStore.removeComponent(address);
    });
    res.send(scdlStore.implementation.dataReference);
};