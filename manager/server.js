
/**
 * Module dependencies.
 */

var express = require('express');

var http = require('http');
var path = require('path');
var querystring = require('querystring');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('hostname', "193.174.152.236");
app.set('compose', "api.servioticy.com");
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// enalbe CORS
app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "PUT");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();

});

// Index-Page | Homepage
app.get('/', function(req, res){
  res.sendfile(__dirname + '/public/index.html');
});

app.get('/subscriptionUpdate/:id/:stream', function(req, res){
	//We don't know what kind of structure we will get back, so let's support gyroscope & location
	var soID = req.params.id;
	var stream = req.params.stream;
	console.log("ID: " + soID + " , Streamname: " + stream);
	if(stream === "location"){
		var latitude = req.query.latitude;
		var longitude = req.query.longitude;
		console.log("GEO: " + latitude + " , " + longitude);
		// io.sockets.on('connection', function (socket) {
		// 	socket.broadcast.to(soID).emit('updateSO', {latitude: latitude, longitude: longitude});
		// });
		io.sockets.in(soID).emit('updateSO', JSON.stringify({latitude: latitude, longitude: longitude}));
	}else if(stream === "orientation"){
		var x = req.query.x;
		var y = req.query.y;
		var z = req.query.z;
		console.log("Gyro: " + x + " , " + y + " , "+z);
		io.sockets.in(soID).emit('updateSO', {x: x, y: y, z:z});		
	}
	//console.log(req);
});

//Subscription
io.sockets.on('connection', function (socket) {
  socket.on('subscribe', function (data, fn) {
  	//For each ID we are creating a room => if N clients are subscriped to the same room everyone gets the update via broadcast
  	//each ID = room
  	//Client joins room with Smart Object ID
  	socket.join(data.soID);
  	fn("joined Room: " + data.soID);
  	//Create subscription JSON object
  	var composeURL = "http://"+app.get('compose');
  	var destPath = "/"+ data.soID+"/streams/"+data.streamName+"/subscriptions/";
	var host = "http://"+app.get("hostname")+":"+app.get("port");
  	var subscriptionURL = host + "/subscriptionUpdate/"+data.soID+"/"+data.streamName; //<host>:<port>/subscriptionUpdate/<smartObject ID ? <channels>
  	if(data.streamName == "location"){
  	//Create JSON for GPS Sensor updates
  		var postJSON = JSON.stringify(
  			{"callback": "http", 
		    "destination": subscriptionURL+"?latitude=@latitude@&longitude=@longitude@", 
			"customFields": { 
			"aliases": [ 
			    { "##": "{$.channels.", "!!": ".current-value}" }, 
			    {"@latitude@": "##latitude!!"}, 
			    {"@longitude@": "##longitude!!"} 
			], 
			"method":"GET" 
		    } 
		});
		//TODO: Post Data to Compose
	    var options = {
	        host: app.get('compose'),
/*	        port: 80,
*/	        path: destPath,
	        headers:{
	        	'Authorization':"API-key", //demoaccount
	        	'Accept': 'application/json',
	        	'Content-Type': 'application/json'
	        },
	        method: 'POST',
	    };
	    //Call to Compose
	    console.log("debug - Starting Subscriptions!");
	    var req = http.request(options, function(res) {
		  res.setEncoding('utf8');
		  res.on('data', function (chunk) {
		    console.log('debug - BODY: ' + chunk);
		  });
		});
		console.log("debug - Writing Data!");
		req.write(postJSON);
		console.log("debug - End of POST Call Subscription URL: " + subscriptionURL);
		req.end();

  	}else if(data.streamName == "orientation"){
  	 //create JSON for Gyroscope updates
  		var postJSON = JSON.stringify({
		    "callback":"http", 
		    "destination": subscriptionURL+"?x=@x@&y=@y@&z=@z@", 
		    "customFields": { 
		        "aliases": [ 
		            { "##": "{$.channels.", "!!": ".current-value}" }, 
		            {"@x@": "##x!!"}, 
		            {"@y@": "##y!!"},
		            {"@z@": "##z!!"},
		        ], 
		        "method":"GET" 
		    } 
		});	
		//TODO: Post Data to Compose
	    var options = {
	        host: app.get('compose'),
/*	        port: 80,
*/	        path: destPath,
	        headers:{
	        	'Authorization':"API-key",
	        	'Accept': 'application/json',
	        	'Content-Type': 'application/json'
	        },
	        method: 'POST',
	    };
	    //Call to Compose
	    var req = http.request(options, function(res) {
		  //console.log('STATUS: ' + res.statusCode);
		  //console.log('HEADERS: ' + JSON.stringify(res.headers));
		  res.setEncoding('utf8');
		  res.on('data', function (chunk) {
		    console.log('BODY: ' + chunk);
		  });
		});
		console.log("debug - Writing Data!");
		req.write(postJSON);
		console.log("debug - End of POST Call Subscription URL: " + subscriptionURL);
		req.end();
  	}

  });
});


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
//server.js
