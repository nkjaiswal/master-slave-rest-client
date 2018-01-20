var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());
var cookieSession = require('cookie-session')
app.set('trust proxy', 1)
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

port = 3000;
host = '127.0.0.1';
var server = app.listen(port, function(){
    console.log('Listening at http://' + host + ':' + port);    
});

var maxAssigned = 10;

var flatsJson = require("./flats.json");
var data = [];
for(var f=0; f<flatsJson.length; f++){
	if(flatsJson[f].flatId != "" || flatsJson[f].flatId != undefined || flatsJson[f].owner != "" || flatsJson[f].owner != undefined)
		data.push(flatsJson[f].flatId);
}

console.log("Available Flats",data.length);
app.get("/notify/:id",function(req,res){
	assignTask(req.params.id);
	res.end("RECVD_MASTER");
});

var Client = require('node-rest-client').Client;
var client = new Client();
var clientUrl = "http://127.0.0.1:"
function assignTask(workerPort){
	var temp = [];
	if(data.length<maxAssigned){
		console.log("DONE!!!")
		return;
	}
	for(var i=0; i<maxAssigned; i++){
		temp.push(data.pop());
	}
	var req = client.post(clientUrl+workerPort,{data:temp,headers: { "Content-Type": 'application/json'}},function(d,res){
		console.log(d.message,"Pending IDs",data.length);
	});
	req.on('requestTimeout', function (req) {
	    console.log("Client Connect Timeout Request", workerPort);
	});
	req.on('error', function (req) {
	    console.log("Client Connect Error",workerPort);
	});
	req.on('responseTimeout', function (req) {
	    console.log("Client Connect Timeout Response",workerPort);
	});
}