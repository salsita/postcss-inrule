var postcss = require('postcss'),
    assign = require('object-assign');

// Get index of inRule tags
function getTagIndex (string, tag) {
  var tags = string.match('^' + tag + '+');
  return (tags && tags[0].length) || 0;
}

// Lil' Shavy™
function getShavedClone (clone) {
  var element, current, first = true;
  // Find current element and remove its props
  clone.walkAtRules('in', function (inRule) {
    if (first) {
      first = false;
      current = element = inRule.parent;
      element.removeAll();
    }
  });
  // Clean all parent props that don't lead to current element
  while (current.parent) {
    current.parent.each(function (node) {
      (node !== current) && node.remove();
    })
    current = current.parent;
  }
  return element;
}

// Process modifications on clone
function processModifications (clone, params, options, inRule) {
  for (var param of params) {
    var appendIndex = getTagIndex(param, options.tagAppend),
        insertIndex = getTagIndex(param, options.tagInsert),
        replaceIndex = getTagIndex(param, options.tagReplace),
        currentIndex = Math.max(appendIndex, insertIndex, replaceIndex),
        modifier = param.slice(currentIndex, param.length),
        modified = false,
        nodeCount = 0;
    while (clone.parent && !modified) {
      var selectors = clone.parent.selectors;
      if (selectors) {
        nodeCount++;
        if (nodeCount >= currentIndex && clone.parent.type !== 'root') {
          // Append
          if (appendIndex > 0) {
            clone.parent.selectors = selectors.map(function (selector) {
              return selector + modifier;
            })
          // Insert
          } else if (insertIndex > 0) {
            clone.parent.selectors = selectors.map(function (selector) {
              return selector + ' ' + modifier;
            })

          } else if (replaceIndex > 0) {
            clone.parent.selectors = [modifier];
          } else {
            throw inRule.error("No valid tag found", { word: param });
          }
          modified = true;
        }
      }
      clone = clone.parent;
    }
    if (!modified) {
      throw inRule.error("No parent to modify found", { word: param });
    }
  }
  return clone;
}

module.exports = postcss.plugin('postcss-inrule', function(options) {
  return function(css, options) {

    // TODO
    // test options inheritance
    // write some actual tests
    // improve tagIndex regex
    // remove immediate at-rules that have no decls from original node

    // Options
    options = options || {};
    var defaultOptions = {
      tagAppend: '<',
      tagInsert: '\\^',
      tagReplace: '@',
      bubble: ['document', 'media', 'supports']
    };
    options = assign({
        tagAppend: options.tagAppend || defaultOptions.tagAppend,
        tagInsert: options.tagInsert || defaultOptions.tagInsert,
        tagReplace: options.tagReplace || defaultOptions.tagReplace,
        bubble: options.bubble || defaultOptions.bubble
    }, options);

    // Process @in at-rules
    css.walkAtRules('in', function (inRule) {

      // Clone a prop-less tree clone for every ',' param
      var rule = inRule.root().clone();
      for (var params of inRule.params.split(',')) {
        var clone = getShavedClone(rule.clone());

        // Process modifications and append new rule to root
        params = postcss.list.space(params);
        processModifications(clone, params, options, inRule);
        clone.append(inRule.nodes);
        css.append(clone.root());
      }
      // Remove original @in rule and all children
      inRule.removeAll().remove();
    });
  }
});
