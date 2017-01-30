
/*
	This simple script copies the conf files used by the docker image locally and changes them a bit.
	The only change is to place the database location folder in all of them, in this way, we can also have
	a local configuration that can be used with the creation scripts and so on to create users and clients.

*/
var fs = require('fs');
console.log(JSON.stringify(process.argv));
if(process.argv.length >4){
  var originals = process.argv[2];
  var db = process.argv[3];
  var dest = process.argv[4];
  try{
	  var conf = require(originals+'/my-agile-ui-conf');
  }catch(e){
	  var conf = require(originals+'/agile-ui-conf');
  } 
  var core_conf = require(originals+'/agile-idm-core-conf');
  core_conf.storage.dbName = db;
  core_conf.policies.dbName = db+"policies.json";
  conf['token-storage'].dbName = db;
  fs.writeFileSync(dest+'/my-agile-ui-conf.js',"module.exports="+JSON.stringify(conf));
  fs.writeFileSync(dest+'/agile-idm-core-conf.js',"module.exports="+JSON.stringify(core_conf));
}
  


