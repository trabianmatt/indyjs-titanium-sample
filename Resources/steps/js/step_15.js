(function() {
  var button, contentBlock, label, layout, make, welcomeText, window,
    __slice = Array.prototype.slice;

  Ti.include('../lib/underscore.js');

  Ti.include('styles_1.js');

  make = function() {
    var attributes, name;
    name = arguments[0], attributes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    attributes = _.extend.apply(_, [{}].concat(__slice.call(attributes)));
    return Ti.UI["create" + name](attributes);
  };

  window = make('Window', styles.window);

  layout = make('View', styles.layout);

  label = make('Label', styles.labels.h1, {
    text: 'Welcome to your mobile app'
  });

  layout.add(label);

  contentBlock = make('View', styles.contentBlock.view);

  welcomeText = make('Label', styles.contentBlock.label, {
    text: 'The Kitchen Sink project was included in this bootstrapped app as an example\nof user interface elements and coding style for titanium-backbone. To remove\nthe kitchen sink, simply remove the titanium-backbone-ks module from package.json\nand remove the reference to \'KitchenSinkIntroView\' from src/index.coffee'
  });

  contentBlock.add(welcomeText);

  layout.add(contentBlock);

  button = make('ButtonBar', styles.button, {
    labels: ['Launch Kitchen Sink']
  });

  button.addEventListener('click', function() {
    alert('clicked');
  });

  layout.add(button);

  window.add(layout);

  window.open();

}).call(this);
