var compressor = require('node-minify');

new compressor.minify({
  type: 'no-compress',
  fileIn: 'src/**/*.js',
  fileOut: 'bin/ecollision.js',
  callback: function(err, min){
  	if (err != null)
  		console.log(err);
  }
});

new compressor.minify({
  type: 'gcc',
  fileIn: 'src/**/*.js',
  fileOut: 'bin/ecollision.min.js',
  callback: function(err, min){
  	if (err != null)
  		console.log(err);
  }
});

new compressor.minify({
  type: 'no-compress',
  fileIn: ['bower_components/EaselJS/lib/easeljs-0.8.2.min.js', 'bower_components/jquery-mousewheel/jquery.mousewheel.min.js', 'bin/ecollision.min.js'],
  fileOut: 'bin/ecollision.deps.min.js',
  callback: function(err, min){
  	if (err != null)
  		console.log(err);
  }
});