(function() {
  var button, contentBlock, label, layout, welcomeText, window;

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
    height: 'auto',
    borderColor: '#aaa',
    borderRadius: 11,
    backgroundColor: '#fff',
    bottom: 11
  });

  welcomeText = Ti.UI.createLabel({
    text: 'The Kitchen Sink project was included in this bootstrapped app as an example\nof user interface elements and coding style for titanium-backbone. To remove\nthe kitchen sink, simply remove the titanium-backbone-ks module from package.json\nand remove the reference to \'KitchenSinkIntroView\' from src/index.coffee',
    height: 'auto',
    color: '#333',
    top: 11,
    bottom: 11,
    right: 11,
    left: 11,
    font: {
      fontSize: 14
    }
  });

  contentBlock.add(welcomeText);

  layout.add(contentBlock);

  button = Ti.UI.createButtonBar({
    labels: ['Launch Kitchen Sink'],
    height: 44,
    backgroundColor: '#3A7CE5',
    style: Ti.UI.iPhone.SystemButtonStyle.BAR
  });

  button.addEventListener('click', function() {
    alert('clicked');
  });

  layout.add(button);

  window.add(layout);

  window.open();

}).call(this);
