'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Get index of inRule tags
/*
  postcss-inrule
  github.com/salsita/postcss-inrule
  2016 | MIT
  ============================== */

function getTagIndex(string, tag) {
  var tags = string.match('^' + tag + '+');
  return tags && tags[0].length || 0;
}

// Lil' Shavy™
function getShavedClone(clone) {
  var element = void 0,
      current = void 0;
  // Find current element and remove its props
  clone.walkAtRules('in', function (inRule) {
    current = inRule.parent;
    current.removeAll();
    return false;
  });
  element = current;
  // Clean all parent props that don't lead to current element
  while (current.parent) {
    current.parent.each(function (node) {
      node !== current && node.remove();
    });
    current = current.parent;
  }
  return element;
}

// Process modifications on clone
function processModifications(clone, params, options, inRule) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var param = _step.value;

      var appendIndex = getTagIndex(param, options.tagAppend);
      var insertIndex = getTagIndex(param, options.tagInsert);
      var replaceIndex = getTagIndex(param, options.tagReplace);
      var currentIndex = Math.max(appendIndex, insertIndex, replaceIndex);
      var modifier = param.slice(currentIndex, param.length);
      var current = clone;
      var nodeIndex = current.type !== 'rule' ? -1 : 0;
      var modified = false;
      while (current.parent && !modified) {
        var selectors = current.parent.selectors;
        if (selectors) {
          nodeIndex++;
          if (nodeIndex >= currentIndex && clone.parent.type !== 'root') {
            // Append
            if (appendIndex > 0) {
              current.parent.selectors = selectors.map(function (selector) {
                return selector + modifier;
              });
              // Insert
            } else if (insertIndex > 0) {
              current.parent.selectors = selectors.map(function (selector) {
                return selector + ' ' + modifier;
              });
              // Replace
            } else if (replaceIndex > 0) {
              current.parent.selectors = [modifier];
            } else {
              throw inRule.error('No valid tag found', { word: param });
            }
            modified = true;
          }
        }
        current = current.parent;
      }
      if (!modified) {
        throw inRule.error('No parent to modify found', { word: param });
      }
    };

    for (var _iterator = params[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return clone;
}

exports.default = _postcss2.default.plugin('postcss-inrule', function (options) {
  return function (css) {

    // Options
    options = options || {};
    var defaultOptions = {
      tagAppend: '<',
      tagInsert: '\\^',
      tagReplace: '@'
    };
    options = (0, _objectAssign2.default)({
      tagAppend: options.tagAppend || defaultOptions.tagAppend,
      tagInsert: options.tagInsert || defaultOptions.tagInsert,
      tagReplace: options.tagReplace || defaultOptions.tagReplace
    }, options);

    // Process @in at-rules
    css.walkAtRules('in', function (inRule) {

      // Clone a prop-less tree clone for every ',' param
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = inRule.params.split(',')[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var params = _step2.value;

          var clone = getShavedClone(inRule.root().clone());

          // Process modifications and append new rule to root
          params = _postcss2.default.list.space(params);
          processModifications(clone, params, options, inRule);
          if (inRule.nodes.length > 0) {
            clone.append(inRule.nodes);
          } else {
            throw inRule.error('No children or decls', { word: inRule });
          }
          css.append(clone.root());
        }
        // Remove original @in rule and all children
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      inRule.removeAll().remove();
    });
  };
});
