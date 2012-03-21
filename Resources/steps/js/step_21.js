(function() {
  var Button, ContentBlock, View, WelcomeWindow, Window, welcomeWindow,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Ti.include('../lib/underscore.js');

  Ti.include('styles_1.js');

  View = (function() {

    View.prototype.viewName = 'View';

    View.prototype.attributes = {};

    function View(options) {
      var method, name, _ref,
        _this = this;
      if (options == null) options = {};
      this.render = __bind(this.render, this);
      this.options = _.extend({}, this.options || {}, options);
      this.view = this.make(this.viewName, this.attributes);
      if (this.events) {
        _ref = this.events();
        for (name in _ref) {
          method = _ref[name];
          this.view.addEventListener(name, function() {
            method();
          });
        }
      }
    }

    View.prototype.make = function() {
      var attributes, viewName;
      viewName = arguments[0], attributes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      attributes = _.extend.apply(_, [{}].concat(__slice.call(attributes)));
      return Ti.UI["create" + viewName](attributes);
    };

    View.prototype.render = function() {
      return this;
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
      this.layout = __bind(this.layout, this);
      this.open = __bind(this.open, this);
      Window.__super__.constructor.apply(this, arguments);
    }

    Window.prototype.viewName = 'Window';

    Window.prototype.attributes = styles.window;

    Window.prototype.open = function() {
      return this.view.open();
    };

    Window.prototype.layout = function(callback) {
      var layout;
      layout = this.make('View', styles.layout);
      callback(layout);
      return this.view.add(layout);
    };

    return Window;

  })(View);

  Button = (function(_super) {

    __extends(Button, _super);

    function Button() {
      this.render = __bind(this.render, this);
      this.events = __bind(this.events, this);
      Button.__super__.constructor.apply(this, arguments);
    }

    Button.prototype.viewName = 'ButtonBar';

    Button.prototype.attributes = styles.button;

    Button.prototype.events = function() {
      return {
        click: this.options.click
      };
    };

    Button.prototype.render = function() {
      this.view.labels = [this.options.text];
      return this;
    };

    return Button;

  })(View);

  WelcomeWindow = (function(_super) {

    __extends(WelcomeWindow, _super);

    function WelcomeWindow() {
      this.render = __bind(this.render, this);
      WelcomeWindow.__super__.constructor.apply(this, arguments);
    }

    WelcomeWindow.prototype.render = function() {
      var _this = this;
      this.layout(function(view) {
        var button, contentBlock;
        view.add(_this.make('Label', styles.labels.h1, {
          text: 'Welcome to your mobile app'
        }));
        contentBlock = new ContentBlock({
          text: 'The Kitchen Sink project was included in this bootstrapped app as an example\nof user interface elements and coding style for titanium-backbone. To remove\nthe kitchen sink, simply remove the titanium-backbone-ks module from package.json\nand remove the reference to \'KitchenSinkIntroView\' from src/index.coffee'
        });
        view.add(contentBlock.render().view);
        button = new Button({
          text: 'Launch Kitchen Sink',
          click: function() {
            return alert('clicked');
          }
        });
        return view.add(button.render().view);
      });
      return this;
    };

    return WelcomeWindow;

  })(Window);

  welcomeWindow = new WelcomeWindow;

  welcomeWindow.render().open();

}).call(this);
