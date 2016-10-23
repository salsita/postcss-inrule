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
    'body{div, span{h2{@in <.mod{prop: value;}}}}',
    'body{div, span{h2{}}}body{div.mod, span.mod{h2{prop: value}}}');
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
    'body{div, span{h2{@in ^.mod{prop: value;}}}}',
    'body{div, span{h2{}}}body{div .mod, span .mod{h2{prop: value}}}');
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
    'body{div, span{h2{@in @.mod{prop: value;}}}}',
    'body{div, span{h2{}}}body{.mod{h2{prop: value}}}');
});

test('Replace multiple in parent selector', t => {
  return run(t,
    'body{div{h2{@in @.mod1 @@[mod2]{prop: value;}}}}',
    'body{div{h2{}}}[mod2]{.mod1{h2{prop: value}}}');
});
