const { curry, compose, get, set, find, findIndex, pick,
  flatten, isArray, isObject, isUndefined } = require('lodash/fp');

const mapWith = curry((func, val) => {
  return val.map(func);
});

const lens = (getter, setter) => {
  return (func) => {
    const funcGetter = compose(func, getter);
    return (target) => 
      mapWith(replacement => setter(replacement, target), funcGetter(target));
  };
};


const mapConst = x => ({value: x, map: function(){ return this; }});

const mapIdentity = x => ({value: x, map: func => mapIdentity(func(x)) });

const view = curry( (lensFunc, target) => lensFunc(mapConst)(target).value );

const over = curry( (lensFunc, func, target) => lensFunc(y => mapIdentity(func(y)))(target).value);

const always = x => y => x;
const same = x => x;
const replace = curry( (lens, val, target) => over(lens, always(val), target) );

const merge = curry( (lens, val, target) => over(lens, 
  (obj)=>({...obj, ...val}),
  target));


const pathLens = (path) => isUndefined(path) 
  ? lens(same, same)
  : lens(get(path), set(path));

const pickLens = (...props) => lens(
  (obj) => pick(flatten(props), obj),
  (replacement, obj) => {
    if (!isObject(obj)) {
      return obj;
    }
    return {...obj, ...replacement};
  },
);

const findLens = (props) => lens(
  (obj) => find(props, obj),
  (replacement, obj) => {
    if (!isArray(obj)) {
      return obj;
    }
    const result = [...obj];
    const index = findIndex(props, result);
    if (index >= 0) {
      result.splice(index, 1, replacement);
    }
    return result;
  },
);

module.exports = {
  mapWith,
  lens,
  pathLens,
  view,
  over,
  replace,
  merge,
  pickLens,
  findLens,
};
