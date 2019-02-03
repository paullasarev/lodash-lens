const { curry, compose, get, set } = require('lodash/fp');

const mapWith = curry((func, val) => {
  return val.map(func);
});

const lens = curry(
  (getter, setter, focus, func, target) => 
    mapWith(replacement => setter(focus, replacement, target), func(getter(focus, target)))
);

const lensPath = (...paths) => compose(
  ...paths.map( path => func => target => {
      return mapWith(replacement => set(path, replacement, target), func(get(path, target)))
}));

const pathLens = lens(get, set);

const Const = x => ({value: x, map: function(){ return this; }});

const Identity = x => ({value: x, map: func => Identity(func(x)) });

const view = curry( (lens, target) => lens(Const)(target).value );

const over = curry( (lens, func, target) => lens(y => Identity(func(y)))(target).value);

const always = x => y => x;
const replace = curry( (lens, val, target) => over(lens, always(val), target) );

module.exports = {
  mapWith,
  lens,
  lensPath,
  pathLens,
  view,
  over,
  replace,
};