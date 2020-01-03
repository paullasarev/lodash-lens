'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fp = require('lodash/fp');

const mapWith = fp.curry((func, val) => {
  return val.map(func);
});

const lens = (getter, setter) => {
  return (func) => {
    const funcGetter = fp.compose(func, getter);
    return (target) => 
      mapWith(replacement => setter(replacement, target), funcGetter(target));
  };
};


const mapConst = x => ({value: x, map: function(){ return this; }});

const mapIdentity = x => ({value: x, map: func => mapIdentity(func(x)) });

const view = fp.curry( (lensFunc, target) => lensFunc(mapConst)(target).value );

const over = fp.curry( (lensFunc, func, target) => lensFunc(y => mapIdentity(func(y)))(target).value);

const always = x => y => x;
const same = x => x;
const replace = fp.curry( (lens, val, target) => over(lens, always(val), target) );

const merge = fp.curry( (lens, val, target) => over(lens, 
  (obj)=>({...obj, ...val}),
  target));


const pathLens = (path) => fp.isUndefined(path) 
  ? lens(same, same)
  : lens(fp.get(path), fp.set(path));

const pickLens = (...props) => lens(
  (obj) => fp.pick(fp.flatten(props), obj),
  (replacement, obj) => {
    if (!fp.isObject(obj)) {
      return obj;
    }
    return {...obj, ...replacement};
  },
);

const findLens = (props) => lens(
  (obj) => fp.find(props, obj),
  (replacement, obj) => {
    if (!fp.isArray(obj)) {
      return obj;
    }
    const result = [...obj];
    const index = fp.findIndex(props, result);
    if (index >= 0) {
      result.splice(index, 1, replacement);
    }
    return result;
  },
);

exports.findLens = findLens;
exports.lens = lens;
exports.mapWith = mapWith;
exports.merge = merge;
exports.over = over;
exports.pathLens = pathLens;
exports.pickLens = pickLens;
exports.replace = replace;
exports.view = view;
