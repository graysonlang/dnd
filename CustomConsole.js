(() => {
  function numDigits(x) {
    return ((Math.log10((x ^ (x >> 31)) - (x >> 31)) | 0) + 1);
  }

  function formatFloat(f, precision, width = 0) {
    f = parseFloat(f);
    return (precision ? f.toPrecision(Math.min(100, precision + numDigits(f))) : f.toString()).padStart(width, ' ');
  }

  function formatInt(i, precision = 0, width = 0) {
    return (parseInt(i) | 0).toString().padStart(precision, '0').padStart(width, ' ');
  }

  function formatObject(o) {
    const seen = [];
    function _formatObjectHelper(o, depth = 0) {
      if (o && typeof o === 'object') {
        // Check if recursion depth has been reached or if we've hit a cycle.
        if (depth > 3 || seen.indexOf(o) !== -1) {
          // If depth limit or cycle is encountered, insert a reasonable placeholder.
          if (Array.isArray(o)) {
            return '[...]';
          } else {
            return '{...}';
          }
        }
        seen.push(o);
        if (Array.isArray(o)) {
          // Handle Arrays.
          const length = o.length;
          let count = 0;
          o.forEach(() => ++count);
          // Check if array is sparse (i.e. has empty slots).
          if (count < length) {
            // Check how sparse (i.e. if the empty slots outnumber non-empty).
            if ((length - count) > count) {
              // If it's very sparse, only print indices and values.
              const contents = [];
              for (var k of Object.keys(o)) {
                contents.push(k + ': ' + (o.hasOwnProperty(k) ? _formatObjectHelper(o[k], depth + 1) : undefined));
              }
              return 'Array(' + length + ') [' + contents.join(', ') + ']';
            }
          }
          // Dense or partially sparse array, just print out all the values with potential gaps.
          const contents = [];
          for (var i = 0; i < length; ++i) {
            contents.push((o.hasOwnProperty(i) ? _formatObjectHelper(o[i], depth + 1) : 'empty'));
          }
          return 'Array(' + length + ') [' + contents.join(', ') + ']';
        }
        // Handle Objects.
        const contents = [];
        for (var k of Object.getOwnPropertyNames(o)) {
          contents.push(k + ': ' + (o.hasOwnProperty(k) ? _formatObjectHelper(o[k], depth + 1) : undefined));
        }
        return '{' + contents.join(', ') + '}';
      } else if (o && typeof o === 'string') {
        return '\"' + o + '\"';
      } else if (o === undefined) {
        return 'undefined';
      } else {
        return o;
      }
    }
    return _formatObjectHelper(o);
  }

  const regex_substitution = /%(\d*).?(\d*)([cdfiOos])/g;
  function gatherSubstitutions(s) {
    const result = [];
    var match;
    while (match = regex_substitution.exec(s)) {
      result.push(match);
    }
    return result.length ? result : undefined;
  }

  function formatForLogging(first, ...rest) {
    const output = [];
    if (typeof first === 'string') {
      const matches = gatherSubstitutions(first) ?? [];
      let position = 0;
      for (var match of matches) {
        if (rest.length < 1) {
          break;
        }
        output.push(first.substring(position, match.index));
        position = match.index + match[0].length;
        let kind = match[3];
        let param = rest.shift();
        switch(kind) {
          case 'c':
          // Don't process CSS styling of output.
          break;
          // Integer
          case 'd':
          case 'i':
          output.push(formatInt(param, parseInt(match[2]), parseInt(match[1])));
          break;
          // Float
          case 'f':
          output.push(formatFloat(param, parseInt(match[2]), parseInt(match[1])));
          break;
          // Object
          case 'O':
          case 'o':
          output.push(formatObject(param));
          break;
          // String
          case 's':
          output.push('' + param.toString());
          break;
        }
      }
      // Append remaining portion of format string.
      output.push(first.substring(position, first.length));
    } else {
      // First argument is not a string, add it to the front of the array to be processed.
      rest.unshift(first);
    }
    // Handle remaining params (also is fallthrough case for first argument not being a String).
    while (rest.length) {
      let param = rest.shift();
      if (typeof param === 'object') {
        output.push((output.length > 0 ? ' ' : '') + formatObject(param));
      } else {
        output.push((output.length > 0 ? ' ' : '') + param);
      }
    }
    return output.join('');
  }

  // Function to send logging data back to native client.
  function _custom_log(level, ...params) {
    if (_customConsoleFunction) _customConsoleFunction(level, formatForLogging(...params));
  }

  // Store the built-in console methods as private so we can replace them.
  let _console_assert = console.assert;
  let _console_debug  = console.debug;
  let _console_error  = console.error;
  let _console_info   = console.info;
  let _console_log    = console.log;
  let _console_warn   = console.warn;

  // Replace the built-in console methods.
  window.console.assert = function(assertion, ...rest) {
    if (arguments.length && !assertion) _custom_log('error', ...['Assertion failed: ', ...rest]);
    _console_assert(...arguments);
  };
  window.console.debug = function() {
    if (arguments.length) _custom_log('debug', ...arguments);
    _console_debug(...arguments);
  };
  window.console.error = function() {
    if (arguments.length) _custom_log('error', ...arguments);
    _console_error(...arguments);
  };
  window.console.info = function() {
    if (arguments.length) _custom_log('info', ...arguments);
    _console_info(...arguments);
  };
  window.console.log = function() {
    if (arguments.length) _custom_log('log', ...arguments);
    _console_log(...arguments);
  };
  window.console.warn = function() {
    if (arguments.length) _custom_log('warn', ...arguments);
    _console_warn(...arguments);
  };
})();

var _customConsoleFunction;
export default function registerCustomConsoleFunction(func) {
  _customConsoleFunction = func;
}
