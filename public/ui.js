(function(){

  var container = $('#container'),
    controls = $('#controls'),
    posts = $('#posts'),
    count = $('<div class="counter">0</div>').prependTo(controls);

  var expected = null;

  var progress = $('#progress');

  var format = d3.time.format("%Y-%m-%d %I:%M %p");

  var loading = $('<h2>Loading, please wait...</h2>').appendTo('body');  
  $(document).bind('documents:start', function(evt, _expected){
    loading.fadeOut();
    expected = _expected;
  }); 
  $(document).bind('documents:added', updateCount); 

  function updateCount(evt, docs, total){

    // Tween text
    var textNode = count.get(0);

    d3.select(textNode)
      .transition()
      .duration(1000)
      .tween('text', function(){

        var i = d3.interpolate(this.textContent || 0, total),
            prec = (total + '').split('.'),
            round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

        return function(t) {
            this.textContent = num = Math.round(i(t) * round) / round;
            var percent = (num / expected) * 100;
            progress.width(percent + '%');
        };
      });
  }

  $('#intervals').change(function(){
    var val = $(this).val();
    $(document).trigger('interval:changed', [val]);
  });
  
  var posts = $("#posts").get(0);
  var hot = new Handsontable(posts, { data : [] });

  $(document).bind('posts:show', function(evt, data){

    if (!data || !data.length){
      return;
    }

    // Turn obj into arrays
    var arr = [];
    data.forEach(function(d){
      arr.push([
        d.id,
        format(d.time),
        d.content
      ]);
    });

    // Find min time
    var times = data.map(function(d){ return d.time});
    var min = d3.min(times);

    $('h3').remove();

    $('#posts').before(
      $('<h3>Displaying ' + data.length + ' posts beginning at ' + format(min) + ':</h3>')
    );

    hot.loadData(arr);
  });
})();
