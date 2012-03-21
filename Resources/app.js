var window = Ti.UI.createWindow({
  backgroundColor: '#eee'
});

var layout = Ti.UI.createView({
  top: 11,
  left: 11,
  right: 11,
  layout: 'vertical',
  height: 'auto',
});

window.add(layout);

var label = Ti.UI.createLabel({
  text: 'Welcome to your mobile app',
  height: 'auto',
  color: '#333',
  bottom: 10,
  font: {
    fontSize: 20,
    fontWeight: 'bold'
  }
});

layout.add(label);

window.open();
