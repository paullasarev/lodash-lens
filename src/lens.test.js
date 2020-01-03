import { mapValues, compose } from 'lodash/fp';

import { mapWith, view, over, replace, merge,
   pathLens, pickLens, findLens } from './lens.js';

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
  test('should get nested arrayed path', () => {
    const result = view(pathLens(['a', 'b']), {a:{b:1}});
    expect(result).toBe(1);
  });
  test('should get nested args path', () => {
    const result = view(pathLens('a.b.c'), {a:{b:{c:1}}});
    expect(result).toBe(1);
  });
  test('should get nested object', () => {
    const obj = {a:{b:{c:1}}};
    const result = view(pathLens('a.b'), obj);
    expect(result).toBe(obj.a.b);
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
  test('should shallow only objects in path', () => {
    const obj = {a:{b:1, c:2}, d:3};
    const result = over(pathLens('a.b'), (val=>val+1), obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({a:{b:2, c:2}, d:3});
    expect(result.a === obj.a).toBeFalsy();
    expect(result.a.b === obj.a.b).toBeFalsy();
    expect(result.a.c === obj.a.c).toBeTruthy();
    expect(result.d === obj.d).toBeTruthy();
  });

  test('should over nested path', () => {
    const overAB = over(pathLens('a.b'), (val=>val+1));
    
    const obj = {a:{b:1}};
    const result = overAB(obj);
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
  test('should shallow objects only in path', () => {
    const obj = {a:{b:{c:1}, e:{o:3}}, f:{o:5}};
    const result = replace(pathLens('a.b'), {c:2,d:3}, obj);
    expect(result).toEqual({a:{b:{c:2,d:3}, e:{o:3}}, f:{o:5}});
    expect(result !== obj).toBeTruthy();
    expect(result.a.b === obj.a.b).toBeFalsy();
    expect(result.a.e === obj.a.e).toBeTruthy();
    expect(result.f === obj.f).toBeTruthy();
    expect(result.a === obj.a).toBeFalsy();
  });
});

describe('pathLens', () => {
  test('should view one level', () => {
    const obj = {a:1};
    const result = view(pathLens('a'), obj);
    expect(result).toBe(1);
  });
  test('should get obj for empty path', () => {
    const obj = {a:1};
    const result = view(pathLens(), obj);
    expect(result).toBe(obj);
  });
  test('should over one level', () => {
    const obj = {a:1};
    const result = over(pathLens('a'), (val=>val+1), obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({a:2});
  });
  test('should view nested level', () => {
    const obj = {a:{b:{c:1}}};
    const result = view(pathLens(['a','b']), obj);
    expect(result).toBe(obj.a.b);
  });
  test('should over nested level', () => {
    const obj = {a:{b:1}};
    const result = over(pathLens(['a','b']), (val=>val+1), obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({a:{b:2}});
  });
  test('should view nested array', () => {
    const obj = {a:[{b:1}]};
    const result = view(pathLens(['a', 0, 'b']), obj);
    expect(result).toBe(1);
  });
  test('should over nested level', () => {
    const obj = {a:[{b:1}]};
    const result = over(pathLens(['a', 0, 'b']), (val=>val+1), obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({a:[{b:2}]});
  });
  test('should shallow only objects in path', () => {
    const obj = {a:{b:1, c:2}, d:3};
    const result = over(pathLens(['a', 'b']), (val=>val+1), obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({a:{b:2, c:2}, d:3});
    expect(result.a === obj.a).toBeFalsy();
    expect(result.a.b === obj.a.b).toBeFalsy();
    expect(result.a.c === obj.a.c).toBeTruthy();
    expect(result.d === obj.d).toBeTruthy();
  });
  test('should over for identity search', () => {
    const obj = {a:[{id:0, b:0},{id:1, b:1}]};
    const result = over(
      compose(pathLens('a'), findLens({id:1}), pathLens('b')),
      (val=>val+1), obj);
    expect(result).toEqual({a:[{id:0, b:0},{id:1, b:2}]});
  });
  test('should over for funcional search', () => {
    const obj = {a:[{id:0, b:0},{id:1, b:1}]};
    const result = over(
      compose(pathLens('a'), findLens(({id})=>id===1), pathLens('b')),
      (val=>val+1), obj);
    expect(result).toEqual({a:[{id:0, b:0},{id:1, b:2}]});
  });

});
describe('merge', () => {
  test('should merge with value', () => {
    const obj = {a:1};
    const result = merge(pathLens(), {b:2}, obj);
    expect(result).toEqual({a:1, b:2});
    expect(result !== obj).toBeTruthy();
  });
  test('should merged for nested path', () => {
    const obj = {a:{b:{c:1, d:2}}};
    const result = merge(
      pathLens('a.b'),
      {e: 3}, obj);
    expect(result).toEqual({a:{b:{c:1, d:2, e:3}}});
  });
  test('should shallow only objects in path', () => {
    const obj = {a:{b:{c:2}}, d:3};
    const result = merge(pathLens('a.b'), {e:4}, obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({a:{b:{c:2, e:4}}, d:3});
    expect(result.a === obj.a).toBeFalsy();
    expect(result.a.b === obj.a.b).toBeFalsy();
    expect(result.a.c === obj.a.c).toBeTruthy();
    expect(result.d === obj.d).toBeTruthy();
  });
});
describe('findLens', () => {
  test('should view for identity search', () => {
    const obj = [{id:0, b:0},{id:1, b:1}];
    const result = view(
      findLens({id:1}),
      obj);
    expect(result).toEqual({id:1, b:1});
  });
  test('should over for identity search', () => {
    const obj = [{id:0, b:0},{id:1, b:1}];
    const result = over(
      findLens({id:1}),
      val=>({...val,b:2}), obj);
    expect(result).toEqual([{id:0, b:0},{id:1, b:2}]);
  });
  test('should over for funcional search', () => {
    const obj = [{id:0, b:0},{id:1, b:1}];
    const result = over(
      findLens(({id})=>id===1),
      val=>({...val,b:2}), obj);
    expect(result).toEqual([{id:0, b:0},{id:1, b:2}]);
  });

});
  
describe('pickLens', () => {
  test('should view keys', () => {
    const obj = {a:1,b:2,c:3};
    const result = view(
      pickLens('a','b'),
      obj);
    expect(result).toEqual({a:1,b:2});
  });
  test('should view keys for array arg', () => {
    const obj = {a:1,b:2,c:3};
    const result = view(
      pickLens(['a','b']),
      obj);
    expect(result).toEqual({a:1,b:2});
  });
  test('should over keys', () => {
    const obj = {a:1,b:2,c:3};
    const result = over(
      pickLens(['a','b']),
      mapValues(val=>val+1),
      obj);
    expect(result).toEqual({a:2,b:3,c:3});
  });
  test('should pick keys for nested object', () => {
    const obj = {d:{a:1,b:2,c:3}};
    const result = view(
      compose(pathLens('d'),pickLens(['a','b'])),
      obj);
    expect(result).toEqual({a:1,b:2});
  });
  test('should over pick keys for nested object', () => {
    const obj = {d:{a:1,b:2,c:3}};
    const result = over(
      compose(pathLens('d'),pickLens(['a','b'])),
      mapValues(val=>val+1),
      obj);
    expect(result).toEqual({d:{a:2,b:3,c:3}});
  });
});
