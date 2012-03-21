//     Underscore.js 1.3.1
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.1';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      if (index == 0) {
        shuffled[0] = value;
      } else {
        rand = Math.floor(Math.random() * (index + 1));
        shuffled[index] = shuffled[rand];
        shuffled[rand] = value;
      }
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return slice.call(iterable);
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var result = [];
    _.reduce(initial, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) {
        memo[memo.length] = el;
        result[result.length] = array[i];
      }
      return memo;
    }, []);
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        func.apply(context, args);
      }
      whenDone();
      throttling = true;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds.
  _.debounce = function(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(/\\\\/g, '\\').replace(/\\'/g, "'");
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.escape || noMatch, function(match, code) {
           return "',_.escape(" + unescape(code) + "),'";
         })
         .replace(c.interpolate || noMatch, function(match, code) {
           return "'," + unescape(code) + ",'";
         })
         .replace(c.evaluate || noMatch, function(match, code) {
           return "');" + unescape(code).replace(/[\r\n\t]/g, ' ') + ";__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', '_', tmpl);
    if (data) return func(data, _);
    return function(data) {
      return func.call(this, data, _);
    };
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

//     Backbone.js 0.9.1

//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `global`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to slice/splice.
  var slice = Array.prototype.slice;
  var splice = Array.prototype.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.9.1';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.
  var $ = root.jQuery || root.Zepto || root.ender;

  // Set the JavaScript library that will be used for DOM manipulation and
  // Ajax calls (a.k.a. the `$` variable). By default Backbone will use: jQuery,
  // Zepto, or Ender; but the `setDomLibrary()` method lets you inject an
  // alternate JavaScript library (or a mock library for testing your views
  // outside of a browser).
  Backbone.setDomLibrary = function(lib) {
    $ = lib;
  };

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // -----------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback functions
  // to an event; trigger`-ing an event fires all callbacks in succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  Backbone.Events = {

    // Bind an event, specified by a string name, `ev`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function(events, callback, context) {
      var ev;
      events = events.split(/\s+/);
      var calls = this._callbacks || (this._callbacks = {});
      while (ev = events.shift()) {
        // Create an immutable callback list, allowing traversal during
        // modification.  The tail is an empty object that will always be used
        // as the next node.
        var list  = calls[ev] || (calls[ev] = {});
        var tail = list.tail || (list.tail = list.next = {});
        tail.callback = callback;
        tail.context = context;
        list.tail = tail.next = {};
      }
      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `ev` is null, removes all bound callbacks for all events.
    off: function(events, callback, context) {
      var ev, calls, node;
      if (!events) {
        delete this._callbacks;
      } else if (calls = this._callbacks) {
        events = events.split(/\s+/);
        while (ev = events.shift()) {
          node = calls[ev];
          delete calls[ev];
          if (!callback || !node) continue;
          // Create a new list, omitting the indicated event/context pairs.
          while ((node = node.next) && node.next) {
            if (node.callback === callback &&
              (!context || node.context === context)) continue;
            this.on(ev, node.callback, node.context);
          }
        }
      }
      return this;
    },

    // Trigger an event, firing all bound callbacks. Callbacks are passed the
    // same arguments as `trigger` is, apart from the event name.
    // Listening for `"all"` passes the true event name as the first argument.
    trigger: function(events) {
      var event, node, calls, tail, args, all, rest;
      if (!(calls = this._callbacks)) return this;
      all = calls['all'];
      (events = events.split(/\s+/)).push(null);
      // Save references to the current heads & tails.
      while (event = events.shift()) {
        if (all) events.push({next: all.next, tail: all.tail, event: event});
        if (!(node = calls[event])) continue;
        events.push({next: node.next, tail: node.tail});
      }
      // Traverse each list, stopping when the saved tail is reached.
      rest = slice.call(arguments, 1);
      while (node = events.pop()) {
        tail = node.tail;
        args = node.event ? [node.event].concat(rest) : rest;
        while ((node = node.next) !== tail) {
          node.callback.apply(node.context || this, args);
        }
      }
      return this;
    }

  };

  // Aliases for backwards compatibility.
  Backbone.Events.bind   = Backbone.Events.on;
  Backbone.Events.unbind = Backbone.Events.off;

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  Backbone.Model = function(attributes, options) {
    var defaults;
    attributes || (attributes = {});
    if (options && options.parse) attributes = this.parse(attributes);
    if (defaults = getValue(this, 'defaults')) {
      attributes = _.extend({}, defaults, attributes);
    }
    if (options && options.collection) this.collection = options.collection;
    this.attributes = {};
    this._escapedAttributes = {};
    this.cid = _.uniqueId('c');
    if (!this.set(attributes, {silent: true})) {
      throw new Error("Can't create an invalid model");
    }
    delete this._changed;
    this._previousAttributes = _.clone(this.attributes);
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Backbone.Model.prototype, Backbone.Events, {

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function() {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      var html;
      if (html = this._escapedAttributes[attr]) return html;
      var val = this.attributes[attr];
      return this._escapedAttributes[attr] = _.escape(val == null ? '' : '' + val);
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.attributes[attr] != null;
    },

    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    set: function(key, value, options) {
      var attrs, attr, val;
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      // Extract attributes and options.
      options || (options = {});
      if (!attrs) return this;
      if (attrs instanceof Backbone.Model) attrs = attrs.attributes;
      if (options.unset) for (attr in attrs) attrs[attr] = void 0;

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      var now = this.attributes;
      var escaped = this._escapedAttributes;
      var prev = this._previousAttributes || {};
      var alreadySetting = this._setting;
      this._changed || (this._changed = {});
      this._setting = true;

      // Update attributes.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(now[attr], val)) delete escaped[attr];
        options.unset ? delete now[attr] : now[attr] = val;
        if (this._changing && !_.isEqual(this._changed[attr], val)) {
          this.trigger('change:' + attr, this, val, options);
          this._moreChanges = true;
        }
        delete this._changed[attr];
        if (!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {
          this._changed[attr] = val;
        }
      }

      // Fire the `"change"` events, if the model has been changed.
      if (!alreadySetting) {
        if (!options.silent && this.hasChanged()) this.change(options);
        this._setting = false;
      }
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it. `unset` is a noop if the attribute doesn't exist.
    unset: function(attr, options) {
      (options || (options = {})).unset = true;
      return this.set(attr, null, options);
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear: function(options) {
      (options || (options = {})).unset = true;
      return this.set(_.clone(this.attributes), options);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        if (!model.set(model.parse(resp, xhr), options)) return false;
        if (success) success(model, resp);
      };
      options.error = Backbone.wrapError(options.error, model, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, value, options) {
      var attrs, current;
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      options = options ? _.clone(options) : {};
      if (options.wait) current = _.clone(this.attributes);
      var silentOptions = _.extend({}, options, {silent: true});
      if (attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
        return false;
      }
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        var serverAttrs = model.parse(resp, xhr);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (!model.set(serverAttrs, options)) return false;
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };
      options.error = Backbone.wrapError(options.error, model, options);
      var method = this.isNew() ? 'create' : 'update';
      var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
      if (options.wait) this.set(current, silentOptions);
      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var triggerDestroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      if (this.isNew()) return triggerDestroy();
      options.success = function(resp) {
        if (options.wait) triggerDestroy();
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };
      options.error = Backbone.wrapError(options.error, model, options);
      var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
      if (!options.wait) triggerDestroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = getValue(this.collection, 'url') || getValue(this, 'urlRoot') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, xhr) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Call this method to manually fire a `"change"` event for this model and
    // a `"change:attribute"` event for each changed attribute.
    // Calling this will cause all objects observing the model to update.
    change: function(options) {
      if (this._changing || !this.hasChanged()) return this;
      this._changing = true;
      this._moreChanges = true;
      for (var attr in this._changed) {
        this.trigger('change:' + attr, this, this._changed[attr], options);
      }
      while (this._moreChanges) {
        this._moreChanges = false;
        this.trigger('change', this, options);
      }
      this._previousAttributes = _.clone(this.attributes);
      delete this._changed;
      this._changing = false;
      return this;
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (!arguments.length) return !_.isEmpty(this._changed);
      return this._changed && _.has(this._changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this._changed) : false;
      var val, changed = false, old = this._previousAttributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (!arguments.length || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Check if the model is currently in a valid state. It's only possible to
    // get into an *invalid* state if you're using silent changes.
    isValid: function() {
      return !this.validate(this.attributes);
    },

    // Run validation against a set of incoming attributes, returning `true`
    // if all is well. If a specific `error` callback has been passed,
    // call that instead of firing the general `"error"` event.
    _validate: function(attrs, options) {
      if (options.silent || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validate(attrs, options);
      if (!error) return true;
      if (options && options.error) {
        options.error(this, error, options);
      } else {
        this.trigger('error', this, error, options);
      }
      return false;
    }

  });

  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.comparator) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, {silent: true, parse: options.parse});
  };

  // Define the Collection's inheritable methods.
  _.extend(Backbone.Collection.prototype, Backbone.Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Backbone.Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function() {
      return this.map(function(model){ return model.toJSON(); });
    },

    // Add a model, or list of models to the set. Pass **silent** to avoid
    // firing the `add` event for every new model.
    add: function(models, options) {
      var i, index, length, model, cid, id, cids = {}, ids = {};
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];

      // Begin by turning bare objects into model references, and preventing
      // invalid models or duplicate models from being added.
      for (i = 0, length = models.length; i < length; i++) {
        if (!(model = models[i] = this._prepareModel(models[i], options))) {
          throw new Error("Can't add an invalid model to a collection");
        }
        if (cids[cid = model.cid] || this._byCid[cid] ||
          (((id = model.id) != null) && (ids[id] || this._byId[id]))) {
          throw new Error("Can't add the same model to a collection twice");
        }
        cids[cid] = ids[id] = model;
      }

      // Listen to added models' events, and index models for lookup by
      // `id` and by `cid`.
      for (i = 0; i < length; i++) {
        (model = models[i]).on('all', this._onModelEvent, this);
        this._byCid[model.cid] = model;
        if (model.id != null) this._byId[model.id] = model;
      }

      // Insert models into the collection, re-sorting if needed, and triggering
      // `add` events unless silenced.
      this.length += length;
      index = options.at != null ? options.at : this.models.length;
      splice.apply(this.models, [index, 0].concat(models));
      if (this.comparator) this.sort({silent: true});
      if (options.silent) return this;
      for (i = 0, length = this.models.length; i < length; i++) {
        if (!cids[(model = this.models[i]).cid]) continue;
        options.index = i;
        model.trigger('add', model, this, options);
      }
      return this;
    },

    // Remove a model, or a list of models from the set. Pass silent to avoid
    // firing the `remove` event for every model removed.
    remove: function(models, options) {
      var i, l, index, model;
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];
      for (i = 0, l = models.length; i < l; i++) {
        model = this.getByCid(models[i]) || this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byCid[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Get a model from the set by id.
    get: function(id) {
      if (id == null) return null;
      return this._byId[id.id != null ? id.id : id];
    },

    // Get a model from the set by client id.
    getByCid: function(cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      options || (options = {});
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      var boundComparator = _.bind(this.comparator, this);
      if (this.comparator.length == 1) {
        this.models = this.sortBy(boundComparator);
      } else {
        this.models.sort(boundComparator);
      }
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.map(this.models, function(model){ return model.get(attr); });
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any `add` or `remove` events. Fires `reset` when finished.
    reset: function(models, options) {
      models  || (models = []);
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      this._reset();
      this.add(models, {silent: true, parse: options.parse});
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `add: true` is passed, appends the
    // models to the collection instead of resetting.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === undefined) options.parse = true;
      var collection = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
        if (success) success(collection, resp);
      };
      options.error = Backbone.wrapError(options.error, collection, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      var coll = this;
      options = options ? _.clone(options) : {};
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!options.wait) coll.add(model, options);
      var success = options.success;
      options.success = function(nextModel, resp, xhr) {
        if (options.wait) coll.add(nextModel, options);
        if (success) {
          success(nextModel, resp);
        } else {
          nextModel.trigger('sync', model, resp, options);
        }
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, xhr) {
      return resp;
    },

    // Proxy to _'s chain. Can't be proxied the same way the rest of the
    // underscore methods are proxied because it relies on the underscore
    // constructor.
    chain: function () {
      return _(this.models).chain();
    },

    // Reset all internal state. Called when the collection is reset.
    _reset: function(options) {
      this.length = 0;
      this.models = [];
      this._byId  = {};
      this._byCid = {};
    },

    // Prepare a model or hash of attributes to be added to this collection.
    _prepareModel: function(model, options) {
      if (!(model instanceof Backbone.Model)) {
        var attrs = model;
        options.collection = this;
        model = new this.model(attrs, options);
        if (!model._validate(model.attributes, options)) model = false;
      } else if (!model.collection) {
        model.collection = this;
      }
      return model;
    },

    // Internal method to remove a model's ties to a collection.
    _removeReference: function(model) {
      if (this == model.collection) {
        delete model.collection;
      }
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(ev, model, collection, options) {
      if ((ev == 'add' || ev == 'remove') && collection != this) return;
      if (ev == 'destroy') {
        this.remove(model, options);
      }
      if (model && ev === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
    'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
    'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
    'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
    'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Backbone.Collection.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });

  // Backbone.Router
  // -------------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var namedParam    = /:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Backbone.Router.prototype, Backbone.Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      Backbone.history || (Backbone.history = new Backbone.History);
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (!callback) callback = this[name];
      Backbone.history.route(route, _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback && callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
        Backbone.history.trigger('route', this, name, args);
      }, this));
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      var routes = [];
      for (var route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(namedParam, '([^\/]+)')
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters: function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL fragments. If the
  // browser does not support `onhashchange`, falls back to polling.
  Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');
  };

  // Cached regex for cleaning leading hashes and slashes .
  var routeStripper = /^[#\/]/;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Has the history handling already been started?
  var historyStarted = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(Backbone.History.prototype, Backbone.Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || forcePushState) {
          fragment = window.location.pathname;
          var search = window.location.search;
          if (search) fragment += search;
        } else {
          fragment = window.location.hash;
        }
      }
      fragment = decodeURIComponent(fragment);
      if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      if (historyStarted) throw new Error("Backbone.history has already been started");
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && window.history && window.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        $(window).bind('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      historyStarted = true;
      var loc = window.location;
      var atRoot  = loc.pathname == this.options.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        window.location.replace(this.options.root + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = loc.hash.replace(routeStripper, '');
        window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
      }

      if (!this.options.silent) {
        return this.loadUrl();
      }
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      $(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      historyStarted = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current == this.fragment && this.iframe) current = this.getFragment(this.iframe.location.hash);
      if (current == this.fragment || current == decodeURIComponent(this.fragment)) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(window.location.hash);
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you which to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!historyStarted) return false;
      if (!options || options === true) options = {trigger: options};
      var frag = (fragment || '').replace(routeStripper, '');
      if (this.fragment == frag || this.fragment == decodeURIComponent(frag)) return;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;
        this.fragment = frag;
        window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, frag);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this.fragment = frag;
        this._updateHash(window.location, frag, options.replace);
        if (this.iframe && (frag != this.getFragment(this.iframe.location.hash))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a history entry on hash-tag change.
          // When replace is true, we don't want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, frag, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        window.location.assign(this.options.root + fragment);
      }
      if (options.trigger) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);
      } else {
        location.hash = fragment;
      }
    }
  });

  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var eventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(Backbone.View.prototype, Backbone.Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove: function() {
      this.$el.remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use **make** to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
    //
    make: function(tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      this.$el = $(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = getValue(this, 'events')))) return;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) throw new Error('Event "' + events[key] + '" does not exist');
        var match = key.match(eventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.bind(eventName, method);
        } else {
          this.$el.delegate(selector, eventName, method);
        }
      }
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.unbind('.delegateEvents' + this.cid);
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure: function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = viewOptions.length; i < l; i++) {
        var attr = viewOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = getValue(this, 'attributes') || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.setElement(this.make(this.tagName, attrs), false);
      } else {
        this.setElement(this.el, false);
      }
    }

  });

  // The self-propagating extend function that Backbone classes use.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Set up inheritance for the model, collection, and view.
  Backbone.Model.extend = Backbone.Collection.extend =
    Backbone.Router.extend = Backbone.View.extend = extend;

  // Backbone.sync
  // -------------

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = getValue(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (!options.data && model && (method == 'create' || method == 'update')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(model.toJSON());
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
        };
      }
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !Backbone.emulateJSON) {
      params.processData = false;
    }

    // Make the request, allowing the user to override any Ajax options.
    return $.ajax(_.extend(params, options));
  };

  // Wrap an optional error callback with a fallback error event.
  Backbone.wrapError = function(onError, originalModel, options) {
    return function(model, resp) {
      resp = model === originalModel ? resp : model;
      if (onError) {
        onError(originalModel, resp, options);
      } else {
        originalModel.trigger('error', originalModel, resp, options);
      }
    };
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Helper function to get a value from a Backbone object as a property
  // or as a function.
  var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

}).call(this);

