import { mapWith, merge, over, pathLens, replace, view } from "./lens";

const increment = (val: number) => val + 1;

describe("mapWith", () => {
  it("should map over array", () => {
    const result = mapWith(increment, [1, 2]);
    expect(result).toEqual([2, 3]);
  });
});

describe("view", () => {
  it("should return value", () => {
    const result = view(pathLens("a"), { a: 1 });
    expect(result).toBe(1);
  });
  it("should get nested path", () => {
    const result = view(pathLens("a.b"), { a: { b: 1 } });
    expect(result).toBe(1);
  });
  it("should get nested arrayed path", () => {
    const result = view(pathLens(["a", "b"]), { a: { b: 1 } });
    expect(result).toBe(1);
  });
  it("should get nested args path", () => {
    const result = view(pathLens("a.b.c"), { a: { b: { c: 1 } } });
    expect(result).toBe(1);
  });
  it("should get nested object", () => {
    const obj = { a: { b: { c: 1 } } };
    const result = view(pathLens("a.b"), obj);
    expect(result).toBe(obj.a.b);
  });
});

describe("over", () => {
  it("should immutably modify result", () => {
    const obj = { a: 1 };
    const result = over(pathLens("a"), increment, obj);
    expect(result).toEqual({ a: 2 });
    expect(result !== obj).toBeTruthy();
  });
  it("should over nested path", () => {
    const obj = { a: { b: 1 } };
    const result = over(pathLens("a.b"), increment, obj);
    expect(result).toEqual({ a: { b: 2 } });
    expect(result !== obj).toBeTruthy();
  });
  it("should shallow only objects in path", () => {
    const obj = { a: { b: 1, c: 2 }, d: 3 };
    const result = over(pathLens("a.b"), increment, obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({ a: { b: 2, c: 2 }, d: 3 });
    expect(result.a === obj.a).toBeFalsy();
    expect(result.a.b === obj.a.b).toBeFalsy();
    expect(result.a.c === obj.a.c).toBeTruthy();
    expect(result.d === obj.d).toBeTruthy();
  });

  it("should over nested path", () => {
    const overAB = over(pathLens("a.b"), increment);

    const obj = { a: { b: 1 } };
    const result = overAB(obj);
    expect(result).toEqual({ a: { b: 2 } });
    expect(result !== obj).toBeTruthy();
  });
});

describe("replace", () => {
  it("should replace with value", () => {
    const obj = { a: 1 };
    const result = replace(pathLens("a"), 2, obj);
    expect(result).toEqual({ a: 2 });
    expect(result !== obj).toBeTruthy();
  });
  it("should replace for nested path", () => {
    const obj = { a: { b: 1 } };
    const result = replace(pathLens("a.b"), 2, obj);
    expect(result).toEqual({ a: { b: 2 } });
    expect(result !== obj).toBeTruthy();
  });
  it("should shallow objects only in path", () => {
    const obj: any = { a: { b: { c: 1 }, e: { o: 3 } }, f: { o: 5 } };
    const result = replace(pathLens("a.b"), { c: 2, d: 3 }, obj);
    expect(result).toEqual({
      a: { b: { c: 2, d: 3 }, e: { o: 3 } },
      f: { o: 5 },
    });
    expect(result !== obj).toBeTruthy();
    expect(result.a.b === obj.a.b).toBeFalsy();
    expect(result.a.e === obj.a.e).toBeTruthy();
    expect(result.f === obj.f).toBeTruthy();
    expect(result.a === obj.a).toBeFalsy();
  });
});

describe("pathLens", () => {
  it("should view one level", () => {
    const obj = { a: 1 };
    const result = view(pathLens("a"), obj);
    expect(result).toBe(1);
  });
  it("should get obj for empty path", () => {
    const obj = { a: 1 };
    const result = view(pathLens(), obj);
    expect(result).toBe(obj);
  });
  it("should over one level", () => {
    const obj = { a: 1 };
    const result = over(pathLens("a"), increment, obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({ a: 2 });
  });
  it("should view nested level", () => {
    const obj = { a: { b: { c: 1 } } };
    const result = view(pathLens(["a", "b"]), obj);
    expect(result).toBe(obj.a.b);
  });
  it("should over nested level", () => {
    const obj = { a: { b: 1 } };
    const result = over(pathLens(["a", "b"]), increment, obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({ a: { b: 2 } });
  });
  it("should view nested array", () => {
    const obj = { a: [{ b: 1 }] };
    const result = view(pathLens(["a", 0, "b"]), obj);
    expect(result).toBe(1);
  });
  it("should over nested level", () => {
    const obj = { a: [{ b: 1 }] };
    const result = over(pathLens(["a", 0, "b"]), increment, obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({ a: [{ b: 2 }] });
  });
  it("should shallow only objects in path", () => {
    const obj = { a: { b: 1, c: 2 }, d: 3 };
    const result = over(pathLens(["a", "b"]), increment, obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({ a: { b: 2, c: 2 }, d: 3 });
    expect(result.a === obj.a).toBeFalsy();
    expect(result.a.b === obj.a.b).toBeFalsy();
    expect(result.a.c === obj.a.c).toBeTruthy();
    expect(result.d === obj.d).toBeTruthy();
  });
});
describe("merge", () => {
  it("should merge with value", () => {
    const obj = { a: 1 };
    const result = merge(pathLens(), { b: 2 }, obj);
    expect(result).toEqual({ a: 1, b: 2 });
    expect(result !== obj).toBeTruthy();
  });
  it("should merged for nested path", () => {
    const obj = { a: { b: { c: 1, d: 2 } } };
    const result = merge(pathLens("a.b"), { e: 3 }, obj);
    expect(result).toEqual({ a: { b: { c: 1, d: 2, e: 3 } } });
  });
  it("should shallow only objects in path", () => {
    const obj = { a: { b: { c: 2 } }, d: 3 };
    const result = merge(pathLens("a.b"), { e: 4 }, obj);
    expect(result !== obj).toBeTruthy();
    expect(result).toEqual({ a: { b: { c: 2, e: 4 } }, d: 3 });
    expect(result.a === obj.a).toBeFalsy();
    expect(result.a.b === obj.a.b).toBeFalsy();
    expect(result.a.b.c === obj.a.b.c).toBeTruthy();
    expect(result.d === obj.d).toBeTruthy();
  });
});
