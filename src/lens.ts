import { type CurriedFunction2, type CurriedFunction3 } from "lodash";
import { compose, curry, get, isUndefined, set } from "lodash/fp";

export type AnyFunc = (arg: any, ...rest: any) => any;

interface ValueMap {
  value: any;
  map: (val?: any) => any;
}

type MapFunc = (target: any) => any;
type LensFunc = (valueMap: ValueMap) => MapFunc;

export { compose };

export const mapWith = curry((func: AnyFunc, val: any) => {
  return val.map(func);
});

type LensType = (
  getter: (obj: any) => any,
  setter: (obj: any, val: any) => any
) => LensFunc;
export const lens: LensType = (getter, setter) => {
  return (func: any) => {
    const funcGetter = compose(func, getter);
    return (target: any) =>
      mapWith(
        (replacement: any) => setter(replacement, target),
        funcGetter(target)
      );
  };
};

const mapConst = (x: any) => ({
  value: x,
  map: function () {
    return this;
  },
});

const mapIdentity = (x: any) => ({
  value: x,
  map: (func: AnyFunc) => mapIdentity(func(x)),
});

export const view: CurriedFunction2<LensFunc, any, any> = curry(
  (lensFunc: any, target: any) => lensFunc(mapConst)(target).value
);

export const over: CurriedFunction3<LensFunc, MapFunc, any, any> = curry(
  (lensFunc: AnyFunc, func: AnyFunc, target: any) =>
    lensFunc((y: any) => mapIdentity(func(y)))(target).value
);

export const always = (x: any) => (y: any) => x;
export const same = (x: any, val?: any) => x;

export const replace: CurriedFunction3<LensFunc, any, any, any> = curry(
  (lens: any, val: any, target: any) => over(lens, always(val), target)
);

export const merge: CurriedFunction3<LensFunc, any, any, any> = curry(
  (lens: any, val: any, target: any) =>
    over(lens, (obj: any) => ({ ...obj, ...val }), target)
);

type PathLens = (path?: string | Array<string | number>) => LensFunc;
export const pathLens: PathLens = (path) =>
  isUndefined(path) ? lens(same, same) : lens(get(path), set(path));

export const setPath = curry((path: string, val: any, target: any) =>
  replace(pathLens(path), val, target)
);

export const setValue = curry((val: any, path: string, target: any) =>
  replace(pathLens(path), val, target)
);

export const mergePath = curry((path: string, val: any, target: any) =>
  merge(pathLens(path), val, target)
);

export const overPath = curry(
  (path: string, func: (value: any) => any, target: any) =>
    over(pathLens(path), func, target)
);
