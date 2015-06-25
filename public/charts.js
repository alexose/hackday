var svg = d3.select('#chart'),
  width = $('#container').innerWidth(),
  height = 150,
  timeout = false,
  currentInterval = 'hour';

svg.style('width', width);
svg.style('height', height);

var data = [];

$(document).bind('documents:added', function(evt, docs){
  if (docs){
    data = data.concat(docs);
  }
})
$(document).bind('documents:complete', draw)
$(document).bind('interval:changed', function(evt, _interval){
  currentInterval = _interval;
  svg.selectAll('rect.bar').remove();
  draw();
})

function draw(evt){

  var dateRange = d3.extent(data, function(d) { return d.time }),
    binner = d3.time.scale(),
    interval = d3.time[currentInterval], 
    intervals = interval.range(interval.floor(dateRange[0]), interval.ceil(dateRange[1]));

  binner.domain([intervals[0], intervals[intervals.length - 1]]);
  binner.range([0,intervals.length - 1]);

  binner.interpolate(d3.interpolateRound);

  // Empty histogram
  var hist = [],
      index = {};

  for(var i=0; i < intervals.length; i++) hist[i] = 0;

  data.forEach(function(d) {

    // Compute the hour index
    var tid = binner(interval.floor(d.time));

    if(!hist[tid]) {
      hist[tid] = 1;
      index[tid] = [d];
    } 
    else { 
      hist[tid]++;
      index[tid].push(d);
    }
  });

  // Quick vis
  var x = d3.scale.linear().domain([0,intervals.length]).range([0,width]);
  var y = d3.scale.linear().domain([0,d3.max(hist)]).range([height,0]);

  var bars = svg.selectAll('rect.bar')
    .data(hist);
  
  var w = x(0.9);

  bars
    .enter()
      .append('rect')
      .classed('bar',true)
      .on('click', function(d, i){
        var posts = index[i];
        $(document).trigger('posts:show', [posts]);
      });

  if (w < 2){
    bars.style('stroke-width', 0);
  }

  bars
    .exit()
      .transition()
        .style('opacity', 0)
        .each('end', function(){
          this.remove();
        });

  if (timeout){
    clearTimeout(timeout);
  }

  timeout = setTimeout(function(){
    bars
      .attr('x', function(d,i) { return x(i); })
      .attr('y', height) 
      .attr('width', w)
      .attr('height', 0)
      .transition()
        .attr('y', function(d) { return y(d); })
        .attr('height', function(d) { return height - y(d); });
  }, 500);
};

