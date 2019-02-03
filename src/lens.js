const { curry, compose, get, set, isString, isNumber, find, findIndex, pick, flatten } = require('lodash/fp');

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
const replace = curry( (lens, val, target) => over(lens, always(val), target) );

const getBy = (fpath) => {
  if (isString(fpath)||isNumber(fpath)) {
    return get(fpath);
  }
  return find(fpath);
};

const setBy = (fpath) => {
  if (isString(fpath)||isNumber(fpath)) {
    return set(fpath);
  }
  return curry((val, obj) => {
    const index = findIndex(fpath, obj);
    if (index>=0) {
      obj[index] = val;
    }
    return obj;
  });
};

// less optimized but laconic version
// const lensPath = (...paths) => compose(
//   ...paths.map( path => func => target => {
//     return mapWith(replacement => setBy(path)(replacement, target), compose(func, getBy(path))(target))
// }));
const lensPath = (...paths) => compose(
  ...paths.map( path => {
    const setter = setBy(path);
    const getter = getBy(path);
    return func => {
      const funcGetter = compose(func, getter);
      return target => {
        return mapWith(replacement => setter(replacement, target), funcGetter(target))
      };
    };
}));

const pathLens = (path) => lens(get(path), set(path));

const pickLens = (...props) => lens(
  (obj) => pick(flatten(props), obj),
  (replacement, obj) => {
    return {...obj, ...replacement};
  },
);

module.exports = {
  mapWith,
  lens,
  lensPath,
  pathLens,
  view,
  over,
  replace,
  getBy,
  setBy,
  pickLens,
};
