document.getElementById('save').onclick = function(){

  require('./test')(document.getElementById('inputFilePath').value,
  document.getElementById('outputFilePath').value)
}
