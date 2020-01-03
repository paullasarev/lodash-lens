- [lodash-lens](#lodash-lens)
  * [Motivation](#motivation)
  * [Installation](#installation)
  * [Usage](#usage)
    + [lens builder](#lens-builder)
  * [lens operators](#lens-operators)
    + [view](#view)
    + [over](#over)
    + [replace](#replace)
    + [merge](#merge)
    + [operators currying](#operators-currying)
  * [predefined lenses](#predefined-lenses)
    + [pathLens](#pathlens)
    + [pickLens](#picklens)
    + [findLens](#findlens)
  * [lens composition](#lens-composition)

# lodash-lens

minimalistic functional lens to use together with lodash library

links:
* https://medium.com/@dtipson/functional-lenses-d1aba9e52254
* https://github.com/jfmengels/lodash-fp-docs
* https://blog.csssr.ru/2016/07/08/lenses

## Motivation  

Functional [Lenses](https://blog.csssr.ru/2016/07/08/lenses) is a great concept which helps keep code clean and consise. 

Using lens allows to to manupulate object internals in an immutable way.

There are full-fledged implementions like [Ramda](https://ramdajs.com/) or [partial.lenses](https://github.com/calmm-js/partial.lenses). It is a great libraries but they power is sometimes too 

This library implements the *Lens* concept in a quite mimimalistic way and is designed to work on the top of excellent [lodash](https://github.com/lodash/lodash) / [lodash/fp](https://gist.github.com/jfmengels/6b973b69c491375117dc) stack.

## Installation

```bash
> npm install --save-dev lodash-lens
``` 

## Usage

### lens builder

To declare *lens* we need to define a *getter* and *setter* functinos: 

```js
declare function lens(
  getter: (obj:any)=>any,
  setter: (obj:any, val:any)=>any
): LensFunc;

```

```js
import { get, set } from 'lodash/fp';
import { lens } from 'lodash-lens';

const pathLens = lens(get(path), set(path));
```

## lens operators

Using lens operators it is possible to manupulate object internals in an immutable way

### view

*view* allows to get access to object highligted by *lens*:

```js
test('should get nested object', () => {
  const obj = {a:{b:{c:1}}};
  const result = view(pathLens('a.b'), obj);
  expect(result).toBe(obj.a.b);
});
```

### over

*over* allows to apply some function to object highlighted by *lens*

```js
test('should over nested path', () => {
  const obj = {a:{b:1}};
  const result = over(pathLens('a.b'), (val=>val+1), obj);
  expect(result).toEqual({a:{b:2}});
  expect(result !== obj).toBeTruthy();
});
```

### replace

*replace* allows to replace to object highlighted by *lens* to new one

```js
test('should replace for nested path', () => {
  const obj = {a:{b:1}};
  const result = replace(pathLens('a.b'), 2, obj);
  expect(result).toEqual({a:{b:2}});
  expect(result !== obj).toBeTruthy();
});
```

### merge

*merge* allows to merge an object highlighted by *lens* and a new one:

```js
test('should shallow only objects in path', () => {
  const obj = {a:{b:{c:2}}, d:3};
  const result = merge(pathLens('a.b'), {e:4}, obj);
  expect(result).toEqual({a:{b:{c:2, e:4}}, d:3});
  expect(result !== obj).toBeTruthy();
  expect(result.a === obj.a).toBeFalsy();
  expect(result.a.b === obj.a.b).toBeFalsy();
  expect(result.a.c === obj.a.c).toBeTruthy();
  expect(result.d === obj.d).toBeTruthy();
});
```

*Note* that access operators do not make a deep clone of the source object but create a shallow copy of all objects in access path and keeps all other references untouched. That kind of work allows to perform this operation in a memory-effective way keeping immutability invariant.


### operators currying

All *lens* operators have an auto-currying over all arguments:

```js
test('should over nested path', () => {
  const overAB = over(pathLens('a.b'), (val=>val+1));
  
  const obj = {a:{b:1}};
  const result = overAB(obj);
  expect(result).toEqual({a:{b:2}});
  expect(result !== obj).toBeTruthy();
});  
```

## predefined lenses

### pathLens
*pathLens* highlight object by *lodash* get/set accessors

```js
test('should over nested level', () => {
  const obj = {a:[{b:1}]};
  const result = over(pathLens(['a', 0, 'b']), (val=>val+1), obj);
  expect(result !== obj).toBeTruthy();
  expect(result).toEqual({a:[{b:2}]});
});
```

```js
test('should over keys', () => {
  const obj = {a:1,b:2,c:3};
  const result = over(
    pickLens(['a','b']),
    mapValues(val=>val+1),
    obj);
  expect(result).toEqual({a:2,b:3,c:3});
});
```

### pickLens

*pickLens* give access to subset of object by keys

```js
test('should view keys for array arg', () => {
  const obj = {a:1,b:2,c:3};
  const result = view(
    pickLens(['a','b']),
    obj);
  expect(result).toEqual({a:1,b:2});
});
```

```js
import { mapValues } from 'lodash/fp';

test('should over keys', () => {
  const obj = {a:1,b:2,c:3};
  const result = over(
    pickLens(['a','b']),
    mapValues(val=>val+1),
    obj);
  expect(result).toEqual({a:2,b:3,c:3});
});
```

### findLens

*findLens* give access to array members which can be located by standard *lodash* *find* function:

```js
test('should over for identity search', () => {
  const obj = [{id:0, b:0},{id:1, b:1}];
  const result = over(
    findLens({id:1}),
    val=>({...val,b:2}), obj);
  expect(result).toEqual([{id:0, b:0},{id:1, b:2}]);
});
```

## lens composition

*lenses* by itself are pure functions, so they can be easy composed:

```js
test('should over for identity search', () => {
  const obj = {a:[{id:0, b:0},{id:1, b:1}]};
  const result = over(
    compose(pathLens('a'), findLens({id:1}), pathLens('b')),
    (val=>val+1), obj);
  expect(result).toEqual({a:[{id:0, b:0},{id:1, b:2}]});
});
```
