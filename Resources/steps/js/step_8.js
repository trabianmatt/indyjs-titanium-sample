(function() {
  var contentBlock, label, layout, window;

  window = Ti.UI.createWindow({
    backgroundColor: '#eee'
  });

  layout = Ti.UI.createView({
    top: 11,
    left: 11,
    right: 11,
    layout: 'vertical',
    height: 'auto'
  });

  label = Ti.UI.createLabel({
    text: 'Welcome to your mobile app',
    height: 'auto',
    color: '#333',
    bottom: 11,
    font: {
      fontSize: 20,
      fontWeight: 'bold'
    }
  });

  layout.add(label);

  contentBlock = Ti.UI.createView({
    height: 100,
    borderColor: '#aaa',
    borderRadius: 11,
    backgroundColor: '#fff'
  });

  layout.add(contentBlock);

  window.add(layout);

  window.open();

}).call(this);
