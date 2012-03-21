(function() {
  var contentBlock, label, window;

  window = Ti.UI.createWindow({
    backgroundColor: '#eee',
    layout: 'vertical'
  });

  label = Ti.UI.createLabel({
    text: 'Welcome to your mobile app',
    height: 'auto',
    color: '#333',
    top: 11,
    left: 11,
    bottom: 11,
    font: {
      fontSize: 20,
      fontWeight: 'bold'
    }
  });

  window.add(label);

  contentBlock = Ti.UI.createView({
    height: 100,
    borderColor: '#aaa',
    borderRadius: 11,
    backgroundColor: '#fff',
    left: 11,
    right: 11
  });

  window.add(contentBlock);

  window.open();

}).call(this);
