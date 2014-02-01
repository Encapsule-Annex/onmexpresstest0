
/*
 * GET home page.
 */

exports.index = function(req, res){
  appJSON = require('../package.json');
  res.render('index', { 
      title: appJSON.name + ' v' + appJSON.version,
      description: appJSON.description
 });
};