var
    http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    os = require('os');

function getIPv4() {
    var interfaces = os.networkInterfaces();
    var ipv4s = [];

    Object.keys(interfaces).forEach(function (key) {
        interfaces[key].forEach(function (item) {
            if ('IPv4' !== item.family || item.internal !== false) return;

            ipv4s.push(item.address);
            console.log(key + '--' + item.address);
        })
    })

    return ipv4s[0];
}
var mime = {
    "html": "text/html",
    "htm": "text/html",
    "css": "text/css",
    "js": "text/javascript",
    "xml": "text/xml",
    "json": "application/json",

    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "bmp": "image/bmp",
    "svg": "image/svg+xml",
    "ico": "image/x-icon",

    "mp3": "audio/mpeg",
    "wav": "audio/x-wav",
    "mp4": "video/mp4",
    "swf": "application/x-shockwave-flash",

    "woff": "application/x-font-woff"

}
var server = http.createServer(function (req, res) {
    console.log(req.url);
    if (req.method == 'POST') {
      
    req.on('data', function(chunk) {
      console.log("Received body data:");
      console.log(chunk.toString());
    });
    
    req.on('end', function() {

    });
    
}
    var filename = __dirname + url.parse(req.url).pathname;
    var extname = path.extname(filename);

    extname = extname ? extname.slice(1) : 'unknown';
    var resContentType = mime[extname] || 'text/plain';

    fs.exists(filename, function (exists) {
        if (!exists) {
            
            res.write('404 Not Found');
            res.end();
        } else {
            fs.readFile(filename, function (err, data) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.write(JSON.stringify(err));
                    res.end();
                } else {
                   
                    res.write(data);
                    res.end();
                }
            })
        }
    })

});

server.listen('80', function () {
    console.log('server start on: ' + getIPv4() + ':80');
})