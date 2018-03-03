var compressor = require('node-minify');

/*new compressor.minify({
  type: 'no-compress',
  fileIn: ['src/math/point-2d.js',
           'src/math/pvector.js',
           'src/objects/physics-object.js',
           'src/objects/particle.js',
           'src/engine/simulation-engine.js',
           'src/ui/widget.js',
           'src/ui/graph.js',
           'src/ui/overlay.js',
           'src/ui/simulation.js',
           'src/settings.js',
           'src/ecollision.js'],
  fileOut: 'bin/ecollision.js',
  callback: function(err, min){
  	if (err != null)
  		console.log(err);
  }
});*/

new compressor.minify({
  type: 'gcc',
  fileIn: 'bin/ecollision.js',
  fileOut: 'bin/ecollision.min.js',
  callback: function(err, min){
  	if (err != null)
  		console.log(err);
  }
});

new compressor.minify({
  type: 'gcc',
  fileIn: ['bower_components/EaselJS/lib/easeljs-0.8.2.min.js', 'bower_components/jquery-mousewheel/jquery.mousewheel.min.js', 'bin/ecollision.js'],
  fileOut: 'bin/ecollision.standalone.min.js',
  callback: function(err, min){
  	if (err != null)
  		console.log(err);
  }
});
