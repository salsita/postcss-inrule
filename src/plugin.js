/*
  postcss-inrule
  github.com/salsita/postcss-inrule
  2016 | MIT
  ============================== */

import postcss from 'postcss';
import assign from 'object-assign';

// Get index of inRule tags
function getTagIndex(string, tag) {
  const tags = string.match(`^${tag}+`);
  return tags && tags[0].length || 0;
}

// Lil' Shavy™
function getShavedClone(clone) {
  let element, current;
  // Find current element and remove its props
  clone.walkAtRules('in', inRule => {
    current = inRule.parent;
    current.removeAll();
    return false;
  });
  element = current;
  // Clean all parent props that don't lead to current element
  while (current.parent) {
    current.parent.each(node => {
      node !== current && node.remove();
    });
    current = current.parent;
  }
  return element;
}

// Process modifications on clone
function processModifications(clone, params, options, inRule) {
  for (const param of params) {
    const appendIndex = getTagIndex(param, options.tagAppend);
    const insertIndex = getTagIndex(param, options.tagInsert);
    const replaceIndex = getTagIndex(param, options.tagReplace);
    const currentIndex = Math.max(appendIndex, insertIndex, replaceIndex);
    const modifier = param.slice(currentIndex, param.length);
    let current = clone;
    let nodeIndex = current.type !== 'rule' ? -1 : 0;
    let modified = false;
    while (current.parent && !modified) {
      const selectors = current.parent.selectors;
      if (selectors) {
        nodeIndex++;
        if (nodeIndex >= currentIndex && clone.parent.type !== 'root') {
          // Append
          if (appendIndex > 0) {
            current.parent.selectors = selectors.map(
              selector => selector + modifier);
          // Insert
          } else if (insertIndex > 0) {
            current.parent.selectors = selectors.map(
              selector => `${selector} ${modifier}`);
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
  }
  return clone;
}

export default postcss.plugin('postcss-inrule', options => css => {

  // Options
  options = options || {};
  const defaultOptions = {
    tagAppend: '<',
    tagInsert: '\\^',
    tagReplace: '@'
  };
  options = assign({
    tagAppend: options.tagAppend || defaultOptions.tagAppend,
    tagInsert: options.tagInsert || defaultOptions.tagInsert,
    tagReplace: options.tagReplace || defaultOptions.tagReplace
  }, options);

  // Process @in at-rules
  css.walkAtRules('in', inRule => {

    // Clone a prop-less tree clone for every ',' param
    for (let params of inRule.params.split(',')) {
      let clone = getShavedClone(inRule.root().clone());

      // Process modifications and append new rule to root
      params = postcss.list.space(params);
      processModifications(clone, params, options, inRule);
      if (inRule.nodes.length > 0) {
        clone.append(inRule.nodes);
      } else {
        throw inRule.error('No children or decls', { word: inRule });
      }
      css.append(clone.root());
    }
    // Remove original @in rule and all children
    inRule.removeAll().remove();
  });
});