(function() {
  var log, stringify, _oldAlert,
    __slice = Array.prototype.slice;

  stringify = function(statements) {
    var statement, strings;
    strings = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = statements.length; _i < _len; _i++) {
        statement = statements[_i];
        if (_.isString(statement)) {
          _results.push(statement);
        } else {
          _results.push(JSON.stringify(statement));
        }
      }
      return _results;
    })();
    return strings.join(' ');
  };

  log = function(level, statements) {
    Ti.API.log(level, stringify(statements));
  };

  this.console = {
    debug: function() {
      var statements;
      statements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.log(statements);
    },
    log: function() {
      var statements;
      statements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return log('debug', statements);
    },
    info: function() {
      var statements;
      statements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return log('info', statements);
    },
    warn: function() {
      var statements;
      statements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return log('warn', statements);
    },
    error: function() {
      var statements;
      statements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return log('error', statements);
    }
  };

  _oldAlert = this.alert;

  this.alert = function() {
    var statements;
    statements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    _oldAlert(stringify(statements));
  };

}).call(this);

(function(/*! Stitch !*/) {
  if (!this.mobileRequire) {
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
    this.mobileRequire = function(name) {
      return require(name, '');
    }
    this.mobileRequire.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
  }
  return this.mobileRequire.define;
}).call(this)({"collections/github/comments": function(exports, require, module) {(function() {
  var Comment, CommentList,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Comment = require('models/github/comment');

  module.exports = CommentList = (function(_super) {

    __extends(CommentList, _super);

    function CommentList() {
      CommentList.__super__.constructor.apply(this, arguments);
    }

    CommentList.prototype.model = Comment;

    return CommentList;

  })(Backbone.Collection);

}).call(this);
}, "collections/github/issues": function(exports, require, module) {(function() {
  var Issue, IssueList,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Issue = require('models/github/issue');

  module.exports = IssueList = (function(_super) {

    __extends(IssueList, _super);

    function IssueList() {
      IssueList.__super__.constructor.apply(this, arguments);
    }

    IssueList.prototype.model = Issue;

    return IssueList;

  })(Backbone.Collection);

}).call(this);
}, "collections/github/repositories": function(exports, require, module) {(function() {
  var Repositories, Repository,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Repository = require('models/github/repository');

  module.exports = Repositories = (function(_super) {

    __extends(Repositories, _super);

    function Repositories() {
      Repositories.__super__.constructor.apply(this, arguments);
    }

    Repositories.prototype.model = Repository;

    return Repositories;

  })(Backbone.Collection);

}).call(this);
}, "models/github/comment": function(exports, require, module) {(function() {
  var Comment,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  module.exports = Comment = (function(_super) {

    __extends(Comment, _super);

    function Comment() {
      Comment.__super__.constructor.apply(this, arguments);
    }

    return Comment;

  })(Backbone.Model);

}).call(this);
}, "models/github/issue": function(exports, require, module) {(function() {
  var CommentList, Issue,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  CommentList = require('collections/github/comments');

  module.exports = Issue = (function(_super) {

    __extends(Issue, _super);

    function Issue() {
      Issue.__super__.constructor.apply(this, arguments);
    }

    Issue.prototype.initialize = function() {
      this.comments = new CommentList;
      return console.log('issue url', this.url);
    };

    Issue.prototype.buildComment = function() {
      var comment;
      comment = new this.comments.model;
      comment.collection = this.comments;
      return comment;
    };

    return Issue;

  })(Backbone.Model);

}).call(this);
}, "models/github/repository": function(exports, require, module) {(function() {
  var Repository,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  module.exports = Repository = (function(_super) {

    __extends(Repository, _super);

    function Repository() {
      Repository.__super__.constructor.apply(this, arguments);
    }

    return Repository;

  })(Backbone.Model);

}).call(this);
}, "models/github/user": function(exports, require, module) {(function() {
  var IssueList, User, apiRoot,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  IssueList = require('collections/github/issues');

  apiRoot = 'https://api.github.com';

  module.exports = User = (function(_super) {

    __extends(User, _super);

    function User() {
      this.bootstrap = __bind(this.bootstrap, this);
      User.__super__.constructor.apply(this, arguments);
    }

    User.prototype.url = "" + apiRoot + "/user";

    User.prototype.initialize = function() {
      return this.on('change:id', this.bootstrap);
    };

    User.prototype.bootstrap = function() {
      this.issues = new IssueList;
      this.issues.sync = this.sync;
      return this.issues.url = "" + apiRoot + "/issues";
    };

    User.prototype.validate = function(attrs) {
      if (_.has(attrs, 'username')) {
        if (_.isEmpty(attrs.username)) return "must provide a username";
      }
      if (_.has(attrs, 'password')) {
        if (_.isEmpty(attrs.password)) return "must provide a password";
      }
    };

    return User;

  })(Backbone.Model);

}).call(this);
}, "ks/styles/github": function(exports, require, module) {(function() {
  var colors, detailsStyles;

  colors = require('styles/theme').colors;

  detailsStyles = require('styles/ui/table').details;

  module.exports = {
    issues: {
      table: {
        view: detailsStyles.view,
        row: {
          title: {
            view: {
              left: 11,
              right: 11
            },
            label: detailsStyles.row.title.label
          }
        }
      }
    }
  };

}).call(this);
}, "ks/styles/index": function(exports, require, module) {(function() {

  module.exports = {
    github: require('./github')
  };

}).call(this);
}, "ks/views/forms/index": function(exports, require, module) {(function() {
  var FormsView, View, Window, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui;

  View = require('views/base');

  Window = require('views/ui').Window;

  module.exports = FormsView = (function(_super) {

    __extends(FormsView, _super);

    function FormsView() {
      this.render = __bind(this.render, this);
      FormsView.__super__.constructor.apply(this, arguments);
    }

    FormsView.prototype.render = function() {
      var _this = this;
      this.layout(function(view) {
        return view.add(_this.make('Label', styles.labels.h1, {
          text: 'Forms.'
        }));
      });
      return this;
    };

    return FormsView;

  })(Window);

}).call(this);
}, "ks/views/github/index": function(exports, require, module) {(function() {
  var Button, GitHubView, IssuesView, LoginView, User, View, Window, styles, sync, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui;

  sync = require('lib/sync');

  User = require('models/github/user');

  View = require('views/base');

  IssuesView = require('./issues');

  LoginView = require('./login');

  _ref = require('views/ui'), Button = _ref.Button, Window = _ref.Window;

  module.exports = GitHubView = (function(_super) {

    __extends(GitHubView, _super);

    function GitHubView() {
      this.showLoginView = __bind(this.showLoginView, this);
      this.render = __bind(this.render, this);
      GitHubView.__super__.constructor.apply(this, arguments);
    }

    GitHubView.prototype.events = {
      open: 'showLoginView'
    };

    GitHubView.prototype.initialize = function() {
      var _this = this;
      this.user = new User;
      this.user.sync = function(method, model, options) {
        return sync(method, model, _.extend({}, options, {
          auth: {
            login: _this.user.get('username'),
            password: _this.user.get('password')
          }
        }));
      };
      return this.bindTo(this.user, 'change:id', this.render);
    };

    GitHubView.prototype.render = function() {
      var _this = this;
      this.layout(function(view) {
        var button, issuesView;
        if (_this.user.id) {
          view.add(_this.make('Label', styles.labels.h2, {
            text: 'Issues'
          }));
          issuesView = new IssuesView({
            collection: _this.user.issues,
            controller: _this.controller,
            fetchOnInit: true
          });
          return view.add(issuesView.render().view);
        } else {
          button = new Button({
            text: 'Login to GitHub',
            click: _this.showLoginView
          });
          return view.add(button.render().view);
        }
      });
      return this;
    };

    GitHubView.prototype.showLoginView = function() {
      var loginView;
      loginView = new LoginView({
        controller: this.controller,
        model: this.user
      });
      return this.controller.show('login', loginView);
    };

    return GitHubView;

  })(Window);

}).call(this);
}, "ks/views/github/issues/detail": function(exports, require, module) {(function() {
  var ContentBlock, Form, FormWindow, IssueView, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui;

  Form = require('presenters/form');

  ContentBlock = require('views/ui').ContentBlock;

  FormWindow = require('views/ui/form/window');

  module.exports = IssueView = (function(_super) {

    __extends(IssueView, _super);

    function IssueView() {
      this.buildFields = __bind(this.buildFields, this);
      this.prepend = __bind(this.prepend, this);
      IssueView.__super__.constructor.apply(this, arguments);
    }

    IssueView.prototype.initialize = function() {
      this.view.title = "Issue #" + (this.model.get('number'));
      this.presenter = new Form({
        model: this.model.buildComment(),
        fields: this.buildFields()
      });
      return IssueView.__super__.initialize.apply(this, arguments);
    };

    IssueView.prototype.prepend = function(view) {
      var body, contentBlock;
      view.add(this.make('Label', styles.labels.h3, {
        text: this.model.get('title')
      }));
      if (body = this.model.get('body')) {
        contentBlock = new ContentBlock({
          text: body
        });
        view.add(contentBlock.render().view);
      }
      return this;
    };

    IssueView.prototype.buildFields = function() {
      var body;
      body = {
        key: 'body',
        label: 'Body',
        hint: 'Comment',
        as: 'textarea',
        section: 'none'
      };
      return [body];
    };

    return IssueView;

  })(FormWindow);

}).call(this);
}, "ks/views/github/issues/index": function(exports, require, module) {(function() {
  var IssuesView, Table, styles,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('ks/styles').github.issues.table;

  Table = require('views/ui/table');

  module.exports = IssuesView = (function(_super) {

    __extends(IssuesView, _super);

    function IssuesView() {
      IssuesView.__super__.constructor.apply(this, arguments);
    }

    IssuesView.prototype.attributes = styles.view;

    IssuesView.prototype.initialize = function() {
      this.options = _.extend({}, this.options, {
        rowClass: require('./row'),
        autoHeight: true
      });
      return IssuesView.__super__.initialize.apply(this, arguments);
    };

    return IssuesView;

  })(Table);

}).call(this);
}, "ks/views/github/issues/row": function(exports, require, module) {(function() {
  var DetailView, IssuesRow, Label, Row, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('ks/styles').github.issues.table.row;

  Row = require('views/ui/table/row');

  Label = require('views/ui/label');

  DetailView = require('./detail');

  module.exports = IssuesRow = (function(_super) {

    __extends(IssuesRow, _super);

    function IssuesRow() {
      this.showDetail = __bind(this.showDetail, this);
      this.renderTitle = __bind(this.renderTitle, this);
      this.render = __bind(this.render, this);
      IssuesRow.__super__.constructor.apply(this, arguments);
    }

    IssuesRow.prototype.attributes = {
      hasChild: true
    };

    IssuesRow.prototype.events = {
      click: 'showDetail'
    };

    IssuesRow.prototype.initialize = function() {
      return this.bindTo(this.model, "change", this.render);
    };

    IssuesRow.prototype.render = function() {
      var _this = this;
      this.wrap(function(view) {
        return view.add(_this.renderTitle());
      });
      return this;
    };

    IssuesRow.prototype.renderTitle = function() {
      var label;
      label = new Label({
        label: {
          primary: this.model.get('title'),
          meta: "Issue #" + (this.model.get('number'))
        },
        style: styles.title.view,
        labelStyle: styles.title.label,
        controller: this.controller
      });
      return label.render().view;
    };

    IssuesRow.prototype.showDetail = function() {
      var detailView;
      detailView = new DetailView({
        model: this.model,
        controller: this.controller
      });
      return this.controller.show('issueDetail', detailView);
    };

    return IssuesRow;

  })(Row);

}).call(this);
}, "ks/views/github/login/index": function(exports, require, module) {(function() {
  var Form, FormWindow, GitHubLogin,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Form = require('presenters/form');

  FormWindow = require('views/ui/form/window');

  module.exports = GitHubLogin = (function(_super) {

    __extends(GitHubLogin, _super);

    function GitHubLogin() {
      this.buildFields = __bind(this.buildFields, this);
      GitHubLogin.__super__.constructor.apply(this, arguments);
    }

    GitHubLogin.prototype.attributes = function() {
      return GitHubLogin.__super__.attributes.call(this, {
        modal: true,
        title: 'GitHub Login'
      });
    };

    GitHubLogin.prototype.initialize = function() {
      var _this = this;
      this.presenter = new Form({
        model: this.model,
        fields: this.buildFields()
      });
      this.bindTo(this.model, 'sync', function() {
        return _this.close();
      });
      this.options.saveButton = 'Login';
      return GitHubLogin.__super__.initialize.apply(this, arguments);
    };

    GitHubLogin.prototype.buildFields = function() {
      var password, username;
      username = {
        key: 'username',
        label: 'Username',
        hint: 'me@example.com',
        as: 'email',
        required: true
      };
      password = {
        key: 'password',
        label: 'Password',
        as: 'password',
        required: true
      };
      return [username, password];
    };

    return GitHubLogin;

  })(FormWindow);

}).call(this);
}, "ks/views/intro": function(exports, require, module) {(function() {
  var Button, ContentBlock, IntroView, Window, styles, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui;

  _ref = require('views/ui'), Button = _ref.Button, ContentBlock = _ref.ContentBlock, Window = _ref.Window;

  module.exports = IntroView = (function(_super) {

    __extends(IntroView, _super);

    function IntroView() {
      this.render = __bind(this.render, this);
      IntroView.__super__.constructor.apply(this, arguments);
    }

    IntroView.prototype.render = function() {
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
          click: _this.openKitchenSink
        });
        return view.add(button.render().view);
      });
      return this;
    };

    IntroView.prototype.openKitchenSink = function() {
      var KitchenSink, kitchenSink;
      KitchenSink = require('./main');
      kitchenSink = new KitchenSink;
      return kitchenSink.render().open();
    };

    return IntroView;

  })(Window);

}).call(this);
}, "ks/views/layout/index": function(exports, require, module) {(function() {
  var LayoutView, View, Window, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui;

  View = require('views/base');

  Window = require('views/ui').Window;

  module.exports = LayoutView = (function(_super) {

    __extends(LayoutView, _super);

    function LayoutView() {
      this.render = __bind(this.render, this);
      LayoutView.__super__.constructor.apply(this, arguments);
    }

    LayoutView.prototype.render = function() {
      var _this = this;
      this.layout(function(view) {
        return view.add(_this.make('Label', styles.labels.h1, {
          text: 'Layout.'
        }));
      });
      return this;
    };

    return LayoutView;

  })(Window);

}).call(this);
}, "ks/views/main": function(exports, require, module) {(function() {
  var MainView, TabGroup, styles,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui;

  TabGroup = require('views/ui/tabs/group');

  module.exports = MainView = (function(_super) {

    __extends(MainView, _super);

    function MainView() {
      MainView.__super__.constructor.apply(this, arguments);
    }

    MainView.prototype.initialize = function() {
      var forms, github, layout, tables;
      layout = {
        title: 'Layout',
        viewClass: require('ks/views/layout'),
        icon: 'ks/layout.png'
      };
      tables = {
        title: 'Tables',
        viewClass: require('ks/views/tables'),
        icon: 'ks/tables.png'
      };
      forms = {
        title: 'Forms',
        viewClass: require('ks/views/forms'),
        icon: 'ks/forms.png'
      };
      github = {
        title: 'GitHub',
        viewClass: require('ks/views/github'),
        icon: 'ks/github.png'
      };
      this.options.items = [tables, layout, forms, github];
      return MainView.__super__.initialize.apply(this, arguments);
    };

    return MainView;

  })(TabGroup);

}).call(this);
}, "ks/views/tables/details": function(exports, require, module) {(function() {
  var DetailsTable, DetailsTableView, View, ViewPresenter, Window,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  ViewPresenter = require('presenters/view');

  View = require('views/base');

  DetailsTable = require('views/ui/table/details');

  Window = require('views/ui').Window;

  module.exports = DetailsTableView = (function(_super) {

    __extends(DetailsTableView, _super);

    function DetailsTableView() {
      this.buildItems = __bind(this.buildItems, this);
      this.render = __bind(this.render, this);
      DetailsTableView.__super__.constructor.apply(this, arguments);
    }

    DetailsTableView.prototype.attributes = {
      title: 'Details Table'
    };

    DetailsTableView.prototype.render = function() {
      var _this = this;
      this.layout(function(view) {
        var navigationTable;
        navigationTable = new DetailsTable({
          controller: _this.controller,
          items: _this.buildItems()
        });
        view.add(navigationTable.render().view);
        return setTimeout((function() {
          return navigationTable.collection.add(_this.buildChangingRow());
        }), 1000);
      });
      return this;
    };

    DetailsTableView.prototype.buildItems = function() {
      var items, key, value, _results,
        _this = this;
      items = {
        simple: {
          title: 'title'
        },
        withMeta: {
          title: {
            primary: 'title.primary',
            meta: 'title.meta'
          }
        },
        withSubtitle: {
          title: 'title',
          subtitle: 'subtitle'
        },
        allTogether: {
          title: {
            primary: 'title.primary',
            meta: 'title.meta'
          },
          subtitle: {
            primary: 'subtitle.primary',
            meta: 'subtitle.meta'
          }
        },
        allTogetherWithClick: {
          title: {
            primary: 'title.primary',
            meta: 'title.meta'
          },
          subtitle: {
            primary: 'subtitle.primary',
            meta: 'subtitle.meta'
          },
          click: function() {
            return alert('BOOM, son.');
          }
        }
      };
      _results = [];
      for (key in items) {
        value = items[key];
        _results.push(value);
      }
      return _results;
    };

    DetailsTableView.prototype.buildChangingRow = function() {
      var row;
      row = new ViewPresenter({
        title: 'Added later'
      });
      setTimeout((function() {
        return row.set({
          title: 'And then changed'
        });
      }), 500);
      setTimeout((function() {
        return row.set({
          subtitle: 'With a subtitle'
        });
      }), 1000);
      setTimeout((function() {
        return row.set({
          subtitle: {
            primary: 'With a subtitle',
            meta: 'And subtitle meta'
          }
        });
      }), 1500);
      setTimeout((function() {
        return row.set({
          title: {
            primary: 'And then changed',
            meta: 'Pretty cool, huh?'
          }
        });
      }), 2000);
      return row;
    };

    return DetailsTableView;

  })(Window);

}).call(this);
}, "ks/views/tables/index": function(exports, require, module) {(function() {
  var DetailsTableView, NavigationTable, SectionsTableView, TablesView, View, ViewPresenter, Window,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  ViewPresenter = require('presenters/view');

  View = require('views/base');

  NavigationTable = require('views/ui/table/navigation');

  DetailsTableView = require('./details');

  SectionsTableView = require('./sections');

  Window = require('views/ui').Window;

  module.exports = TablesView = (function(_super) {

    __extends(TablesView, _super);

    function TablesView() {
      this.buildItems = __bind(this.buildItems, this);
      this.render = __bind(this.render, this);
      TablesView.__super__.constructor.apply(this, arguments);
    }

    TablesView.prototype.render = function() {
      var _this = this;
      this.layout(function(view) {
        var navigationTable;
        navigationTable = new NavigationTable({
          items: _this.buildItems(),
          controller: _this.controller
        });
        return view.add(navigationTable.render().view);
      });
      return this;
    };

    TablesView.prototype.buildItems = function() {
      var details, infinity, sections,
        _this = this;
      details = {
        title: 'Details Table',
        click: function() {
          var detailsTableView;
          detailsTableView = new DetailsTableView({
            controller: _this.controller
          });
          return _this.controller.show('detailsTable', detailsTableView);
        }
      };
      sections = {
        title: 'Sections',
        click: function() {
          var sectionsTableView;
          sectionsTableView = new SectionsTableView({
            controller: _this.controller
          });
          return _this.controller.show('sectionsTable', sectionsTableView);
        }
      };
      infinity = {
        title: 'Inifinity',
        click: function() {
          var tablesView;
          tablesView = new TablesView({
            controller: _this.controller,
            style: {
              title: 'Tables'
            }
          });
          return _this.controller.show('tablesView', tablesView);
        }
      };
      return [details, sections, infinity];
    };

    return TablesView;

  })(Window);

}).call(this);
}, "ks/views/tables/sections": function(exports, require, module) {(function() {
  var DetailsTable, SectionsTableView, Table, View, ViewPresenter, Window, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles/ui');

  ViewPresenter = require('presenters/view');

  View = require('views/base');

  Table = require('views/ui/table');

  DetailsTable = require('views/ui/table/details');

  Window = require('views/ui').Window;

  module.exports = SectionsTableView = (function(_super) {

    __extends(SectionsTableView, _super);

    function SectionsTableView() {
      this.buildItems = __bind(this.buildItems, this);
      this.render = __bind(this.render, this);
      SectionsTableView.__super__.constructor.apply(this, arguments);
    }

    SectionsTableView.prototype.attributes = {
      title: 'Details Table'
    };

    SectionsTableView.prototype.render = function() {
      var layoutOptions,
        _this = this;
      layoutOptions = {
        style: styles.window.layouts.noPadding
      };
      this.layout(layoutOptions, function(view) {
        var sectionsTable;
        sectionsTable = new Table({
          controller: _this.controller,
          items: _this.buildItems(),
          rowClass: require('views/ui/table/details/row'),
          autoHeight: true
        });
        return view.add(sectionsTable.render().view);
      });
      return this;
    };

    SectionsTableView.prototype.buildItems = function() {
      var items, key, value, _results;
      items = {
        simple: {
          title: 'title'
        }
      };
      _results = [];
      for (key in items) {
        value = items[key];
        _results.push(value);
      }
      return _results;
    };

    return SectionsTableView;

  })(Window);

}).call(this);
}, "ks/views/ui/typography": function(exports, require, module) {(function() {
  var IntroView, Window, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('ks/styles').ui;

  Window = require('views/ui/window');

  module.exports = IntroView = (function(_super) {

    __extends(IntroView, _super);

    function IntroView() {
      this.render = __bind(this.render, this);
      this.buildHeading = __bind(this.buildHeading, this);
      IntroView.__super__.constructor.apply(this, arguments);
    }

    IntroView.prototype.buildHeading = function(view, size) {
      return view.add(this.make('Label', styles.labels["h" + size], {
        text: "Heading " + size,
        bottom: 10
      }));
    };

    IntroView.prototype.render = function() {
      var _this = this;
      this.layout(function(view) {
        var size, _results;
        _results = [];
        for (size = 1; size <= 6; size++) {
          _results.push(_this.buildHeading(view, size));
        }
        return _results;
      });
      return this;
    };

    return IntroView;

  })(Window);

}).call(this);
}, "lib/i18n": function(exports, require, module) {(function() {
  var flatten;

  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };

  flatten = function(source, destination, parent) {
    var childKey, children, key;
    if (destination == null) destination = {};
    if (parent == null) parent = null;
    for (childKey in source) {
      children = source[childKey];
      key = parent != null ? [parent, childKey].join('.') : childKey;
      if (_.isString(children)) {
        destination[key] = children;
      } else {
        flatten(children, destination, key);
      }
    }
    return destination;
  };

  module.exports = {
    load: function(modules) {
      var keys,
        _this = this;
      keys = flatten(modules);
      return {
        t: function(key, locals) {
          return this.translate(key, locals);
        },
        translate: function(key, locals) {
          var value;
          if (value = keys[key]) {
            if (locals) {
              return _.template(value, locals);
            } else {
              return value;
            }
          } else {
            return "[key " + key + " not found]";
          }
        },
        hasKey: function(key) {
          return keys[key] != null;
        }
      };
    }
  };

}).call(this);
}, "lib/sync": function(exports, require, module) {(function() {
  var getValue, methodMap, util;

  util = require('lib/util');

  methodMap = {
    create: 'POST',
    update: 'POST',
    "delete": 'POST',
    read: 'GET'
  };

  getValue = function(object, prop) {
    var val;
    if (val = object != null ? object[prop] : void 0) {
      if (_.isFunction(val)) {
        return val();
      } else {
        return val;
      }
    } else {
      return null;
    }
  };

  module.exports = function(method, model, options) {
    var auth, authString, data, type, url, xhr, _ref;
    type = methodMap[method];
    url = (_ref = options.url) != null ? _ref : getValue(model, 'url');
    if (!options.data && model && (method === 'create' || method === 'update')) {
      data = JSON.stringify(model.toJSON());
    }
    xhr = Ti.Network.createHTTPClient({
      timeout: options.timeout || 1000000,
      onload: function() {
        data = JSON.parse(this.responseText);
        console.log('data', data);
        return options.success(data, this.status, xhr);
      },
      onerror: function(e) {
        return console.log('error', e);
      }
    });
    xhr.open(type, url, true);
    if (auth = options.auth) {
      authString = Ti.Utils.base64encode([auth.login, auth.password].join(':'));
      xhr.setRequestHeader('Authorization', "Basic " + authString);
    }
    return xhr.send(data);
  };

}).call(this);
}, "lib/util": function(exports, require, module) {(function() {

  module.exports = {
    getValue: function(object, prop) {
      var val;
      if (val = object != null ? object[prop] : void 0) {
        if (_.isFunction(val)) {
          return val();
        } else {
          return val;
        }
      } else {
        return null;
      }
    }
  };

}).call(this);
}, "presenters/form/field": function(exports, require, module) {(function() {
  var Field,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  module.exports = Field = (function(_super) {

    __extends(Field, _super);

    function Field() {
      this.hint = __bind(this.hint, this);
      Field.__super__.constructor.apply(this, arguments);
    }

    Field.prototype.initialize = function(attrs) {
      return this.set({
        value: this.collection.currentModel.get(this.get('key'))
      });
    };

    Field.prototype.defaults = {
      as: 'string',
      section: 'default'
    };

    Field.prototype.hint = function() {
      return (this.get('hint')) || (this.get('required') ? 'Required' : void 0);
    };

    return Field;

  })(Backbone.Model);

}).call(this);
}, "presenters/form/field_list": function(exports, require, module) {(function() {
  var Field, FieldList, ViewList,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Field = require('./field');

  ViewList = require('presenters/view_list');

  module.exports = FieldList = (function(_super) {

    __extends(FieldList, _super);

    function FieldList() {
      this.attributes = __bind(this.attributes, this);
      FieldList.__super__.constructor.apply(this, arguments);
    }

    FieldList.prototype.model = Field;

    FieldList.prototype.attributes = function() {
      return this.reduce(function(hash, field) {
        hash[field.get('key')] = field.get('value');
        return hash;
      }, {});
    };

    return FieldList;

  })(ViewList);

}).call(this);
}, "presenters/form/index": function(exports, require, module) {(function() {
  var FieldList, Form,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  FieldList = require('./field_list');

  module.exports = Form = (function(_super) {

    __extends(Form, _super);

    function Form() {
      this.save = __bind(this.save, this);
      this.buildFields = __bind(this.buildFields, this);
      this.buildClone = __bind(this.buildClone, this);
      Form.__super__.constructor.apply(this, arguments);
    }

    Form.prototype.defaults = {
      saveable: false,
      sections: [
        {
          key: 'default',
          group: true
        }, {
          key: 'none',
          group: false
        }
      ]
    };

    Form.prototype.initialize = function(attributes) {
      this.original = attributes != null ? attributes.model : void 0;
      this.buildClone();
      return this.buildFields(attributes);
    };

    Form.prototype.buildClone = function() {
      var _this = this;
      this.clone = this.original.clone();
      return this.clone.on('change', function() {
        return _this.set({
          saveable: !_this.clone.validate(_this.fields.attributes())
        });
      });
    };

    Form.prototype.buildFields = function(attributes) {
      var _this = this;
      this.fields = new FieldList;
      this.fields.currentModel = this.clone;
      this.fields.add(attributes != null ? attributes.fields : void 0);
      return this.fields.on('change', function(field) {
        _this.clone.set(field.get('key'), field.get('value'), {
          silent: true
        });
        return _this.clone.change();
      });
    };

    Form.prototype.save = function() {
      return this.original.save(this.fields.attributes());
    };

    return Form;

  })(Backbone.Model);

}).call(this);
}, "presenters/view": function(exports, require, module) {(function() {
  var ViewPresenter,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  module.exports = ViewPresenter = (function(_super) {

    __extends(ViewPresenter, _super);

    function ViewPresenter() {
      ViewPresenter.__super__.constructor.apply(this, arguments);
    }

    return ViewPresenter;

  })(Backbone.Model);

}).call(this);
}, "presenters/view_list": function(exports, require, module) {(function() {
  var ViewPresenter, ViewPresenterList,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  ViewPresenter = require('./view');

  module.exports = ViewPresenterList = (function(_super) {

    __extends(ViewPresenterList, _super);

    function ViewPresenterList() {
      this.fetch = __bind(this.fetch, this);
      ViewPresenterList.__super__.constructor.apply(this, arguments);
    }

    ViewPresenterList.prototype.model = ViewPresenter;

    ViewPresenterList.prototype.fetch = function(options) {
      if (options == null) options = {};
      this.trigger('reset');
      return typeof options.success === "function" ? options.success(this) : void 0;
    };

    return ViewPresenterList;

  })(Backbone.Collection);

}).call(this);
}, "styles/theme/default/colors": function(exports, require, module) {(function() {

  module.exports = {
    border: {
      "default": '#aaa'
    },
    button: {
      "default": '#3A7CE5'
    },
    form: {
      label: '#000',
      value: '#2b3f78'
    },
    table: {
      border: '#ccc'
    },
    window: {
      background: '#eee'
    }
  };

}).call(this);
}, "styles/ui/button": function(exports, require, module) {(function() {
  var colors;

  colors = require('styles/theme').colors;

  module.exports = {
    "default": {
      height: 44,
      left: 0,
      right: 0,
      backgroundColor: colors.button["default"],
      style: 'Ti.UI.iPhone.SystemButtonStyle.BAR'
    },
    nav: null
  };

}).call(this);
}, "styles/ui/content_block": function(exports, require, module) {(function() {
  var colors;

  colors = require('styles/theme').colors;

  module.exports = {
    view: {
      height: 'auto',
      borderWidth: 1,
      borderColor: colors.border["default"],
      borderRadius: 11,
      backgroundColor: '#fff',
      bottom: 11
    },
    text: {
      top: 11,
      right: 11,
      bottom: 11,
      left: 11
    }
  };

}).call(this);
}, "styles/ui/form/editors/index": function(exports, require, module) {(function() {

  module.exports = {
    string: require('./string'),
    textarea: require('./textarea')
  };

}).call(this);
}, "styles/ui/form/editors/string": function(exports, require, module) {(function() {
  var colors;

  colors = require('styles/theme').colors;

  module.exports = {
    view: {
      width: '100%',
      color: colors.form.value
    }
  };

}).call(this);
}, "styles/ui/form/editors/textarea": function(exports, require, module) {(function() {
  var colors;

  colors = require('styles/theme').colors;

  module.exports = {
    view: {
      height: 150,
      borderColor: colors.table.border,
      borderRadius: 11,
      backgroundColor: '#fff'
    },
    textarea: {
      top: 11,
      bottom: 11,
      left: 5,
      right: 5,
      suppressReturn: false
    }
  };

}).call(this);
}, "styles/ui/form/index": function(exports, require, module) {(function() {
  var colors;

  colors = require('styles/theme').colors;

  module.exports = {
    view: {
      layout: 'vertical',
      height: 'auto'
    },
    table: {
      view: {
        borderColor: colors.table.border,
        borderRadius: 11,
        scrollable: false,
        bottom: 11
      },
      row: {
        view: {
          selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
        },
        editor: {
          width: '60%',
          right: 0
        },
        label: {
          view: {
            left: 11,
            width: '40%'
          },
          label: {
            primary: {
              height: 19,
              color: colors.form.label,
              font: {
                fontWeight: 'bold',
                fontSize: 17
              }
            }
          }
        }
      }
    },
    editors: require('./editors'),
    window: require('./window')
  };

}).call(this);
}, "styles/ui/form/window": function(exports, require, module) {(function() {

  module.exports = {
    button: {
      style: Ti.UI.iPhone.SystemButtonStyle.DONE
    }
  };

}).call(this);
}, "styles/ui/index": function(exports, require, module) {(function() {

  module.exports = {
    contentBlock: require('./content_block'),
    button: require('./button'),
    form: require('./form'),
    labels: require('./labels'),
    table: require('./table'),
    window: require('./window')
  };

}).call(this);
}, "styles/ui/labels": function(exports, require, module) {(function() {
  var heading, label;

  label = function(fontSize, options) {
    if (options == null) options = {};
    options.font = _.extend({}, options.font || {}, {
      fontSize: fontSize
    });
    return _.extend({}, options, {
      height: 'auto',
      color: '#333',
      bottom: options.font.fontSize * 0.5
    });
  };

  heading = function(fontSize) {
    return label(fontSize, {
      font: {
        fontWeight: 'bold'
      }
    });
  };

  module.exports = {
    h1: heading(20),
    h2: heading(18),
    h3: heading(16),
    h4: heading(14),
    h5: heading(12),
    h6: heading(10),
    p: label(14),
    combined: {
      view: {
        height: 0
      },
      primary: {
        top: 0,
        height: 'auto',
        color: '#333',
        font: {
          fontSize: 15
        }
      },
      meta: {
        bottom: 0,
        height: 'auto',
        color: '#999',
        font: {
          fontSize: 11
        }
      }
    }
  };

}).call(this);
}, "styles/ui/table/index": function(exports, require, module) {(function() {
  var colors;

  colors = require('styles/theme').colors;

  module.exports = {
    details: {
      view: {
        borderColor: colors.table.border,
        borderRadius: 11,
        scrollable: false
      },
      row: {
        title: {
          view: {
            left: 11,
            width: '40%'
          },
          label: {
            primary: {
              height: 17,
              font: {
                fontWeight: 'bold',
                fontSize: 15
              }
            },
            meta: {
              height: 15
            }
          }
        },
        subtitle: {
          view: {
            right: 11,
            width: '40%'
          },
          label: {
            primary: {
              height: 17,
              textAlign: 'right',
              font: {
                fontWeight: 'bold',
                fontSize: 15
              }
            },
            meta: {
              height: 15,
              textAlign: 'right'
            }
          }
        }
      }
    }
  };

}).call(this);
}, "styles/ui/window": function(exports, require, module) {(function() {
  var colors, layout;

  colors = require('styles/theme').colors;

  layout = function(padding) {
    return {
      top: padding,
      left: padding,
      right: padding,
      layout: 'vertical',
      height: 'auto'
    };
  };

  module.exports = {
    view: {
      backgroundColor: colors.window.background
    },
    layouts: {
      "default": layout(11),
      noPadding: layout(0),
      padded: layout
    }
  };

}).call(this);
}, "views/base/collection": function(exports, require, module) {(function() {
  var CollectionView, View, ViewList,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  View = require('./index');

  ViewList = require('presenters/view_list');

  module.exports = CollectionView = (function(_super) {

    __extends(CollectionView, _super);

    function CollectionView() {
      this.addAll = __bind(this.addAll, this);
      CollectionView.__super__.constructor.apply(this, arguments);
    }

    CollectionView.prototype.initialize = function() {
      if (this.options.items) {
        if (this.collection == null) {
          this.collection = new ViewList(this.options.items);
        }
      }
      _(this.options).defaults({
        fetchOnInit: true
      });
      this.bindTo(this.collection, 'reset', this.addAll);
      this.bindTo(this.collection, 'add', this.addOne);
      if (this.options.fetchOnInit) return this.collection.fetch();
    };

    CollectionView.prototype.addAll = function() {
      return this.collection.each(this.addOne);
    };

    return CollectionView;

  })(View);

}).call(this);
}, "views/base/index": function(exports, require, module) {(function() {
  var View, createTitaniumView, util, viewOptions,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = Array.prototype.slice;

  util = require('lib/util');

  createTitaniumView = function(viewName, attributes) {
    var creator, match, module, viewCreator;
    viewCreator = (match = viewName.match(/(.*)::(.*)/)) ? (module = match[1], viewName = match[2]) : void 0;
    creator = "create" + viewName;
    viewCreator = module ? Ti.UI[module][creator] : Ti.UI[creator];
    return viewCreator(attributes);
  };

  viewOptions = ['model', 'collection', 'view', 'id', 'attributes', 'className', 'viewName', 'presenter', 'controller'];

  module.exports = View = (function() {

    _(View.prototype).extend(Backbone.Events);

    View.prototype.viewName = 'View';

    function View(options) {
      if (options == null) options = {};
      this.wrap = __bind(this.wrap, this);
      this.destroy = __bind(this.destroy, this);
      this.bindToAndTrigger = __bind(this.bindToAndTrigger, this);
      this.bindTo = __bind(this.bindTo, this);
      this.listen = __bind(this.listen, this);
      this.render = __bind(this.render, this);
      this.getValue = __bind(this.getValue, this);
      this.cid = _.uniqueId('view');
      this._configure(options);
      this._bindControllerEvents();
      this._ensureView();
      this.initialize.apply(this, arguments);
      this.delegateEvents();
    }

    View.prototype.getValue = function(prop) {
      return util.getValue(this, prop);
    };

    View.prototype.initialize = function() {};

    View.prototype._configure = function(options) {
      var attr, _i, _len;
      if (this.options) options = _.extend({}, this.options, options);
      for (_i = 0, _len = viewOptions.length; _i < _len; _i++) {
        attr = viewOptions[_i];
        if (options[attr]) this[attr] = options[attr];
      }
      return this.options = options;
    };

    View.prototype._bindControllerEvents = function() {
      var _ref, _ref2;
      return (_ref = this.controller) != null ? (_ref2 = _ref.context) != null ? _ref2.on('destroy', this.destroy) : void 0 : void 0;
    };

    View.prototype._ensureView = function() {
      var attrs, style;
      if (!this.view) {
        attrs = this.getValue('attributes') || {};
        if (style = this.options.style) attrs = _.extend({}, attrs, style);
        if (this.id) attrs.id = this.id;
        if (this.className) attrs.className = this.className;
        return this.view = this.make(this.viewName, attrs);
      }
    };

    View.prototype.make = function() {
      var attribute, attributeHashes, attributes, key, viewName;
      viewName = arguments[0], attributeHashes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      attributes = _.extend.apply(_, [{}].concat(__slice.call(attributeHashes)));
      for (key in attributes) {
        attribute = attributes[key];
        attributes[key] = this.parseTitaniumProperty(attribute);
      }
      return createTitaniumView(viewName, attributes);
    };

    View.prototype.render = function() {
      return this;
    };

    View.prototype.parseTitaniumProperty = function(property) {
      var tiProperty, _ref;
      if (_.isString(property) && (tiProperty = property.match(/^Ti\.(.*)/))) {
        property = (_ref = tiProperty[1]) != null ? _ref.split('.') : void 0;
        return _.reduce(property, function(hashPart, subKey) {
          return hashPart[subKey];
        }, Ti);
      } else {
        return property;
      }
    };

    View.prototype.delegateEvents = function(events) {
      var method, name, _results,
        _this = this;
      if (!(events || (events = this.getValue('events')))) return;
      _results = [];
      for (name in events) {
        method = events[name];
        if (!_.isFunction(method)) method = this[method];
        if (method) {
          _results.push(this.view.addEventListener(name, function() {
            method();
          }));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    View.prototype.listen = function(name, callback) {
      return this.view.addEventListener(name, function(e) {
        this.trigger(name, e);
        if (typeof callback === "function") callback(e);
      });
    };

    View.prototype.bindTo = function(model, eventName, callback) {
      var _ref;
      if (!this.bindings) {
        if (!((_ref = this.controller) != null ? _ref.context : void 0)) {
          console.warn(" \nThis view (" + this.viewName + ") has not been provided with an associated context\n(usually the Window within which the view is displayed).  This means we\nwon't be able to automatically destroy the view when the context is destroyed,\nand the events being bound will likely cause a memory leak.");
        }
      }
      this.bindings || (this.bindings = []);
      model.on(eventName, callback, this);
      return this.bindings.push({
        model: model,
        eventName: eventName,
        callback: callback
      });
    };

    View.prototype.bindToAndTrigger = function(model, eventName, callback) {
      this.bindTo(model, eventName, callback);
      return typeof callback === "function" ? callback() : void 0;
    };

    View.prototype.destroy = function() {
      var binding, _i, _len, _ref, _results,
        _this = this;
      if (this.bindings) {
        _ref = this.bindings;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          binding = _ref[_i];
          _results.push((function(binding) {
            return binding.model.off(binding.eventName, binding.callback);
          })(binding));
        }
        return _results;
      }
    };

    View.prototype.wrap = function(callback) {
      if (this.wrapper != null) this.view.remove(this.wrapper);
      this.wrapper = this.make('View', this.view.attributes);
      callback(this.wrapper);
      return this.view.add(this.wrapper);
    };

    return View;

  })();

}).call(this);
}, "views/controller": function(exports, require, module) {(function() {
  var Controller,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  module.exports = Controller = (function(_super) {

    __extends(Controller, _super);

    function Controller() {
      this.close = __bind(this.close, this);
      this.open = __bind(this.open, this);
      this.show = __bind(this.show, this);
      Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(attributes) {
      return this.context = attributes != null ? attributes.context : void 0;
    };

    Controller.prototype.show = function(name, window, options) {
      return this.trigger('show', name, window, options);
    };

    Controller.prototype.open = function(name, window, options) {
      return this.show(arguments);
    };

    Controller.prototype.close = function(window, options) {
      return this.trigger('close', window, options);
    };

    return Controller;

  })(Backbone.Model);

}).call(this);
}, "views/ui/button/index": function(exports, require, module) {(function() {
  var Button, View, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui;

  View = require('views/base');

  module.exports = Button = (function(_super) {

    __extends(Button, _super);

    function Button() {
      this.render = __bind(this.render, this);
      this.events = __bind(this.events, this);
      Button.__super__.constructor.apply(this, arguments);
    }

    Button.prototype.viewName = 'ButtonBar';

    Button.prototype.events = function() {
      return {
        click: this.options.click
      };
    };

    Button.prototype.attributes = styles.button["default"];

    Button.prototype.render = function() {
      this.view.labels = [this.options.text];
      return this;
    };

    return Button;

  })(View);

}).call(this);
}, "views/ui/button/nav": function(exports, require, module) {(function() {
  var Button, NavButton, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui;

  Button = require('./index');

  module.exports = NavButton = (function(_super) {

    __extends(NavButton, _super);

    function NavButton() {
      this.render = __bind(this.render, this);
      NavButton.__super__.constructor.apply(this, arguments);
    }

    NavButton.prototype.viewName = 'Button';

    NavButton.prototype.attributes = styles.button.nav;

    NavButton.prototype.render = function() {
      this.view.title = this.options.text;
      return this;
    };

    return NavButton;

  })(Button);

}).call(this);
}, "views/ui/content_block": function(exports, require, module) {(function() {
  var ContentBlock, View, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui;

  View = require('views/base');

  module.exports = ContentBlock = (function(_super) {

    __extends(ContentBlock, _super);

    function ContentBlock() {
      this.render = __bind(this.render, this);
      ContentBlock.__super__.constructor.apply(this, arguments);
    }

    ContentBlock.prototype.attributes = styles.contentBlock.view;

    ContentBlock.prototype.render = function() {
      this.view.add(this.make('Label', styles.labels.p, styles.contentBlock.text, {
        text: this.options.text
      }));
      return this;
    };

    return ContentBlock;

  })(View);

}).call(this);
}, "views/ui/form/editors/email": function(exports, require, module) {(function() {
  var EmailEditor, StringEditor,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  StringEditor = require('./string');

  module.exports = EmailEditor = (function(_super) {

    __extends(EmailEditor, _super);

    function EmailEditor() {
      EmailEditor.__super__.constructor.apply(this, arguments);
    }

    EmailEditor.prototype.attributes = function() {
      return _.extend({}, EmailEditor.__super__.attributes.apply(this, arguments), {
        keyboardType: Ti.UI.KEYBOARD_EMAIL
      });
    };

    return EmailEditor;

  })(StringEditor);

}).call(this);
}, "views/ui/form/editors/factory": function(exports, require, module) {(function() {
  var _this = this;

  module.exports = {
    build: function(options) {
      var field, fieldClass;
      field = options.field;
      fieldClass = require("./" + (field.get('as')));
      return new fieldClass({
        controller: options.controller,
        presenter: field
      });
    }
  };

}).call(this);
}, "views/ui/form/editors/password": function(exports, require, module) {(function() {
  var PasswordEditor, StringEditor,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  StringEditor = require('./string');

  module.exports = PasswordEditor = (function(_super) {

    __extends(PasswordEditor, _super);

    function PasswordEditor() {
      PasswordEditor.__super__.constructor.apply(this, arguments);
    }

    PasswordEditor.prototype.attributes = function() {
      return _.extend({}, PasswordEditor.__super__.attributes.apply(this, arguments), {
        passwordMask: true
      });
    };

    return PasswordEditor;

  })(StringEditor);

}).call(this);
}, "views/ui/form/editors/string": function(exports, require, module) {(function() {
  var StringEditor, View, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui.form.editors.string;

  View = require('views/base');

  module.exports = StringEditor = (function(_super) {

    __extends(StringEditor, _super);

    function StringEditor() {
      this.change = __bind(this.change, this);
      StringEditor.__super__.constructor.apply(this, arguments);
    }

    StringEditor.prototype.viewName = 'TextField';

    StringEditor.prototype.attributes = function() {
      return styles.view;
    };

    StringEditor.prototype.events = {
      change: 'change'
    };

    StringEditor.prototype.initialize = function() {
      this.view.value = this.presenter.get('value');
      return this.view.hintText = this.presenter.hint();
    };

    StringEditor.prototype.change = function() {
      return this.presenter.set({
        value: this.view.value
      });
    };

    return StringEditor;

  })(View);

}).call(this);
}, "views/ui/form/editors/textarea": function(exports, require, module) {(function() {
  var NavButton, TextareaEditor, View, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui.form.editors.textarea;

  NavButton = require('views/ui/button/nav');

  View = require('views/base');

  module.exports = TextareaEditor = (function(_super) {

    __extends(TextareaEditor, _super);

    function TextareaEditor() {
      this.render = __bind(this.render, this);
      TextareaEditor.__super__.constructor.apply(this, arguments);
    }

    TextareaEditor.prototype.attributes = styles.view;

    TextareaEditor.prototype.render = function() {
      var _this = this;
      this.view.add(this.field = this.make('TextArea', styles.textarea, {
        value: this.presenter.get('value')
      }));
      this.field.addEventListener('change', function() {
        _this.presenter.set({
          value: _this.field.value
        });
      });
      return this;
    };

    return TextareaEditor;

  })(View);

}).call(this);
}, "views/ui/form/field_list": function(exports, require, module) {(function() {
  var CollectionView, FieldFactory, FieldListView,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  FieldFactory = require('views/ui/form/editors/factory');

  CollectionView = require('views/base/collection');

  module.exports = FieldListView = (function(_super) {

    __extends(FieldListView, _super);

    function FieldListView() {
      this.addOne = __bind(this.addOne, this);
      FieldListView.__super__.constructor.apply(this, arguments);
    }

    FieldListView.prototype.attributes = {
      height: 'auto',
      layout: 'vertical'
    };

    FieldListView.prototype.addOne = function(model) {
      var editor;
      editor = FieldFactory.build({
        field: model,
        controller: this.controller
      });
      return this.view.add(editor.render().view);
    };

    return FieldListView;

  })(CollectionView);

}).call(this);
}, "views/ui/form/index": function(exports, require, module) {(function() {
  var FieldList, FieldListView, FormTable, FormView, View, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui.form;

  FieldList = require('presenters/form/field_list');

  FormTable = require('./table');

  FieldListView = require('./field_list');

  View = require('views/base');

  module.exports = FormView = (function(_super) {

    __extends(FormView, _super);

    function FormView() {
      this.render = __bind(this.render, this);
      FormView.__super__.constructor.apply(this, arguments);
    }

    FormView.prototype.attributes = styles.view;

    FormView.prototype.render = function() {
      var fieldSections, fields, listView, listViewClass, section, _i, _len, _ref;
      fieldSections = this.presenter.fields.groupBy(function(field) {
        return field.get('section');
      });
      _ref = this.presenter.get('sections');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        section = _ref[_i];
        if (fields = fieldSections[section.key]) {
          listViewClass = section.group ? FormTable : FieldListView;
          listView = new listViewClass({
            controller: this.controller,
            collection: new FieldList(fields)
          });
          this.view.add(listView.render().view);
        }
      }
      return this;
    };

    return FormView;

  })(View);

}).call(this);
}, "views/ui/form/table/index": function(exports, require, module) {(function() {
  var FormTable, Table, styles,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui.form.table;

  Table = require('views/ui/table');

  module.exports = FormTable = (function(_super) {

    __extends(FormTable, _super);

    function FormTable() {
      FormTable.__super__.constructor.apply(this, arguments);
    }

    FormTable.prototype.attributes = styles.view;

    FormTable.prototype.initialize = function() {
      this.options = _.defaults({}, this.options, {
        rowClass: require('./row'),
        autoHeight: true
      });
      return FormTable.__super__.initialize.apply(this, arguments);
    };

    return FormTable;

  })(Table);

}).call(this);
}, "views/ui/form/table/row": function(exports, require, module) {(function() {
  var FieldFactory, FormTableRow, Label, Row, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui.form.table.row;

  FieldFactory = require('views/ui/form/editors/factory');

  Row = require('views/ui/table/row');

  Label = require('views/ui/label');

  module.exports = FormTableRow = (function(_super) {

    __extends(FormTableRow, _super);

    function FormTableRow() {
      this.renderEditor = __bind(this.renderEditor, this);
      this.renderLabel = __bind(this.renderLabel, this);
      this.render = __bind(this.render, this);
      FormTableRow.__super__.constructor.apply(this, arguments);
    }

    FormTableRow.prototype.attributes = styles.view;

    FormTableRow.prototype.render = function() {
      this.view.add(this.title = this.renderLabel());
      this.view.add(this.editor = this.renderEditor());
      return this;
    };

    FormTableRow.prototype.renderLabel = function() {
      var label;
      label = new Label({
        label: this.model.get('label'),
        style: styles.label.view,
        labelStyle: styles.label.label,
        controller: this.controller
      });
      return label.render().view;
    };

    FormTableRow.prototype.renderEditor = function() {
      var editor, editorWrapper;
      editorWrapper = this.make('View', styles.editor);
      editor = FieldFactory.build({
        field: this.model,
        controller: this.controller
      });
      editorWrapper.add(editor.render().view);
      return editorWrapper;
    };

    return FormTableRow;

  })(Row);

}).call(this);
}, "views/ui/form/window": function(exports, require, module) {(function() {
  var FormView, FormWindow, NavButton, Window, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui.form.window;

  Window = require('views/ui').Window;

  NavButton = require('views/ui/button/nav');

  FormView = require('views/ui/form');

  module.exports = FormWindow = (function(_super) {

    __extends(FormWindow, _super);

    function FormWindow() {
      this.save = __bind(this.save, this);
      this.renderSaveButton = __bind(this.renderSaveButton, this);
      this.renderCloseButton = __bind(this.renderCloseButton, this);
      this.render = __bind(this.render, this);
      FormWindow.__super__.constructor.apply(this, arguments);
    }

    FormWindow.prototype.initialize = function() {
      var _base;
      if ((_base = this.options).saveButton == null) _base.saveButton = 'Save';
      this.view.leftNavButton = this.renderCloseButton();
      return this.view.rightNavButton = this.renderSaveButton();
    };

    FormWindow.prototype.render = function() {
      var _this = this;
      this.layout(function(view) {
        var formView;
        if (typeof _this.prepend === "function") _this.prepend(view);
        formView = new FormView({
          controller: _this.controller,
          presenter: _this.presenter
        });
        view.add(formView.render().view);
        return typeof _this.append === "function" ? _this.append(view) : void 0;
      });
      return this;
    };

    FormWindow.prototype.renderCloseButton = function() {
      var button;
      button = new NavButton({
        text: 'Cancel',
        click: this.close
      });
      return button.render().view;
    };

    FormWindow.prototype.renderSaveButton = function() {
      var button,
        _this = this;
      button = new NavButton({
        click: this.save,
        text: this.options.saveButton,
        style: styles.button
      });
      this.bindToAndTrigger(this.presenter, 'change:saveable', function() {
        return button.view.enabled = _this.presenter.get('saveable');
      });
      return button.render().view;
    };

    FormWindow.prototype.save = function() {
      return this.presenter.save();
    };

    return FormWindow;

  })(Window);

}).call(this);
}, "views/ui/index": function(exports, require, module) {(function() {

  module.exports = {
    Button: require('./button'),
    ContentBlock: require('./content_block'),
    Tabs: require('./tabs'),
    Window: require('./window')
  };

}).call(this);
}, "views/ui/label": function(exports, require, module) {(function() {
  var Label, View, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui.labels.combined;

  View = require('views/base');

  module.exports = Label = (function(_super) {

    __extends(Label, _super);

    function Label() {
      this.render = __bind(this.render, this);
      Label.__super__.constructor.apply(this, arguments);
    }

    Label.prototype.attributes = styles.view;

    Label.prototype.initialize = function() {};

    Label.prototype.render = function() {
      var meta, primary, _ref, _ref2, _ref3, _ref4;
      _ref = this.extractLabels(this.options.label), primary = _ref.primary, meta = _ref.meta;
      this.view.add(this.primary = this.make('Label', styles.primary, (_ref2 = this.options.labelStyle) != null ? _ref2.primary : void 0, {
        text: primary
      }));
      if (meta) {
        this.view.add(this.meta = this.make('Label', styles.meta, (_ref3 = this.options.labelStyle) != null ? _ref3.meta : void 0, {
          text: meta
        }));
      }
      this.view.height = this.primary.height + (((_ref4 = this.meta) != null ? _ref4.height : void 0) || 0);
      return this;
    };

    Label.prototype.extractLabels = function(label) {
      if (_.isString(label)) {
        return {
          primary: label
        };
      } else {
        return {
          primary: label.primary,
          meta: label.meta
        };
      }
    };

    return Label;

  })(View);

}).call(this);
}, "views/ui/table/details/index": function(exports, require, module) {(function() {
  var DetailsTable, Table, ViewList, styles,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui;

  Table = require('../index');

  ViewList = require('presenters/view_list');

  module.exports = DetailsTable = (function(_super) {

    __extends(DetailsTable, _super);

    function DetailsTable() {
      DetailsTable.__super__.constructor.apply(this, arguments);
    }

    DetailsTable.prototype.attributes = styles.table.details.view;

    DetailsTable.prototype.initialize = function() {
      this.options = _.defaults({}, this.options, {
        rowClass: require('./row'),
        autoHeight: true
      });
      return DetailsTable.__super__.initialize.apply(this, arguments);
    };

    return DetailsTable;

  })(Table);

}).call(this);
}, "views/ui/table/details/row": function(exports, require, module) {(function() {
  var DetailTableRow, Label, Row, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui.table.details;

  Row = require('../row');

  Label = require('views/ui/label');

  module.exports = DetailTableRow = (function(_super) {

    __extends(DetailTableRow, _super);

    function DetailTableRow() {
      this.renderLabel = __bind(this.renderLabel, this);
      this.render = __bind(this.render, this);
      this.events = __bind(this.events, this);
      this.attributes = __bind(this.attributes, this);
      DetailTableRow.__super__.constructor.apply(this, arguments);
    }

    DetailTableRow.prototype.attributes = function() {
      return {
        hasChild: this.model.get('click') != null
      };
    };

    DetailTableRow.prototype.events = function() {
      return {
        'click': this.model.get('click')
      };
    };

    DetailTableRow.prototype.initialize = function() {
      var _this = this;
      return this.bindTo(this.model, "change", function() {
        return _this.render();
      });
    };

    DetailTableRow.prototype.render = function() {
      var _this = this;
      this.wrap(function(view) {
        view.add(_this.title = _this.renderLabel('title'));
        if (_this.model.get('subtitle')) {
          return view.add(_this.renderLabel('subtitle'));
        } else {
          return _this.title.width = '100%';
        }
      });
      return this;
    };

    DetailTableRow.prototype.renderLabel = function(name) {
      var label;
      label = new Label({
        label: this.model.get(name),
        style: styles.row[name].view,
        labelStyle: styles.row[name].label,
        controller: this.controller
      });
      return label.render().view;
    };

    return DetailTableRow;

  })(Row);

}).call(this);
}, "views/ui/table/index": function(exports, require, module) {(function() {
  var CollectionView, DEFAULT_ROW_HEIGHT, Table,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  CollectionView = require('views/base/collection');

  DEFAULT_ROW_HEIGHT = 44;

  module.exports = Table = (function(_super) {

    __extends(Table, _super);

    function Table() {
      this.adjustHeight = __bind(this.adjustHeight, this);
      this.addOne = __bind(this.addOne, this);
      Table.__super__.constructor.apply(this, arguments);
    }

    Table.prototype.viewName = 'TableView';

    Table.prototype.addOne = function(model) {
      var row, rowView;
      row = new this.options.rowClass({
        model: model,
        controller: this.controller
      });
      rowView = row.render().view;
      this.view.appendRow(rowView);
      if (this.options.autoHeight) return this.adjustHeight(rowView);
    };

    Table.prototype.adjustHeight = function(rowView) {
      var _base;
      if ((_base = this.view).height == null) _base.height = 0;
      return this.view.height += rowView.height || DEFAULT_ROW_HEIGHT;
    };

    return Table;

  })(CollectionView);

}).call(this);
}, "views/ui/table/navigation": function(exports, require, module) {(function() {
  var DetailsTable, NavigationTable,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  DetailsTable = require('./details');

  module.exports = NavigationTable = (function(_super) {

    __extends(NavigationTable, _super);

    function NavigationTable() {
      NavigationTable.__super__.constructor.apply(this, arguments);
    }

    return NavigationTable;

  })(DetailsTable);

}).call(this);
}, "views/ui/table/row": function(exports, require, module) {(function() {
  var Row, View,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  View = require('views/base');

  module.exports = Row = (function(_super) {

    __extends(Row, _super);

    function Row() {
      Row.__super__.constructor.apply(this, arguments);
    }

    Row.prototype.viewName = 'TableViewRow';

    return Row;

  })(View);

}).call(this);
}, "views/ui/tabs/group": function(exports, require, module) {(function() {
  var CollectionView, Controller, Tab, TabGroup, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles').ui;

  Controller = require('views/controller');

  CollectionView = require('views/base/collection');

  Tab = require('./tab');

  module.exports = TabGroup = (function(_super) {

    __extends(TabGroup, _super);

    function TabGroup() {
      this.destroy = __bind(this.destroy, this);
      this.close = __bind(this.close, this);
      this.open = __bind(this.open, this);
      this._bindControllerEvents = __bind(this._bindControllerEvents, this);
      this.addOne = __bind(this.addOne, this);
      TabGroup.__super__.constructor.apply(this, arguments);
    }

    TabGroup.prototype.viewName = 'TabGroup';

    TabGroup.prototype.events = {
      close: 'destroy'
    };

    TabGroup.prototype.addOne = function(presenter) {
      var tabView;
      tabView = new Tab({
        presenter: presenter,
        controller: this.controller
      });
      return this.view.addTab(tabView.render().view);
    };

    TabGroup.prototype._bindControllerEvents = function() {
      this.controller = new Controller({
        context: this
      });
      return TabGroup.__super__._bindControllerEvents.apply(this, arguments);
    };

    TabGroup.prototype.open = function() {
      return this.view.open();
    };

    TabGroup.prototype.close = function() {
      return this.view.close();
    };

    TabGroup.prototype.destroy = function() {
      return this.trigger('destroy');
    };

    return TabGroup;

  })(CollectionView);

}).call(this);
}, "views/ui/tabs/index": function(exports, require, module) {(function() {

  module.exports = {
    Tab: require('./tab'),
    Group: require('./group')
  };

}).call(this);
}, "views/ui/tabs/tab": function(exports, require, module) {(function() {
  var Controller, Tab, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Controller = require('views/controller');

  View = require('views/base');

  module.exports = Tab = (function(_super) {

    __extends(Tab, _super);

    function Tab() {
      this.renderWindow = __bind(this.renderWindow, this);
      this.initializeController = __bind(this.initializeController, this);
      this.render = __bind(this.render, this);
      this.attributes = __bind(this.attributes, this);
      Tab.__super__.constructor.apply(this, arguments);
    }

    Tab.prototype.viewName = 'Tab';

    Tab.prototype.attributes = function() {
      return {
        title: this.presenter.get('title'),
        icon: "images/" + (this.presenter.get('icon'))
      };
    };

    Tab.prototype.initialize = function() {
      return this.initializeController();
    };

    Tab.prototype.render = function() {
      this.view.window = this.renderWindow();
      return this;
    };

    Tab.prototype.initializeController = function() {
      var _this = this;
      this.childController = new Controller;
      return this.bindTo(this.childController, 'show', function(name, window, options) {
        _this.childController.context = window;
        if ((options != null ? options.modal : void 0) || window.view.modal) {
          return window.render().open({
            modal: true
          });
        } else {
          return _this.view.open(window.render().view);
        }
      });
    };

    Tab.prototype.renderWindow = function() {
      var window;
      window = new (this.presenter.get('viewClass'))({
        controller: this.childController,
        style: {
          title: this.presenter.get('title')
        }
      });
      return window.render().view;
    };

    return Tab;

  })(View);

}).call(this);
}, "views/ui/window": function(exports, require, module) {(function() {
  var View, Window, styles,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  styles = require('styles/ui').window;

  View = require('views/base');

  module.exports = Window = (function(_super) {

    __extends(Window, _super);

    function Window() {
      this._bindControllerEvents = __bind(this._bindControllerEvents, this);
      this.destroy = __bind(this.destroy, this);
      this.close = __bind(this.close, this);
      this.open = __bind(this.open, this);
      this.layout = __bind(this.layout, this);
      Window.__super__.constructor.apply(this, arguments);
    }

    Window.prototype.viewName = 'Window';

    Window.prototype.attributes = function(extensions) {
      if (extensions) {
        return _.extend({}, styles.view, extensions);
      } else {
        return styles.view;
      }
    };

    Window.prototype.events = {
      close: 'destroy'
    };

    Window.prototype.layout = function(options, callback) {
      var _this = this;
      if (callback == null) {
        callback = options;
        options = {};
      }
      return this.wrap(function(view) {
        var layout;
        view.add(layout = _this.make('View', options.style || styles.layouts["default"]));
        return callback(layout);
      });
    };

    Window.prototype.open = function(options) {
      return this.view.open(options);
    };

    Window.prototype.close = function(options) {
      return this.view.close(options);
    };

    Window.prototype.destroy = function() {
      return this.trigger('destroy');
    };

    Window.prototype._bindControllerEvents = function() {
      var _ref;
      if ((_ref = this.controller) != null) {
        if (_ref.context == null) _ref.context = this;
      }
      return Window.__super__._bindControllerEvents.apply(this, arguments);
    };

    return Window;

  })(View);

}).call(this);
}, "index": function(exports, require, module) {(function() {

  module.exports = {
    run: function() {
      var KitchenSinkIntroView, introView;
      KitchenSinkIntroView = require('ks/views/intro');
      introView = new KitchenSinkIntroView;
      return introView.render().open();
    }
  };

}).call(this);
}, "styles/index": function(exports, require, module) {(function() {

  module.exports = {
    ui: require('./ui')
  };

}).call(this);
}, "styles/theme": function(exports, require, module) {(function() {

  module.exports = {
    colors: require('./theme/default/colors')
  };

}).call(this);
}});
