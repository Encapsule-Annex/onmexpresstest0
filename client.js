// client.js
// This JavaScript file is written in CommonJS format and transformed via
// the browserify plug-in for Grunt to /public/javascript/client.js for use
// in the browser.
//

var $ = require('jquery') // (window); <--- surprised this appears to be unnecessary based on StackOverflow articles.
var Promise = require('es6-promise').Promise;
var onm = require('onm');
var scdl = require('onmd-scdl');


var errorMessageFromjqXHR = function(jqXHR_, textStatus_, errorThrown_) {
    return "HTTP error " + jqXHR_.status + ". " + jqXHR_.statusText + ": " + jqXHR_.responseText;
}


var createAjaxRequestPromise = function(httpMethod_, relativeUrl_, dataObject_) {
    return new Promise( function(resolve_, reject_) {
        $.ajax({
            type: httpMethod_,
            url: relativeUrl_,
            cache: false,
            data: dataObject_,
            dataType: "json", // This is the expected return type
            success: function(data_) {
                resolve_(data_);
            },
            error: function(jqXHR_, textStatus_, errorThrown_) {
                reject_(new Error(errorMessageFromjqXHR(jqXHR_, textStatus_, errorThrown_)));
            }
        });
    });
}

// GET /meta
var getMeta = function() { return createAjaxRequestPromise("GET", "./meta"); }

// GET /models
var getModels = function() { return createAjaxRequestPromise("GET", "./models"); }

// GET /stores
var getStores = function() { return createAjaxRequestPromise("GET", "./stores"); }

// GET /addresses/:store?/:address?
var getAddresses = function(storeUuid_, addressHash_) {
    return createAjaxRequestPromise("GET", "./addresses", { store: storeUuid_, address: addressHash_ });
}

// GET /data/:store?/:address?
var getData = function(storeUuid_, addressHash_) {
    return createAjaxRequestPromise("GET", "./data", { store: storeUuid_, address: addressHash_});
}

// POST /create/store
var createStore = function(modelName_) {
    return createAjaxRequestPromise("POST", "./create/store", { model: modelName_ });
}

// POST /create/component
var createComponent = function(storeUuid_, addressHash_) {
    return createAjaxRequestPromise("POST", "./create/component", { store: storeUuid_, address: addressHash_ });
}

// POST /update/component
var updateComponent = function(storeUuid_, addressHash_, componentData_) {
    return createAjaxRequestPromise("POST", "./update/component", { store: storeUuid_, address: addressHash_, data: componentData_ });
}

// DELETE /remove/stores
var removeStores = function() {
    return createAjaxRequestPromise("DELETE", "./remove/stores");
}

// DELETE /remove/store
var removeStore = function(storeUuid_) {
    return createAjaxRequestPromise("DELETE", "./remove/store", { store: storeUuid_ });
}

// DELETE /remove/component
var removeComponent = function(storeUuid_, addressHash_) {
    return createAjaxRequestPromise("DELETE", "./remove/component", { store: storeUuid_, address: addressHash_ });
}



$(function() {

    var model = new onm.Model(scdl.DataModel);
    var store = new onm.Store(model);
    console.log("Client-side HTML 5 application initialized.");

    createStore("scdl").then(
        function (response_) {
            console.log(response_);
            removeStore(response_.storeKey).then(
                function (response_) {
                    console.log(response_);
                },
                function (error_) {
                    console.error(error_.message);
                });
        },
        function (error_) {
            console.error(error_.message)
        });


    getMeta().then(
        function (response_) {
            console.log(response_);
        },
        function (error_) {
            console.error(error_.message);

        });

    getModels().then(
        function (response_) {
            console.log(response_);
        },
        function (error_) {
            console.error(error_.message);
        });

    getStores().then(
        function (response_) {
            console.log(response_);
        },
        function (error_) {
            console.error(error_.message);
        });


    getAddresses("storeID", "scdl").then(
        function (data_) {
            console.log(response_);
        },
        function (error_) {
            console.error(error_.message);
        });

});

