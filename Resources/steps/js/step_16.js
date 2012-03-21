(function() {
  var View, Window, button, contentBlock, label, layout, make, welcomeText, window,
    __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Ti.include('../lib/underscore.js');

  Ti.include('styles_1.js');

  make = function() {
    var attributes, viewName;
    viewName = arguments[0], attributes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    attributes = _.extend.apply(_, [{}].concat(__slice.call(attributes)));
    return Ti.UI["create" + viewName](attributes);
  };

  View = (function() {

    View.prototype.viewName = 'View';

    View.prototype.attributes = {};

    function View(options) {
      if (options == null) options = {};
      this.view = make(this.viewName, this.attributes);
    }

    return View;

  })();

  Window = (function(_super) {

    __extends(Window, _super);

    function Window() {
      Window.__super__.constructor.apply(this, arguments);
    }

    Window.prototype.viewName = 'Window';

    Window.prototype.attributes = styles.window;

    return Window;

  })(View);

  window = new Window;

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

  window.view.add(layout);

  window.view.open();

}).call(this);
