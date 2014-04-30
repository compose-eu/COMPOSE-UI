
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var configData = require('./config');

// vars for different JADE-Files to render for requesting Browser
var createso = require('./routes/createso');
var subscribetoso = require('./routes/subscribetoso');
var subscribetocso = require('./routes/subscribetocso');
var updatesensordata = require('./routes/updatesensordata');
var getso = require('./routes/getso');
var getallsos = require('./routes/getallsos');
var subscriptionUpdatesReceiver = require('./routes/subscriptionUpdatesReceiver');
var createcso = require('./routes/createcso');

// functional requires
var CompositeServiceObject = require('./valueObjects/CompositeServiceObject');

var http = require('http');
var path = require('path');

var app = express();

var port = 3000;

for (var i = 0; i < process.argv.length; i++) {
	// the first argument after the -port is the new Port
	if(process.argv[i] == "-port") {
		port = process.argv[(i+1)];
	}
	// the first argument after -apitok is the new API-TOKEN
	if(process.argv[i] == "-apitoken") {
		configData.setApiKey( process.argv[(i+1)] );
	}
};


// all environments
app.set('port', process.env.PORT || port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*
// enalbe CORS 
app.all('/showupdatesubscription', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "testbed.compose-project.eu");
	res.header("Access-Control-Allow-Methods", "GET");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, Authorization");
	res.header("Access-Control-Allow-Credentials", true);
	next();
});
*/

// Index-Page | Homepage
app.get('/', routes.index);
// the scheme is /creatso = url appendix,
// createso.create = JS-file in dir routes followed by
// "." method wich is an exported function as entry point
// to create a service object
app.get('/createso/*', createso.create);
// to subcripe to a service object stream
app.get('/subscribetoso', subscribetoso.subscribe);
// to update sensor data of an stream in an service object
app.get('/updatesensordata', updatesensordata.update);
// to get a specific service object 
app.get('/getso/*', getso.show);
// to get all service objects
app.get('/getallsos/*', getallsos.show);
// to receive the subscription updates
app.get('/subscriptionUpdatesReceiver/*', subscriptionUpdatesReceiver.receive);

// ----------------- COMPOSITE SERVICE OBJECTS

app.get('/createcso/*', createcso.create);
app.get('/subscribetocso/*', subscribetocso.subscribe);


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

/*****************************************************************************
------------------------ COMPOSER BASED CONFIGURATIONS -----------------------
*****************************************************************************/
var RED = require("node-red");

// Create the settings object
var settings = {
	// path to find and load the nodes in the nodes directory
	httpRoot: "/red",
	// route to access the Composer UI
    httpAdminRoot:"/composer",
    // root url for nodes that provide HTTP endpoints. Default: ‘/’
    httpNodeRoot: "/api",
    // userDir must be empty / default otherwise the nodes 
    // nodes wouldn't be loaded 						<<<< FIX ME ( WHY ??? - ASK IN IRC )
    userDir:"" // /home/nol/.nodered/
};

// Initialise the runtime with a server and settings
RED.init(server,settings);

// Serve the editor UI from /red
app.use(settings.httpAdminRoot,RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot,RED.httpNode);

/* ----->>> NEED TO CONVERT ALL SO's BEFORE CALL RED.start() OR USES MANUALLY RE_INITIALLYZE NODES <<<----- */
var initialConvertAllSOs = function() {
	getallsos.convertAll();
}();

// Start the runtime
RED.start();