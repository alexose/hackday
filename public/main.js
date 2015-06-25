// Set up socket
var host = '54.159.221.219',
  total = 0;

var ws = new WebSocket('ws://' + host + ':3002');
ws.onmessage = function(event){
  update(event.data);
};

ws.onopen = function(){
  load();
}

window.onhashchange = load;

function load(){
  var hash = window.location.hash.substr(1),
    id = parseInt(hash);

  if (!isNaN(parseFloat(id)) && isFinite(id)){
  
      var obj = {
        id : id,
        args : [
          "-t$guid:$authorTime:$content.replaceAll(\"\n\", \"<br />\")"
          // "-t$guid:$authorTime:"
          // "-l20000"
        ],
        // TODO: optimize chunk size
        chunk: 10000
      }

    
    // Request monitor via websocket
    ws.send(JSON.stringify(obj));
  }
}

var running = false,
  start = null;

function update(data){
 
  if (!running){
    start = new Date();
    running = true;
  }

  if (data === 'finish'){
    finish();
  } else if (data === 'connected!'){
    return;
  } else {
    parse(data);
  }
}

function parse(data){

  try {
    var arr = JSON.parse(data);
  } catch(e){
    console.log('Couldn\'t decode the JSON.  Hmm...');
    console.log(data);
    return;
  }

  var db = [];
    


  arr.forEach(function(d, i){

    // Split out GUID
    var guid = d.substr(0, d.indexOf(':'));
  
    if (guid === ''){
      var arr = d.split(' ');
      if (arr[0] === 'Found'){
        $(document).trigger('documents:start', [arr[1]]);
      } else {
        console.log('Couldn\'t parse ' + d);
      }
      return;
    }
  
    d = d.substr(d.indexOf(':') + 1, d.length);

    // Split out date
    var date = d.substr(0, d.indexOf(':'));

    // Date sanity check
    if (date < 94670280){
      return;
    }

    // Split out content
    var content = d.substr(d.indexOf(':') + 1, d.length);

    db.push({
      id : guid, 
      time : new Date(date * 1000), 
      content : content
    });
  });

  total += arr.length-2;
 
  $(document).trigger('documents:added', [db, total]);
}

function finish(){
  var time = new Date()-start;
  console.log('Loaded ' + total + ' in ' + time + 'ms.');
  total = 0;
  $(document).trigger('documents:complete');
  start = null;
}
