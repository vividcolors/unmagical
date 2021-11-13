
import * as S from '../src/core/schema'

export const run = (assert, assertError, assertUndefined) => {
  const v = S.validate(S.defaultRules, {})
  const c = S.coerce(S.defaultRules, {})

  let s = null
  let env = null

  // type null
  s = {type:'null'}
  assert(1, () => v(null, {}, s).invalid, false)
  assert(1.1, () => v(1, {}, s).invalid, true)
  assert(1.2, () => v("abc", {}, s).invalid, true)
  assert(1.3, () => c("", {}, s)['@value'], null)
  assertUndefined(1.4, () => c("abc", {}, s)['@value'])
  assert(1.5, () => v(undefined, {}, s).invalid, true)

  // no schema
  s = null
  assert(2, () => v(null, {}, s).invalid, false)
  assert(2.1, () => v(10, {}, s).invalid, false)
  assert(2.2, () => v([], {}, s).invalid, false)
  assertError(2.3, () => c("", {}, s), 'coerce/')
  assertError(2.4, () => c("aaa", {}, s), 'coerce/')
  assert(2.5, () => v(undefined, {}, s).invalid, true)  // because `undefined' is not a JSON value

  // type boolean
  s = {type:'boolean'}
  assert(3, () => v(null, {}, s).invalid, true)
  assert(3.1, () => v(1, {}, s).invalid, true)
  assert(3.2, () => v(true, {}, s).invalid, false)
  assertUndefined(3.3, () => c('', {}, s)['@value'])
  assert(3.4, () => c('false', {}, s)['@value'], false)
  assertUndefined(3.5, () => c('abc', {}, s)['@value'])
  assert(3.6, () => c('true', {}, s)['@value'], true)

  // type boolean?
  s = {type:'boolean?'}
  assert(4, () => v(null, {}, s).invalid, false)
  assert(4.1, () => v(1, {}, s).invalid, true)
  assert(4.2, () => v(true, {}, s).invalid, false)
  assert(4.3, () => c('', {}, s)['@value'], null)
  assert(4.4, () => c('false', {}, s)['@value'], false)
  assertUndefined(4.5, () => c('abc', {}, s)['@value'])

  // type integer
  s = {type:'integer'}
  assert(5, () => v(null, {}, s).invalid, true)
  assert(5.1, () => v(1, {}, s).invalid, false)
  assert(5.2, () => v(true, {}, s).invalid, true)
  assertUndefined(5.3, () => c('', {}, s)['@value'])
  assert(5.4, () => c('10', {}, s)['@value'], 10)
  assertUndefined(5.5, () => c('abc', {}, s)['@value'])
  assert(5.6, () => v(132, {}, s)['@value'], 132)

  // type integer?
  s = {type:'integer?'}
  assert(6, () => v(null, {}, s).invalid, false)
  assert(6.1, () => v(1, {}, s).invalid, false)
  assert(6.2, () => v(true, {}, s).invalid, true)
  assert(6.3, () => c('', {}, s)['@value'], null)
  assert(6.4, () => c('10', {}, s)['@value'], 10)
  assertUndefined(6.5, () => c('10.3', {}, s)['@value'])
  assert(6.6, () => c('132', {}, s)['@value'], 132)

  // type number
  s = {type:'number'}
  assert(7, () => v(null, {}, s).invalid, true)
  assert(7.1, () => v(1.2, {}, s).invalid, false)
  assert(7.2, () => v(true, {}, s).invalid, true)
  assertUndefined(7.3, () => c('', {}, s)['@value'])
  assert(7.4, () => c('10.3', {}, s)['@value'], 10.3)
  assertUndefined(7.5, () => c('abc', {}, s)['@value'])

  // type number?
  s = {type:'number?'}
  assert(8, () => v(null, {}, s).invalid, false)
  assert(8.1, () => v(1.2, {}, s).invalid, false)
  assert(8.2, () => v(true, {}, s).invalid, true)
  assert(8.3, () => c('', {}, s)['@value'], null)
  assert(8.4, () => c('10.3', {}, s)['@value'], 10.3)
  assertUndefined(8.5, () => c('abc', {}, s)['@value'])

  // type string
  s = {type:'string'}
  assert(9, () => v(null, {}, s).invalid, true)
  assert(9.1, () => v('', {}, s).invalid, false)
  assert(9.2, () => v(true, {}, s).invalid, true)
  assert(9.3, () => v('abc', {}, s).invalid, false)
  assert(9.4, () => c("", {}, s)['@value'], "")
  assert(9.5, () => c("abc", {}, s)['@value'], "abc")

  // type object
  s = {type:'object'}
  assert(10, () => v(null, {}, s).invalid, true)
  assert(10.1, () => v('', {}, s).invalid, true)
  assert(10.2, () => v({}, s).invalid, false)
  assertError(10.3, () => c('', {}, s), 'coerce/')

  // type object?
  s = {type:'object?'}
  assert(11, () => v(null, {}, s).invalid, false)
  assert(11.1, () => v('', {}, s).invalid, true)
  assert(11.2, () => v({}, {}, s).invalid, false)
  assertError(11.3, () => c('', {}, s), 'coerce/')

  // type array
  s = {type:'array'}
  assert(12, () => v(null, {}, s).invalid, true)
  assert(12.1, () => v('', {}, s).invalid, true)
  assert(12.2, () => v([], {}, s).invalid, false)
  assertError(12.3, () => c('', {}, s), 'coerce/')

  // type array?
  s = {type:'array?'}
  assert(13, () => v(null, {}, s).invalid, false)
  assert(13.1, () => v('', {}, s).invalid, true)
  assert(13.2, () => v([], {}, s).invalid, false)
  assertError(13.3, () => c('', {}, s), 'coerce/')

  // rule enum
  s = {type:'integer?', enum:[1]}
  assert(14, () => v(null, {}, s).invalid, true)
  assert(14.1, () => v(1, {}, s).invalid, false)
  assert(14.2, () => v(3, {}, s).invalid, true)

  // rule const
  s = {type:'number', 'const':3.2}
  assert(15, () => v(3.2, {}, s).invalid, false)
  assert(15.1, () => v(3, {}, s).invalid, true)

  // rule required
  s = {type:'object', required:['foo', 'bar']}
  assert(16, () => v({foo:1, bar:1}, {}, s).invalid, false)
  assert(16.1, () => v({foo:1}, {}, s).invalid, true)
  assert(16.2, () => v({foo:1, bar:1, baz:1}, {}, s).invalid, false)
  assert(16.3, () => v(1, {}, {...s, type:'integer'}).invalid, false)

  // rule switchRequired
  s = {
    type:'object', 
    switchRequired: {
      tagProperty: 'type', 
      types: {
        infix: ['type', 'op', 'lhs', 'rhs'], 
        app: ['type', 'f', 'arg'], 
        var: ['type', 'var'], 
        lit: ['type', 'val'], 
        lambda: ['type', 'param', 'expr']
      }
    }
  }
  let data = {type:'infix', op:'*', lhs:{type:'var', var:'n'}, rhs:{type:'app', f:'fact', arg:{type:'infix', op:'-', lhs:{type:'var', var:'n'}, rhs:{type:'lit'}}}}  // n * fact(n - 1)
  assert(17, () => v(data, {}, s, (path) => 'infix').invalid, false)
  assert(17.1, () => v(data.lhs, {}, s, (path) => 'var').invalid, false)
  assert(17.2, () => v(data.rhs.arg.rhs, {}, s, (path) => 'lit').invalid, true)
  assert(17.3, () => v(1, {}, {...s, type:'integer'}).invalid, false)

  // rule multipleOf
  s = {type:'number?', multipleOf:1.2}
  assert(18, () => v(-2.4, {}, s).invalid, false)
  assert(18.1, () => v(1.5, {}, s).invalid, true)
  assert(18.2, () => v(null, {}, s).invalid, false)
  assert(18.3, () => v(true, {}, {...s, type:'boolean'}).invalid, false)

  // rule maximum
  s = {type:'integer?', maximum:10}
  assert(19, () => v(10, {}, s).invalid, false)
  assert(19.1, () => v(11, {}, s).invalid, true)
  assert(19.2, () => v(null, {}, s).invalid, false)
  assert(19.3, () => v(true, {}, {...s, type:'boolean'}).invalid, false)

  // rule exclusiveMaximum
  s = {type:'integer?', exclusiveMaximum:10}
  assert(20, () => v(9, {}, s).invalid, false)
  assert(20.1, () => v(10, {}, s).invalid, true)
  assert(20.2, () => v(null, {}, s).invalid, false)
  assert(20.3, () => v(true, {}, {...s, type:'boolean'}).invalid, false)

  // rule minimum
  s = {type:'integer?', minimum:10}
  assert(21, () => v(10, {}, s).invalid, false)
  assert(21.1, () => v(9, {}, s).invalid, true)
  assert(21.2, () => v(null, {}, s).invalid, false)
  assert(21.3, () => v(true, {}, {...s, type:'boolean'}).invalid, false)

  // rule exclusiveMinimum
  s = {type:'integer?', exclusiveMinimum:10}
  assert(20, () => v(10, {}, s).invalid, true)
  assert(20.1, () => v(11, {}, s).invalid, false)
  assert(20.2, () => v(null, {}, s).invalid, false)
  assert(20.3, () => v(true, {}, {...s, type:'boolean'}).invalid, false)

  // rule maxLength
  s = {type:'string', maxLength:3}
  assert(21, () => v('abc', {}, s).invalid, false)
  assert(21.1, () => v('abcd', {}, s).invalid, true)
  assert(21.2, () => v('', {}, s).invalid, false)
  assert(21.3, () => v(true, {}, {...s, type:'boolean'}).invalid, false)

  // rule minLength
  s = {type:'string', minLength:3}
  assert(21, () => v('abd', {}, s).invalid, false)
  assert(21.1, () => v('ab', {}, s).invalid, true)
  assert(21.2, () => v('', {}, s).invalid, true)
  assert(21.3, () => v(true, {}, {...s, type:'boolean'}).invalid, false)
  
  // rule pattern
  s = {type:'string', pattern:"^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$"}
  assert(22, () => v('info@example.com', {}, s).invalid, false)
  assert(22.1, () => v('192.168.0.1', {}, s).invalid, true)
  assert(22.2, () => v(true, {}, {...s, type:'boolean'}).invalid, false)

  // rule maxItems
  s = {type:'array?', maxItems:3}
  assert(23, () => v([1,2,3], {}, s).invalid, false)
  assert(23.1, () => v([1,2,3,4], {}, s).invalid, true)
  assert(23.2, () => v(null, {}, s).invalid, false)
  assert(23.3, () => v(true, {}, {...s, type:'boolean'}).invalid, false)

  // rule minItems
  s = {type:'array?', minItems:4}
  assert(24, () => v([1,2,3], {}, s).invalid, true)
  assert(24.1, () => v([1,2,3,4], {}, s).invalid, false)
  assert(24.2, () => v(null, {}, s).invalid, false)
  assert(24.3, () => v(true, {}, {...s, type:'boolean'}).invalid, false)

  // rule same
  s = {type:'string',same:'/first'}
  data = {first:'a', second:'a'}
  assert(25, () => v('a', {}, s, (path) => 'a').invalid, false)
  assert(25.1, () => v('b', {}, s, (path) => 'a').invalid, true)
  s = {same:'/first'}
  assert(25.2, () => v('a', {}, s, (path) => 'a').invalid, false)

  // rule conditional
  s = {
    type:'object?', 
    properties: {
      at: {type:'string'}, 
      to: {type:'string'}
    }, 
    required:['at', 'to'], 
    if: ['/status', {enum:['shipped', 'refunded']}, {type:'object'}]
  }
  assert(26, () => v(null, {}, s, (path) => 'new', S.defaultRules).invalid, false)
  assert(26.1, () => v(null, {}, s, (path) => 'shipped', S.defaultRules).invalid, true)
  assert(26.2, () => v({at:'a',to:'b'}, {}, s, (path) => 'new', S.defaultRules).invalid, false)
  assert(26.3, () => v({at:'a',to:'b'}, {}, s, (path) => 'shipped', S.defaultRules).invalid, false)

  /*s = {
    type:'object?', 
    properties: {
      at: {type:'string'}, 
      to: {type:'string'}
    }, 
    required:['at', 'to'], 
    allOf: [
      {conditional: ['/status', {enum:['shipped', 'refunded']}, {type:'object'}]}, 
      {conditional: ['/status', {not:{enum:['shipped', 'refunded']}}, {type:'null'}]}
    ]
  }*/
}