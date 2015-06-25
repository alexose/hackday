var log = require('npmlog')
  , fs = require('fs');

var readline = require('readline');

// Set up socket server
var WebSocketServer = require('ws').Server
  , wsport = 3002
  , wss = new WebSocketServer({ port: wsport });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(json) {

    var obj       = JSON.parse(json)
      , id        = obj.id
      , args      = obj.args
      , chunkSize = obj.chunk || 100;

    log.info('Requested monitor ' + id);
  
    try {
      var path = 'post-index/' + id 
        , dir = fs.lstatSync(path);

      args.push(path);

      if (dir.isDirectory()){

        var proc = require('child_process').spawn('./lud.sh', args); 
        var chunk = [];

        readline.createInterface({
          input     : proc.stdout,
          terminal  : false
        }).on('line', function(line){
          chunk.push(line);
          if (chunk.length > chunkSize){
            ws.send(JSON.stringify(chunk));
            chunk = [];
          }
        }).on('close', function(line){
          ws.send(JSON.stringify(chunk));
          chunk = [];
          ws.send('finish');
        });
      } else {
         throw new Error(); 
      }
    } catch(e){
      log.error('Couldn\'t find posts for monitor ' + num);
    }
  });

  ws.send('connected!');
});

log.info('Listening for sockets on port ' + wsport);

// Set up http server (which just serves static content)
// modules
var static = require('node-static')
  , port = 3001
  , http = require('http');

// config
var file = new static.Server( './public', { cache: 3600 , gzip: true });

// serve
http.createServer(function (request, response){
  request.addListener('end', function(){
    log.info('Serving ' + request.url);
    file.serve(request, response);
  }).resume();
}).listen(port);

log.info('Listening for http on port ' + port);
