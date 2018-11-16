const express = require('express');
const querystring = require('querystring');
const bodyParser = require('body-parser');
const {promisify} = require('util');
const fs = require('fs');

const readPromise = promisify(fs.readFile);
const writePromise = promisify(fs.writeFile);

const PORT = process.env.PORT || 8080;

var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var registered = [];

readPromise('./registered.json', {encoding: 'utf-8'}).then(loadRegister).catch(function(err){
	if(err.code == 'ENOENT'){
		makeDefault();
		saveRegister();
	}else{
		console.log(err.error);
	}
});

function makeDefault(){
	var token = registerHook('DEFAULT', '127.0.0.1')
	console.log('created DEFAULT token:'+token);
}

function loadRegister(data){
	if(registered.filter(e => e.name == 'DEFAULT').size() == 0){
		makeDefault();
    }
}

function saveRegister(){
	writePromise('./registered.json', JSON.stringify(registered), {encoding: 'utf-8'}).then(function(){
		console.log('Saved registered.json');
	});
}

function acceptedToken(token){
	registered.map(e => e.token).includes(token);
}

function getNewToken(){
	var token = null;
	do {
		token = Array.apply(null, Array(8)).map(e => {
			return Math.random().toString(36).substring(2, 12);
		}).join('');
	}while(acceptedToken(token)); // token already exists
	return token;
}

function registerHook(name, endpoint){
	var tok = getNewToken();
	registered.push({
		token: tok,
		name: name,
		endpoint: endpoint,
	});
	console.log('registering new hook: '+name+" at: "+endpoint);
	saveRegister();
	return tok;
}

function listHooks(){
	console.log('listing hooks');
	return registered.filter(e => e.name != 'DEFAULT').map(function(e){
		return {
			name: e.name,
			endpoint: e.endpoint,
		}
	});
}

function deleteHook(tok){
	var l = registered.filter(e => e.token == tok);
	if(l){
		console.log('deleting hook of: '+l[0].name);
		registered = registered.filter(e => e.token != tok);
		saveRegister();
	}
}

app.get('/', function (req, res) {
	res.send('This is a test project, with an API');
});

app.get('/api', function (req, res) {
	res.send('Hi, this is the API!');
});

app.post('/api', urlencodedParser, function (req, res) {
	// Prepare output in JSON format
	var response = {}
	if('action' in req.body && req.body.action == "register"){
		if('endpoint' in req.body && 'name' in req.body && 'key' in req.body && acceptedToken(req.body.key)){
			var token = registerHook(req.body.name, req.body.endpoint);
			response = {
				'error': null,
				'token': token,
			};
		}else{
			response.error = "Bad register request";
		}
	}else if('action' in req.body && req.body.action == "list"){
		if('key' in req.body && acceptedToken(req.body.key)){
			response = {
				'error': null,
				'hooks': listHooks(),
			};
		}else{
			response.error = "Bad list request";
		}
	}else if('action' in req.body && req.body.action == "remove"){
		if('key' in req.body && acceptedToken(req.body.key)){
			deleteHook(req.body.key);
			response = {
				'error': null,
			};
		}else{
			response.error = "Bad list request";
		}
	}
	res.end(JSON.stringify(response));
});

var server = app.listen(PORT, function () {
	var host = server.address().address
	var port = server.address().port
   
	console.log("Example app listening at http://%s:%s", host, port)
})


