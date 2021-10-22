
import * as S from '../src/schema'

export const run = (assert, assertError, assertUndefined) => {
  const v = S.validate(S.defaultRules, {})
  const c = S.coerce(S.defaultRules, {})

  // type null
  let s = {type:'null'}
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

  // rule requiredAnyOf
  s = {
    type:'object', 
    requiredAnyOf: [
      ['tag', 'op', 'lhs', 'rhs'], 
      ['tag', 'f', 'arg'], 
      ['tag', 'val', 'line'], 
      ['tag', 'var']
    ]
  }
  let data = {tag:'infix', op:'*', lhs:{tag:'var', var:'n'}, rhs:{tag:'app', f:'fact', arg:{tag:'infix', op:'-', lhs:{tag:'var', var:'n'}, rhs:{tag:'lit', val:1}}}}  // n * fact(n - 1)
  assert(17, () => v(data, {}, s).invalid, false)
  assert(17.1, () => v(data.lhs, {}, s).invalid, false)
  assert(17.2, () => v(data.rhs.arg.rhs, {}, s).invalid, true)
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
}