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
var taskUrl = "https://flats.housing.com//api/v1/flat/PID/rent/quickview?source=web";

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
    		f.housingId = task;
    		f.floor_number = d.floor_number;
    		f.street_info = d.street_info;
    		f.age_of_property = d.age_of_property;
    		f.floor_count = d.floor_count;
    		f.apartment_type = d.inventory_configs[0].apartment_type;
    		f.property_type = d.inventory_configs[0].property_type;
    		f.area = d.inventory_configs[0].area;
    		f.number_of_bedrooms = d.inventory_configs[0].number_of_bedrooms;
    		f.number_of_toilets = d.inventory_configs[0].number_of_toilets;
    		f.facing = d.inventory_configs[0].facing;
    		f.furnish_type_id = d.inventory_configs[0].furnish_type_id;
    		f.price = d.inventory_configs[0].price;
    		f.security_deposit = d.inventory_configs[0].security_deposit;
    		f.brokerage = d.inventory_configs[0].brokerage;

    		f.water_supply_type = d.inventory_amenities.water_supply_type;
    		f.power_backup_type = d.inventory_amenities.power_backup_type;
    		f.security_type = d.inventory_amenities.security_type;
    		f.has_lift = d.inventory_amenities.has_lift;
    		f.has_swimming_pool = d.inventory_amenities.has_swimming_pool;
    		f.has_sports_facility = d.inventory_amenities.has_sports_facility;
    		f.has_kids_area = d.inventory_amenities.has_kids_area;
    		f.has_gym = d.inventory_amenities.has_gym;
    		f.has_garden = d.inventory_amenities.has_garden;
    		f.has_fridge = d.inventory_amenities.has_fridge;
    		f.has_ac = d.inventory_amenities.has_ac;
    		f.has_cupboard = d.inventory_amenities.has_cupboard;
    		f.brokerage = d.inventory_amenities.brokerage;
    		f.flat_status = d.status;
    		f.location_coordinates = d.location_coordinates;
    		f.gas_pipeline = d.society_amenities.has_gas_pipeline;
    		f.available_from=d.available_from;
    		console.log(JSON.stringify(f));
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