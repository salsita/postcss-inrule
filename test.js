/* eslint-disable max-len */
import postcss from 'postcss';
import test from 'ava';
import plugin from './';

function run(t, input, output, opts = {}) {
  return postcss([plugin(opts)]).process(input)
    .then(result => {
      t.deepEqual(result.css, output);
      t.deepEqual(result.warnings().length, 0);
    });
}

test('Append to parent selector', t => {
  return run(t,
    'body{div{h2{@in <.mod{prop: value;}}}}',
    'body{div{h2{}}}body{div.mod{h2{prop: value}}}');
});

test('Append to parent multiselector', t => {
  return run(t,
    'body{div,span{h2{@in <.mod{prop: value;}}}}',
    'body{div,span{h2{}}}body{div.mod,span.mod{h2{prop: value}}}');
});

test('Append multiple to parent selector', t => {
  return run(t,
    'body{div{h2{@in <.mod1 <<[mod2]{prop: value;}}}}',
    'body{div{h2{}}}body[mod2]{div.mod1{h2{prop: value}}}');
});

test('Insert in parent selector', t => {
  return run(t,
    'body{div{h2{@in ^.mod{prop: value;}}}}',
    'body{div{h2{}}}body{div .mod{h2{prop: value}}}');
});

test('Insert in parent multiselector', t => {
  return run(t,
    'body{div,span{h2{@in ^.mod{prop: value;}}}}',
    'body{div,span{h2{}}}body{div .mod,span .mod{h2{prop: value}}}');
});

test('Insert multiple in parent selector', t => {
  return run(t,
    'body{div{h2{@in ^.mod1 ^^[mod2]{prop: value;}}}}',
    'body{div{h2{}}}body [mod2]{div .mod1{h2{prop: value}}}');
});

test('Replace in parent selector', t => {
  return run(t,
    'body{div{h2{@in @.mod{prop: value;}}}}',
    'body{div{h2{}}}body{.mod{h2{prop: value}}}');
});

test('Replace in parent multiselector', t => {
  return run(t,
    'body{div,span{h2{@in @.mod{prop: value;}}}}',
    'body{div,span{h2{}}}body{.mod{h2{prop: value}}}');
});

test('Replace multiple in parent selector', t => {
  return run(t,
    'body{div{h2{@in @.mod1 @@[mod2]{prop: value;}}}}',
    'body{div{h2{}}}[mod2]{.mod1{h2{prop: value}}}');
});

test('Multiple operations in selector', t => {
  return run(t,
    'body{div{h2{span{@in <.mod1 ^^.mod2 @@@.mod3{prop: value;}}}}}',
    'body{div{h2{span{}}}}.mod3{div .mod2{h2.mod1{span{prop: value}}}}');
});

test('Multiple space separated operations in selector', t => {
  return run(t,
    'body{div{h2{span{@in <.mod1 ^^.mod2 @@@.mod3, <.mod3 ^^.mod1 @@@.mod2{prop: value;}}}}}',
    'body{div{h2{span{}}}}.mod3{div .mod2{h2.mod1{span{prop: value}}}}.mod2{div .mod1{h2.mod3{span{prop: value}}}}');
});

test('Multiple plugin calls in root selector', t => {
  return run(t,
    'body{div{h2{span{@in <.mod1{prop: value;}}@in ^.mod2{prop: value;}}}}',
    'body{div{h2{span{}}}}body{div{h2.mod1{span{prop: value}}}}body{div .mod2{h2{prop: value}}}');
});

test('Nested plugin calls', t => {
  return run(t,
    'body{div{h2{span{@in <.mod1{prop: value;@in ^.mod2{prop: value;}}}}}}',
    'body{div{h2{span{}}}}body{div{h2.mod1{span{prop: value}}}}body{div{h2.mod1 .mod2{span{prop: value}}}}');
});

test('Nested in media query', t => {
  return run(t,
    'body{div{h2{span{@media (max-width: 900px){@in <.mod{prop: value;}}}}}}',
    'body{div{h2{span{@media (max-width: 900px){}}}}}body{div{h2.mod{span{@media (max-width: 900px){prop: value}}}}}');
});

test('Nested in multiple consecutive media queries', t => {
  return run(t,
    'body{div{h2{span{@media (max-width: 900px){@media (min-height: 480px){@media (orientation: landscape){@in <.mod{prop: value;}}}}}}}}',
    'body{div{h2{span{@media (max-width: 900px){@media (min-height: 480px){@media (orientation: landscape){}}}}}}}body{div{h2.mod{span{@media (max-width: 900px){@media (min-height: 480px){@media (orientation: landscape){prop: value}}}}}}}');
});

test('Passing custom tag options', t => {
  return run(t,
    'body{div{h2{span{@in +.mod1 **.mod2 %%%.mod3{prop: value;}}}}}',
    'body{div{h2{span{}}}}.mod3{div .mod2{h2.mod1{span{prop: value}}}}',
    { tagAppend: '\\+', tagInsert: '\\*', tagReplace: '%' });
});
