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
  return run(t, 'body{div{h2{@in <.mod{prop: value;}}}}', 'body{div{h2{}}}body{div.mod{h2{prop: value}}}'); // eslint-disable-line max-len
});

test('Insert in parent selector', t => {
  return run(t, 'body{div{h2{@in ^.mod{prop: value;}}}}', 'body{div{h2{}}}body{div .mod{h2{prop: value}}}'); // eslint-disable-line max-len
});

test('Replace in parent selector', t => {
  return run(t, 'body{div{h2{@in @.mod{prop: value;}}}}', 'body{div{h2{}}}body{.mod{h2{prop: value}}}'); // eslint-disable-line max-len
});
