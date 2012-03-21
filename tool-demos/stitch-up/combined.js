
(function(/*! Stitch !*/) {
  if (!this.require) {
    var modules = {}, cache = {}, require = function(name, root) {
      var path = expand(root, name), altPath = expand(path, './index'), module = cache[path], altModule = cache[altPath], fn;
      if (module) {
        return module.exports;
      }
      else if (altModule){
        return altModule.exports
      } else if (fn = modules[path] || modules[path = altPath]) {
        module = {id: path, exports: {}};
        try {
          cache[path] = module;
          fn(module.exports, function(name) {
            return require(name, dirname(path));
          }, module);
          return module.exports;
        } catch (err) {
          delete cache[path];
          throw err;
        }
      } else {
        throw 'module \'' + name + '\' not found';
      }
    }, expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    }, dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };
    this.require = function(name) {
      return require(name, '');
    }
    this.require.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
  }
  return this.require.define;
}).call(this)({"hello/index": function(exports, require, module) {(function() {

  module.exports = "Hello, world.";

}).call(this);
}, "sample": function(exports, require, module) {(function() {
  var hello,
    _this = this;

  hello = require('./hello');

  module.exports = {
    sayHello: function() {
      return console.log(hello);
    }
  };

}).call(this);
}});
