var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");

//var args = process.argv.slice(2);

var port = "5000";
var serve_path = "./";

// process.argv.forEach(function (val, index, array) {
//   console.log(index + ': ' + val);
//   //console.log(process.argv[index]);
// });

if (process.argv.length > 5) {
  console.log("Error: wrong script arguments")
  process.exit(1)
}

if (process.argv.length > 1) {
  for (i = 2; i < process.argv.length-1; i ++) {
    if (process.argv[i] == "--port" && i + 1 <= process.argv.length) {
      port = process.argv[i+1]
      i++;
    } else {
      serve_path = process.argv[i]
    }
  }
}

// console.log(port);
//console.log(serve_path);

// Colors for CLI output
var WHITE = "\033[39m";
var RED = "\033[91m";
var GRN = "\033[32m";

// Create the server
http.createServer(function (request, response) {
    var uri = url.parse(request.url).pathname;
    
    var filename = path.join(path.resolve(__dirname, serve_path), uri);

    console.log(GRN + "URI: " + WHITE + uri)

    var contentTypesByExtension = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
        ".json": "application/json",
        ".svg": "image/svg+xml",
        ".ttf": "application/x-font-truetype",
        ".otf": "application/x-font-opentype",
        ".woff": "application/font-woff",
        ".woff2": "application/font-woff2",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".map": "application/octet-stream",
    };

    fs.exists(filename, function (exists) {
        if (!exists) {
            console.log(RED + "FAIL: " + filename + WHITE);
            filename = path.join(process.cwd(), "/404.html");
        } else if (fs.statSync(filename).isDirectory()) {
            console.log(GRN + "FOLDER: " + WHITE + filename);
            filename += "index.html";
        }

        fs.readFile(filename, "binary", function (err, file) {
            console.log(GRN + "FILE: " + WHITE + filename);
            if (err) {
                response.writeHead(500, { "Content-Type": "text/plain" });
                response.write(err + "\n");
                response.end();
                return;
            }

            var headers = {};
            var contentType = contentTypesByExtension[path.extname(filename)];
            if (contentType) {
                headers["Content-Type"] = contentType;
            } else {
                headers["Content-Type"] = "text/plain";
            }
            headers["X-Content-Type-Options"] = "nosniff";
            headers["X-Frame-Options"] = "0";
            headers["X-XSS-Protection"] = "1; mode=block";
            response.removeHeader("Connection");
            response.writeHead(200, headers);
            response.write(file, "binary");
            response.end();
        });
    });
}).listen(parseInt(port, 10), '0.0.0.0');

console.log(
    "Serving folder: \"" + path.resolve(__dirname, serve_path) + "\"\n" + 
    "at: " + "http://localhost:" + port +
    "/\nCTRL + C to shutdown"
);
