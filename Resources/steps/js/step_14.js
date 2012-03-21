(function() {
  var button, contentBlock, label, layout, welcomeText, window;

  Ti.include('../lib/underscore.js');

  Ti.include('styles_1.js');

  window = Ti.UI.createWindow(styles.window);

  layout = Ti.UI.createView(styles.layout);

  label = Ti.UI.createLabel(_.extend({}, styles.labels.h1, {
    text: 'Welcome to your mobile app'
  }));

  layout.add(label);

  contentBlock = Ti.UI.createView(styles.contentBlock.view);

  welcomeText = Ti.UI.createLabel(_.extend({}, styles.contentBlock.label, {
    text: 'The Kitchen Sink project was included in this bootstrapped app as an example\nof user interface elements and coding style for titanium-backbone. To remove\nthe kitchen sink, simply remove the titanium-backbone-ks module from package.json\nand remove the reference to \'KitchenSinkIntroView\' from src/index.coffee'
  }));

  contentBlock.add(welcomeText);

  layout.add(contentBlock);

  button = Ti.UI.createButtonBar(_.extend({}, styles.button, {
    labels: ['Launch Kitchen Sink']
  }));

  button.addEventListener('click', function() {
    alert('clicked');
  });

  layout.add(button);

  window.add(layout);

  window.open();

}).call(this);
