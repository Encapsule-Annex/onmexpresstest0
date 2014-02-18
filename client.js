// client.js
// This JavaScript file is written in CommonJS format and transformed via
// the browserify plug-in for Grunt to /public/javascript/client.js for use
// in the browser.
//

var $ = require('jquery') // (window); <--- surprised this appears to be unnecessary based on StackOverflow articles.
var Promise = require('es6-promise').Promise;

var onmClient = require('onm-client-rest-api');

var onm = require('onm');
var scdl = require('onmd-scdl');


$(function() {

    var model = new onm.Model(scdl.DataModel);
    var store = new onm.Store(model);
    var baseURI = this.baseURI;
    console.log("Client-side HTML 5 application initialized.");


    onmClient.createStore(baseURI, "scdl").then(
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


    onmClient.getMeta(baseURI).then(
        function (response_) {
            console.log(response_);
        },
        function (error_) {
            console.error(error_.message);

        });

    onmClient.getModels(baseURI).then(
        function (response_) {
            console.log(response_);
        },
        function (error_) {
            console.error(error_.message);
        });

    onmClient.getStores(baseURI).then(
        function (response_) {
            console.log(response_);
        },
        function (error_) {
            console.error(error_.message);
        });


    onmClient.getAddresses(baseURI, "storeID", "scdl").then(
        function (data_) {
            console.log(response_);
        },
        function (error_) {
            console.error(error_.message);
        });

});

