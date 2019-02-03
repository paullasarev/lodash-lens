const { get, set } = require('lodash/fp');

const { mapWith, lens, view, over, replace, lensPath, pathLens } = require('./lens.js');

describe('mapWith', () => {
  test('should map over array', () => {
    const result = mapWith((value) => value +1, [1,2]);
    expect(result).toEqual([2,3]);
  });
});

describe('view', () => {
  test('should return value', () => {
    const result = view(pathLens('a'), {a:1});
    expect(result).toBe(1);
  });
  test('should get nested path', () => {
    const result = view(pathLens('a.b'), {a:{b:1}});
    expect(result).toBe(1);
  });
});

describe('over', () => {
  test('should immutably modify result', () => {
    const obj = {a:1};
    const result = over(pathLens('a'), (val=>val+1), obj);
    expect(result).toEqual({a:2});
    expect(result !== obj).toBeTruthy();
  });
  test('should over nested path', () => {
    const obj = {a:{b:1}};
    const result = over(pathLens('a.b'), (val=>val+1), obj);
    expect(result).toEqual({a:{b:2}});
    expect(result !== obj).toBeTruthy();
  });
});

describe('replace', () => {
  test('should replace with value', () => {
    const obj = {a:1};
    const result = replace(pathLens('a'), 2, obj);
    expect(result).toEqual({a:2});
    expect(result !== obj).toBeTruthy();
  });
  test('should replace for nested path', () => {
    const obj = {a:{b:1}};
    const result = replace(pathLens('a.b'), 2, obj);
    expect(result).toEqual({a:{b:2}});
    expect(result !== obj).toBeTruthy();
  });
});

describe('lensPath', () => {
  test('should view one level', () => {
    const obj = {a:1};
    const result = view(lensPath('a'), obj);
    expect(result).toBe(1);
  });
  test('should over one level', () => {
    const obj = {a:1};
    const result = over(lensPath('a'), (val=>val+1), obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({a:2});
  });
  test('should view nested level', () => {
    const obj = {a:{b:1}};
    const result = view(lensPath('a','b'), obj);
    expect(result).toBe(1);
  });
  test('should over nested level', () => {
    const obj = {a:{b:1}};
    const result = over(lensPath('a','b'), (val=>val+1), obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({a:{b:2}});
  });
  test('should view nested array', () => {
    const obj = {a:[{b:1}]};
    const result = view(lensPath('a', 0, 'b'), obj);
    expect(result).toBe(1);
  });
  test('should over nested level', () => {
    const obj = {a:[{b:1}]};
    const result = over(lensPath('a', 0, 'b'), (val=>val+1), obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({a:[{b:2}]});
  });
});