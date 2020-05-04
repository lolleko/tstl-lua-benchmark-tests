// Converted to TS

//
// json.lua
//
// Copyright (c) 2015 rxi
//
// This library is free software; you can redistribute it and/or modify it
// under the terms of the MIT license. See LICENSE for details.
//
//
// LICENSE CONTENTS:
//
// Copyright (c) 2015 rxi
//
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


///////////////////////////////////////////////////////////////////////////////
// Encode
///////////////////////////////////////////////////////////////////////////////
let escape_char_map: Record<string, string> = {
  [ "\\" ]: "\\\\",
  [ "\"" ]: "\\\"",
  [ "\b" ]: "\\b",
  [ "\f" ]: "\\f",
  [ "\n" ]: "\\n",
  [ "\r" ]: "\\r",
  [ "\t" ]: "\\t",
}

let escape_char_map_inv: Record<string, string> = { [ "\\/" ]: "/" };
for (let key in escape_char_map) {
  escape_char_map_inv[escape_char_map[key]] = key;
}


function escape_char(c: string) {
  return escape_char_map[c] || string.format("\\u%04x", string.byte(c))
}


function encode_nil(val: any) {
  return "null"
}


function encode_table(val: any, stack: any) {
  let res: any = {}
  stack = stack || {}

  // Circular reference?
  if (stack[val]) { error("circular reference") }

  stack[val] = true

  if (val[1] !== undefined || next(val) == undefined) {
    let arr = val as any[];
    // Treat as array // check keys are valid and it is not sparse
    let n = 0
    for (let k of Object.keys(arr)) {
      if (type(k) !== "number") {
        error("invalid table: mixed or invalid key types")
      }
      n = n + 1
    }
    if (n !== arr.length) {
      error("invalid table: sparse array")
    }
    // Encode
    for (let v of arr) {
      table.insert(res, encode(v, stack))
    }
    stack[arr as any] = undefined
    return "[" + table.concat(res, ",") + "]";
  }
  else {
    // Treat as an object
    for (let k in val) {
      let v = val[k];
      if (type(k) !== "string") {
        error("invalid table: mixed or invalid key types")
      }
      table.insert(res, encode(k, stack) + ":" + encode(v, stack))
    }
    stack[val] = undefined
    return "{" + table.concat(res, ",") + "}"
  }
}


function encode_string(val: any) {
  return '"' + val.gsub('[%z\1-\31\\"]', escape_char) + '"'
}


function encode_number(val: any) {
  if (val !== val) {
    return "NaN"
  } else if (val == math.huge) {
    return "Infinity"
  } else if (val == -math.huge) {
    return "-Infinity"
  } else {
    return string.format("%.17g", val)
  }
}


let type_func_map: Record<string, Function> = {
  [ "nil"     ]: encode_nil,
  [ "table"   ]: encode_table,
  [ "string"  ]: encode_string,
  [ "number"  ]: encode_number,
  [ "boolean" ]: tostring,
}


export function encode(val: any, stack?: any) {
  let t = type(val)
  let f = type_func_map[t]
  if (f) {
    return f(val, stack)
  }
  error("unexpected type '" + t + "'")
}
