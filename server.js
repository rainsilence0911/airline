/**
 * Input http://localhost:8080/[lession1.html]
 * 
 * Except html,js,image file, other type file is prohibited.
 */
var http = require("http");
var fs = require("fs");
var url = require("url");
var zlib = require("zlib");

var mimeTypeList = [
    {suffix: ".js", type: "application/x-javascript"},
    {suffix: ".gif", type: "image/gif"},
    {suffix: ".txt", type: "text/plain"},
    {suffix: ".png", type: "image/png"},
    {suffix: ".jpg", type: "image/jpeg"},
    {suffix: ".jpeg", type: "image/jpeg"},
    {suffix: ".json", type: "text/plain"},
    {suffix: ".html", type: "text/html"},
    {suffix: ".htm", type: "text/html"},
];

var expiresConfig = {
	fileMatch: /^(.gif|.png|.jpg|.js|.css)$/ig,
	maxAge: 60 * 60 * 24 * 365
};

var pagePrefix = "page/";

/**
 * Judge whether the file is js/image file.
 */
function parseMimeType(pathName) {
	
	for (var index = 0; index < mimeTypeList.length; index++) {
		var suffix = mimeTypeList[index].suffix;
		if (pathName.lastIndexOf(suffix) == pathName.length - suffix.length) {
			return mimeTypeList[index];
		}
	}
	return null;
}

/**
 * Http Server handler.
 */
var proxy = http.createServer(function(req, res) {
	
	var urlInfo = url.parse(req.url, true);
	
	var pathName = urlInfo.pathname;
	
	var mimeType = parseMimeType(pathName);
	
	if (mimeType == null) {
		res.writeHead(404, {"Content-Type": "text/plain"});
		res.write("404 Not found");
		res.end();
		return;
	}
	
	var fileName = null;
	
	if (mimeType.type == "text/html") {
		
		var index = pathName.lastIndexOf("/");
		
		if (index != -1) {
			fileName = pathName.substring(index);
		}
		
		fileName = pagePrefix + fileName;
	} else {
		
		if (pathName.indexOf("/") == 0) {
			fileName = pathName.substring(1);
		} else {
			fileName = pathName;
		}
	}
	
	fs.stat(fileName, function (err, stat) {
		
		if (err) {
			res.writeHead(404, {"Content-Type": "text/plain"});
			res.write("404 Not found");
			res.end();
			return;
		}
		
		// Last Modified
	    var lastModified = stat.mtime.toUTCString();
	    res.setHeader("Last-Modified", lastModified);
	    
	    if (mimeType.suffix.match(expiresConfig.fileMatch)) {
	    	
	    	// Not modified
	    	if (req.headers["if-modified-since"] && lastModified == req.headers["if-modified-since"]) {
			    res.writeHead(304, "Not Modified");
			    res.end();
			    return;
			}
	    	
	    	// Cache-Control
	    	var expireDate = new Date();
			expireDate.setTime(expireDate.getTime() + expiresConfig.maxAge * 1000);
			res.setHeader("Expires", expireDate.toUTCString());
			res.setHeader("Cache-Control", "max-age=" + expiresConfig.maxAge);
	    }
	    
		var raw = fs.createReadStream(fileName);
		
		var acceptEncoding = req.headers['accept-encoding'] || "";
		
		// gzip compress
		if (acceptEncoding.match(/\bgzip\b/)) {
			res.writeHead(200, "Ok", {
		        'Content-Encoding': 'gzip',
		        'Content-Type': mimeType.type
		    });
			raw.pipe(zlib.createGzip()).pipe(res);
			return;
		}
		
		// deflate compress
		if (acceptEncoding.match(/\bdeflate\b/)) {
			res.writeHead(200, "Ok", {
		        'Content-Encoding': 'deflate',
		        'Content-Type': mimeType.type
		    });
			raw.pipe(zlib.createDeflate()).pipe(res);
			return;
		}
		
		res.writeHead(200, {'Content-Type': mimeType.type});
		raw.pipe(res);
	    
	});
	
});

proxy.listen(8080);

console.log("\033[1;36m     [info] \033[0mThe webgl server has been started.");