(function() {
  var ContentBlock, View, WelcomeWindow, Window, welcomeWindow,
    __slice = Array.prototype.slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Ti.include('../lib/underscore.js');

  Ti.include('styles_1.js');

  View = (function() {

    View.prototype.viewName = 'View';

    View.prototype.attributes = {};

    function View(options) {
      if (options == null) options = {};
      this.options = _.extend({}, this.options || {}, options);
      this.view = this.make(this.viewName, this.attributes);
    }

    View.prototype.make = function() {
      var attributes, viewName;
      viewName = arguments[0], attributes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      attributes = _.extend.apply(_, [{}].concat(__slice.call(attributes)));
      return Ti.UI["create" + viewName](attributes);
    };

    return View;

  })();

  ContentBlock = (function(_super) {

    __extends(ContentBlock, _super);

    function ContentBlock() {
      this.render = __bind(this.render, this);
      ContentBlock.__super__.constructor.apply(this, arguments);
    }

    ContentBlock.prototype.attributes = styles.contentBlock.view;

    ContentBlock.prototype.render = function() {
      this.view.add(this.make('Label', styles.contentBlock.label, {
        text: this.options.text
      }));
      return this;
    };

    return ContentBlock;

  })(View);

  Window = (function(_super) {

    __extends(Window, _super);

    function Window() {
      this.open = __bind(this.open, this);
      Window.__super__.constructor.apply(this, arguments);
    }

    Window.prototype.viewName = 'Window';

    Window.prototype.attributes = styles.window;

    Window.prototype.open = function() {
      return this.view.open();
    };

    return Window;

  })(View);

  WelcomeWindow = (function(_super) {

    __extends(WelcomeWindow, _super);

    function WelcomeWindow() {
      this.render = __bind(this.render, this);
      WelcomeWindow.__super__.constructor.apply(this, arguments);
    }

    WelcomeWindow.prototype.render = function() {
      var button, contentBlock, label, layout;
      layout = this.make('View', styles.layout);
      label = this.make('Label', styles.labels.h1, {
        text: 'Welcome to your mobile app'
      });
      layout.add(label);
      contentBlock = new ContentBlock({
        text: 'The Kitchen Sink project was included in this bootstrapped app as an example\nof user interface elements and coding style for titanium-backbone. To remove\nthe kitchen sink, simply remove the titanium-backbone-ks module from package.json\nand remove the reference to \'KitchenSinkIntroView\' from src/index.coffee'
      });
      layout.add(contentBlock.render().view);
      button = this.make('ButtonBar', styles.button, {
        labels: ['Launch Kitchen Sink']
      });
      button.addEventListener('click', function() {
        alert('clicked');
      });
      layout.add(button);
      this.view.add(layout);
      return this;
    };

    return WelcomeWindow;

  })(Window);

  welcomeWindow = new WelcomeWindow;

  welcomeWindow.render().open();

}).call(this);
