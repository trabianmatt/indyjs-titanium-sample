(function() {
  var label, window;

  window = Ti.UI.createWindow({
    backgroundColor: '#eee'
  });

  label = Ti.UI.createLabel({
    text: 'Welcome to your mobile app',
    height: 'auto',
    color: '#333',
    font: {
      fontSize: 20,
      fontWeight: 'bold'
    }
  });

  window.add(label);

  window.open();

}).call(this);
