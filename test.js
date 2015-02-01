var fs = require('fs'),
  spawn = require('child_process').spawn
module.exports = function encode(inputFilePath, outputFilePath) {
    outputStream = fs.createWriteStream(outputFilePath);
    var gifStream = gifify(inputFilePath, outputFilePath);
    gifStream.pipe(outputStream);
    gifStream.on('error', function(){alert('gifstream')});
    outputStream.on('error', function(){alert('outputstream')});
}
function gifify(inputFilePath, outputFilePath) {
  var opts = {}
  opts.fps = 10
  opts.speed = 1
  opts.colors = 80
  opts.compress = 40
  opts.inputFilePath = inputFilePath
  opts.outputFilePath = outputFilePath
  var ffmpegArgs = computeFFmpegArgs(opts);
  var convertArgs = computeConvertArgs(opts);
  var gifsicleArgs = computeGifsicleArgs(opts);


var ffmpeg,
  convert,
  gifsicle;


    ffmpeg = spawn('bin/ffmpeg', ffmpegArgs);



    convert = spawn('bin/convert', convertArgs);


    gifsicle = spawn('bin/gifsicle', gifsicleArgs);







  [ffmpeg, convert, gifsicle].forEach(function handleErrors(child) {
    child.on('error', gifsicle.emit.bind(gifsicle, 'error'));
    child.stderr.on('data', function gotSomeErrors(buf) {
      // emit errors on the resolved stream
      gifsicle.stdout.emit('error', buf.toString());
    });
  });

  // https://github.com/joyent/node/issues/8652
  ffmpeg.stdin.on('error', function ignoreStdinError(){});



  ffmpeg.stdout.pipe(convert.stdin);
  convert.stdout.pipe(gifsicle.stdin);
  return gifsicle.stdout;
}

function computeFFmpegArgs(opts) {

  var args = [
    '-loglevel', 'panic'
  ];

  args.push('-i', opts.inputFilePath);

  // framerate
  args.push('-r', opts.fps);

  // encoding filter and codec
  args.push('-f', 'image2pipe', '-vcodec', 'ppm');

  // write on stdout
  args.push('pipe:1');

  return args;
}

function computeConvertArgs(opts) {
  // Convert options
  // http://www.imagemagick.rg/script/convert.php#options
  var args = [
    '-',
    '+dither',
    '-layers', 'Optimize',
    '-delay', 100 / opts.fps / opts.speed,
  ];

  args.push('gif:-');

  return args;
}

function computeGifsicleArgs(opts) {
  // Gifsicle options
  // http://www.lcdf.org/gifsicle/man.html
  // --lossy is not yet into master, https://github.com/kohler/gifsicle/pull/16
  var args = [
    '-O3',
    '--lossy=' + opts.compress * 2,
    '--colors=' + opts.colors,
    '--no-warnings'
  ];

  return args;
}
