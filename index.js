var postcss = require('postcss'),
    assign = require('object-assign');

// Get index of inRule tags
function getTagIndex (string, tag) {
  var tags = string.match('^' + tag + '+');
  return (tags && tags[0].length) || 0;
}

// Lil' Shavy™
function getShavedClone (clone, props) {
  var element, current, nodeCount = 0;
  // Save first current element and remove its props
  clone.walkAtRules('in', function (inRule) {
    nodeCount++;
    if (nodeCount === 1) {
      element = current = inRule.parent;
      element.removeAll();
    }
  });
  // Clean all parent props that aren't the current child
  while (current.parent) {
    current.parent.each(function (node) {
      (node !== current) && node.remove();
    })
    current = current.parent;
  }
  return element;
}

// Process inRule modifications on clone
function processModifications (clone, params, options, inRule) {
  for (var param of params) {
    var appendIndex = getTagIndex(param, options.tagAppend),
        insertIndex = getTagIndex(param, options.tagInsert),
        replaceIndex = getTagIndex(param, options.tagReplace),
        currentIndex = Math.max(appendIndex, insertIndex, replaceIndex),
        modifier = param.slice(currentIndex, param.length),
        modified = false,
        current = clone,
        nodeCount = 0;

    while (current.parent && !modified) {
      var selectors = current.parent.selectors;
      if (selectors) {
        nodeCount++;
        if (nodeCount >= currentIndex) {
          if (appendIndex > 0) {
            current.parent.selectors = selectors.map(function (selector) {
              return selector + modifier;
            })
          } else if (insertIndex > 0) {
            current.parent.selectors = selectors.map(function (selector) {
              return selector + ' ' + modifier;
            })
          } else if (replaceIndex > 0) {
            current.parent.selectors = [modifier];
          } else {
            throw inRule.error("No valid tag found", { word: param });
          }
          modified = true;
        }
      }
      current = current.parent;
    }
    if (!modified) {
      throw inRule.error("No parent to modify found", { word: param });
    }
  }
  return current;
}

module.exports = postcss.plugin('postcss-inrule', function(options) {
  return function(css, options) {

    // TODO
    // test options inheritance
    // write some actual tests
    // improve tagIndex regex

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

      // Clone a prop-less node tree for every param
      for (var params of inRule.params.split(',')) {
        params = postcss.list.space(params);
        var props = inRule.clone().nodes,
            clone = getShavedClone(inRule.root().nodes[0].clone());

        // Process inRule modifications and append rule to root
        clone.append(props);
        processModifications(clone, params, options, inRule);
        css.append(clone.root());
      }
      // Remove original @in rule after all clones are processed
      inRule.remove();
    });
  }
});
