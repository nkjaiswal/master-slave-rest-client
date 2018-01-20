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

port = process.argv[2];
host = '127.0.0.1';
var server = app.listen(port, function(){
    console.log('Listening at http://' + host + ':' + port);    
});

var taskReceived = 0;
var count = 0;
var slaveUrl = "http://" + host + ":" + port;
var masterUrl = "http://127.0.0.1:3000/notify/" + port;
var taskUrl = "https://YourUrl/To/Fetch/Data/of/PID";

app.post("/",function(req,res){
	var task = req.body;
	
	taskReceived = task.length;
	count = 0;
	for(var i=0; i<taskReceived; i++){
		doTask(task[i],i);
	}
	res.writeHead(200, {
       	'Content-Type' : 'application/json'
    });
	res.end(JSON.stringify({message:'success'}));
});

var Client = require('node-rest-client').Client;
var clients = [new Client(),new Client(),new Client(),new Client(),new Client(),new Client(),new Client(),new Client(),new Client(),new Client()];
var masterClient = new Client();

function doTask(task,c){
	var req = clients[c%10].get(taskUrl.replace("PID",task),{},function(d,res){
    	if(res.statusCode == 200){
    		var f = {};
    		console.log(JSON.stringify(data));
    	}
    	count++;
    	if(count>=taskReceived)
    		notifyMaster();
    });
    req.on('requestTimeout', function (req) {
	    count++;
    	if(count>=taskReceived)
    		notifyMaster();
	});
	req.on('error', function (req) {
	    count++;
    	if(count>=taskReceived)
    		notifyMaster();
	});
	req.on('responseTimeout', function (req) {
	    count++;
    	if(count>=taskReceived)
    		notifyMaster();
	});
}

function notifyMaster(){
	var req = masterClient.get(masterUrl,{},function(data,res){
    	
    });
    req.on('requestTimeout', function (req) {
	    console.log("Master Connect Timeout Request");
	});
	req.on('error', function (req) {
	    console.log("Master Connect Error");
	});
	req.on('responseTimeout', function (req) {
	    console.log("Master Connect Timeout Response");
	});
}

notifyMaster();
