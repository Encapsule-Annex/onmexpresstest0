// client.js
// This JavaScript file is written in CommonJS format and transformed via
// the browserify plug-in for Grunt to /public/javascript/client.js for use
// in the browser.
//

var $ = require('jquery') // (window); <--- surprised this appears to be unnecessary based on StackOverflow articles.
var Promise = require('es6-promise').Promise;
var onm = require('onm');
var scdl = require('onmd-scdl');


// GET /meta
var getMeta = function() {
    return new Promise( function(resolve_, reject_) {
        var req = new XMLHttpRequest();
        req.open('GET', './meta');
        req.onload = function() {
            if (req.status == 200) {
                resolve_(JSON.parse(req.response));
            } else {
                reject_(Error(req.statusText));
            }
        };
        req.onerror = function() {
            reject_(Error("Network Error!"));
        };
        req.send();
    });
}

// GET /models
var getModels = function() {
    return new Promise( function(resolve_, reject_) {
        var req = new XMLHttpRequest();
        req.open('GET', './models');
        req.onload = function() {
            if (req.status == 200) {
                resolve_(JSON.parse(req.response));
            } else {
                reject_(Error(req.statusText));
            }
        };
        req.onerror = function() {
            reject_(Error("Network Error!"));
        };
        req.send();
    });
}

// GET /stores
var getStores = function() {
    return new Promise( function(resolve_, reject_) {
        var req = new XMLHttpRequest();
        req.open('GET', './stores');
        req.onload = function() {
            if (req.status == 200) {
                resolve_(JSON.parse(req.response));
            } else {
                reject_(Error(req.statusText));
            }
        };
        req.onerror = function() {
            reject_(Error("Network Error!"));
        };
        req.send();
    });
}

// GET /addresses/:store?/:address?
var getAddresses = function(storeUuid_, addressHash_) {
    return new Promise( function(resolve_, reject_) {
        var req = new XMLHttpRequest();
        req.open('GET', './addresses');
        req.onload = function() {
            if (req.status == 200) {
                resolve_(JSON.parse(req.response));
            } else {
                reject_(Error(req.statusText));
            }
        };
        req.onerror = function() {
            reject_(Error("Network Error!"));
        };
        var params = {
            store: storeUuid_,
            address: addressHash_
        };
        req.send(params);
    });
}

// GET /data/:store?/:address?
var getData = function(storeUuid_, addressHash_) {
}

// POST /create/store/:model?
var createStore = function(modelName_) {
}

// POST /create/component/:store?/:address?
var createComponent = function(storeUuid_, addressHash_) {
}

// POST /update/component/:store?/:address?/:data?
var updateComponent = function(storeUuid_, addressHash_, componentData_) {
}

// DELETE /remove/stores
var removeStores = function() {
}

// DELETE /remove/store/:store?
var removeStore = function(storeUuid_) {
}

// DELETE /remove/component/:store?/:address?
var removeComponent = function(storeUuid_, addressHash_) {
}



$(function() {

    var model = new onm.Model(scdl.DataModel);
    var store = new onm.Store(model);
    console.log("Client-side HTML 5 application initialized.");

    getMeta().then(
        function (response_) {
            console.log(response_);
        },
        function (error_) {
            console.error(error_);

        });

    getModels().then(
        function (response_) {
            console.log(response_);
        },
        function (error_) {
            console.error(error_);
        });

    getStores().then(
        function (response_) {
            console.log(response_);
        },
        function (error_) {
            console.error(error_);
        });


    getAddresses("storeID", "scdl").then(
        function (response_) {
            console.log(response_);
        },
        function (error_) {
            console.error(error_);
        });

});

