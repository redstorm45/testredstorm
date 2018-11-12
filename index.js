const http = require('http');
const url = require('url');
const querystring = require('querystring');

const PORT = process.env.port || 8080;

var server = http.createServer(function(req, res){
	var page = url.parse(req.url);
	var params = querystring.parse(page.query);

    if(page.pathname == '/'){
		res.writeHead(200, {"Content-Type": "text/plain"});
		res.write("This is a test project, with an API");
    }else if (page.pathname == '/api') {
		res.writeHead(200, {"Content-Type": "text/plain"});
		res.write('Hi, this is the API!');
	}else{
		res.writeHead(404, {"Content-Type": "text/plain"});
		res.write("This page was not found here");
	}
	res.end();
});
console.log('listening on port: '+PORT);
server.listen(PORT);

