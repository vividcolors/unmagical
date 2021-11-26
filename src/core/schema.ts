/**
 * Data schema and validation
 * 
 * @module core/schema
 */

import {typeOf, isJsonValue, appendPath} from './utils'
import {MgError, Scalar} from './errors'

/**
 * Simple Json type definition
 * 
 * @category Types
 */
export type Json = null | number | string | boolean | Json[] | {[prop:string]:Json}

/**
 * Type of lookup function used in validation rules.
 * 
 * @category Types
 */
export type Lookup = (path:string) => Json

/**
 * Type of validation rule functions.<br>
 * They returns true if validation succeeded.<br>
 * Otherwise return MgError.
 * 
 * @category Types
 */
export type RuleFunc = (param:Json, value:Json, lookup:Lookup, rules:Rules) => true|MgError

/**
 * Named set of Rule functions.
 * 
 * @category Types
 */
export type Rules = Record<string,RuleFunc>

/**
 * The schema is modeled after JSON Schema.
 * 
 * @category Types
 */
export type Schema = Record<string,Json>

/**
 * Compiled schema.<br>
 * You can lookup a schema by a normalized path.
 * 
 * @category Types
 */
export type SchemaDb = Record<string,Schema>

/**
 * Slot is where metadata of each value of the model data comes. 
 * 
 * @category Types
 */
export type Slot = {
  /**
   * `true` if the value is invalid.
   */
  invalid?: boolean, 
  /**
   * Non-null if the value has error.
   */
  error?: MgError, 
  /**
   * `true` if the user changed this value.
   */
  touched?: boolean, 
  /**
   * Raw string of user input.
   */
  input?: string, 
  /**
   * the value itself of this value.
   */
  value?: Json
}

/**
 * Type of validation function.
 * 
 * @category Types
 */
export type Validate = (value:any, slot0:Slot, schema:Schema, lookup:Lookup) => Slot

type SwitchRequiredParam = {tagProperty:string, types:{[tag:string]:string[]}}

type IfParam = [string, Schema, Schema, Schema?]


/**
 * Returns true if type specification allows null.
 */
const nullable = (type:any):boolean => {
  if (! type) return true
  const lastChar = type.charAt(type.length - 1)
  return type == 'null' || lastChar == '?'
}

/**
 * Builds a map from path to schema.
 * 
 * @category Entries
 */
export const buildDb = (schema:Schema):SchemaDb => {
  const db = /** @type SchemaDb */ ({})
  const inner = (schema, path) => {
    db[path] = schema
    switch (schema.type) {
      case 'object': 
      case 'object?': 
        for (let p in schema.properties) {
          inner(schema.properties[p], path + '/' + p)
        }
        break
      case 'array': 
      case 'array?': 
        inner(schema.items, path + '/*')
        break
      default: 
        break
    }
  }
  inner(schema, "")
  return db
}

/**
 * Returns true if the value is in an specified type
 */
const testType = (value:Json, type:string):boolean => {
  if (! type) return true
  if (value === null) {
    return nullable(type)
  } else {
    switch (type) {
      case 'null': 
        return false
      case 'number':  // FALLTHRU
      case 'number?': 
        return typeof value == 'number'
      case 'integer':  // FALLTHRU
      case 'integer?': 
        return (typeof value == 'number' && value % 1 === 0)
      case 'boolean':  // FALLTHRU
      case 'boolean?': 
        return typeof value == 'boolean'
      case 'string': 
        return typeof value == 'string'
      case 'object':  // FALLTHRU
      case 'object?': 
        return (typeof value == 'object' && value !== null)
      case 'array':  // FALLTHRU
      case 'array?': 
        return Array.isArray(value)
      default: 
        throw new Error('unknown type: ' + type)
    }
  }
}


/**
 * Valid if a type of `value` is that specified by `param`.
 * @param param null|boolean|boolean?|integer|integer?|number|number?|string|object|object?|array|array?
 * @param value value to validate
 * @category Predefined Rules
 */
export const type:RuleFunc = (param, value) => {
  if (typeof param != 'string') throw new Error('invalid type')
  const result = testType(value, param)
  if (! result) return {code:'type.'+param}
  return true
}

/**
 * Valid if `value` is either of values in `param`. Comparison is executed with `===`.
 * @param param candidates
 * @param value value to validate
 * @category Predefined Rules
 */
export const $enum:RuleFunc = (param:Json[], value) => {
  if (! Array.isArray(param)) throw new Error('invalid parameter')
  for (let i = 0; i < param.length; i++) {
    if (param[i] === value) return true
  }
  return {code:'rule.enum'}
}

/**
 * Valid if `value` is `===` to `param`.
 * @param param const
 * @param value value to validate
 * @category Predefined Rules
 */
export const $const:RuleFunc = (param, value) => {
  if (param === value) return true
  switch (typeOf(param)) {
    case 'string': 
    case 'number': 
    case 'null': 
    case 'boolean': 
      return {code:'rule.const', hint:(param as Scalar)}
    default: 
      return {code:'rule.const.nohint'}
  }
}

/**
 * Valid if `value` is not a empty string.<br>
 * If `value` is not a string, then valid.
 * @param _param unused
 * @param value 
 * @category Predefined Rules
 */
export const notEmpty:RuleFunc = (_param, value) => {
  if (typeOf(value) != 'string') return true
  if (value !== '') return true
  return {code:'rule.notEmpty'}
}

/**
 * Valid if `value` of Object has all properties specifed by `param`.
 * If `value` is not an Object, then valid.
 * @param param a list of property names
 * @param value 
 * @category Predefined Rules
 */
export const required:RuleFunc = (param, value) => {
  if (! Array.isArray(param)) throw new Error('invalid parameter')
  if (typeOf(value) != 'object') return true
  for (let i = 0; i < param.length; i++) {
    if (! value.hasOwnProperty(param[i] as string)) return {code:'rule.required', hint:param[i] as string}
  }
  return true
}

/**
 * Valid if `value` of Object is an instance of a tagged union specified by `param`
 * @example
 * ```javascript
 * param = {
 *   tagProperty: "tag", 
 *   types: {
 *     leafOf: ["value"], 
 *     nodeOf: ["left", "right"]
 *   }
 * }
 * switchRequired of `{tag:"leafOf", value:1}` evaludates valid.
 * switchRequired of `{tag:"nodeOf", left:otherNode}` evaluates invalid since `right` property is missing.
 * ```
 * @remark
 * We can use tagged unions by using the switchRequired rule.<br>
 * But notice, even if the property sets are different, if the property names 
 * are the same, the schema will be the same.
 * @param param 
 * @param value 
 * @param lookup 
 * @category Predefined Rules
 */
export const switchRequired:RuleFunc = (param, value, lookup) => {
  if (typeOf(param) != 'object' || !('tagProperty' in (param as object))) throw new Error('invalid parameter')
  if (typeOf(value) != 'object') return true
  param = param as SwitchRequiredParam
  const tag = lookup('0/' + param.tagProperty) as string
  if (! tag) return {code:'rule.switchRequired.nohint', decription:'no tag'}
  if (! param.types[tag]) return {code:'rule.switchRequired.nohint', detail:'no type'}
  const required = param.types[tag]
  if (! Array.isArray(required)) throw new Error('invalid parameter')
  for (let i = 0; i < required.length; i++) {
    if (! value.hasOwnProperty(required[i])) return {code:'rule.switchRequired', hint:required[i]}
  }
  return true
}

/**
 * Valid if `value` is strictly equals to a value located in a path specified by `param`.
 * @param param path to the value to be compared
 * @param value 
 * @param lookup 
 * @category Predefined Rules
 */
export const same:RuleFunc = (param, value, lookup) => {
  if (typeof param != 'string') throw new Error('invalid parameter')
  const target = lookup(param)
  if (target !== value) {
    switch (typeOf(target)) {
      case 'string': 
      case 'number': 
      case 'null': 
      case 'boolean': 
        return {code:'rule.same', hint: target as Scalar}
      default: 
        return {code:'rule.same.nohint'}
    }
  }
  return true
}

/**
 * Valid if either of: 
 * - {target} conforms the rules of {match}, and `value` conforms the rules of {then}.
 * - {target} doesn't conform the rules of {match}, and `value` conforms the rules of {else}.
 * Where `param` is an array of:
 * - {target} -- path to the target value
 * - {match} -- rules for target
 * - {then} -- rules of then clause
 * - {else} -- rules of else clause
 * @param param 
 * @param value 
 * @param lookup 
 * @param rules 
 * @category Predefined Rules
 */
export const $if:RuleFunc = (param, value, lookup, rules) => {
  if (typeOf(param) != 'array') throw new Error('invalid parameter')
  const param1 = param as IfParam
  const [target, match, then, el = {}] = param1
  if (! target || ! match || ! then) throw new Error('invalid parameter')
  const targetValue = lookup(target)
  const targetResult = applyRules(targetValue, match, lookup, rules)
  if (targetResult === true) {
    return applyRules(value, then, lookup, rules)
  } else {
    return applyRules(value, el, lookup, rules)
  }
}

/**
 * Valid if `value`, where it is a number, is multiple of `param`.
 * @param param 
 * @param value 
 * @category Predefined Rules
 */
export const multipleOf:RuleFunc = (param, value) => {
  if (typeof param != 'number') throw new Error('invalid parameter')
  if (typeof value != 'number') return true
  if (value % param === 0) return true
  return {code:'rule.multipleOf', hint:param}
}

/**
 * 
 * @param param 
 * @param value 
 * @category Predefined Rules
 */
export const maximum:RuleFunc = (param, value) => {
  if (typeof value != 'number') return true
  if (param >= value) return true
  return {code:'rule.maximum', hint:param as Scalar}
}

/**
 * 
 * @param param 
 * @param value 
 * @category Predefined Rules
 */
export const exclusiveMaximum:RuleFunc = (param, value) => {
  if (typeof value != 'number') return true
  if (param > value) return true
  return {code:'rule.exclusiveMaximum', hint:param as Scalar}
}

/**
 * 
 * @param param 
 * @param value 
 * @category Predefined Rules
 */
export const minimum:RuleFunc = (param, value) => {
  if (typeof value != 'number') return true
  if (param <= value) return true
  return {code:'rule.minimum', hint:param as Scalar}
}

/**
 * 
 * @param param 
 * @param value 
 * @category Predefined Rules
 */
export const exclusiveMinimum:RuleFunc = (param, value) => {
  if (typeof value != 'number') return true
  if (param < value) return true
  return {code:'rule.exclusiveMinimum', hint:param as Scalar}
}

/**
 * 
 * @param param 
 * @param value 
 * @category Predefined Rules
 */
export const maxLength:RuleFunc = (param, value) => {
  if (typeof value != 'string') return true
  if (value.length <= param) return true
  return {code:'rule.maxLength', hint:param as Scalar}
}

/**
 * 
 * @param param 
 * @param value 
 * @category Predefined Rules
 */
export const minLength:RuleFunc = (param, value) => {
  if (typeof value != 'string') return true
  if (value.length >= param) return true
  return {code:'rule.minLength', hint:param as Scalar}
}

/**
 * 
 * @param param 
 * @param value 
 * @category Predefined Rules
 */
export const pattern:RuleFunc = (param, value) => {
  if (typeof param != 'string') throw new Error('invalid parameter')
  if (typeof value != 'string') return true
  if (new RegExp(param).test(value)) return true
  return {code:'rule.pattern', hint: /** @type {string} */ (param)}
}

/**
 * 
 * @param param 
 * @param value 
 * @category Predefined Rules
 */
export const maxItems:RuleFunc = (param, value) => {
  if (typeof param != 'number') throw new Error('invalid parameter')
  if (! Array.isArray(value)) return true
  if (value.length <= param) return true
  return {code:'rule.maxItems', hint: /** @type {number} */ (param)}
}

/**
 * 
 * @param param 
 * @param value 
 * @category Predefined Rules
 */
export const minItems:RuleFunc = (param, value) => {
  if (typeof param != 'number') throw new Error('invalid parameter')
  if (! Array.isArray(value)) return true
  if (value.length >= param) return true
  return {code:'rule.minItems', hint: /** @type {number} */ (param)}
}

/**
 * default validation rules.
 * Rules prefixed by '$' is registered by its true name. Use `defaultRules.if` instead of `defaultRules.$if`.
 * 
 * @category Entries
 */
export const defaultRules:Rules = {
  type, 'enum':$enum, 'const':$const, notEmpty, required, switchRequired, same, 'if':$if, 
  // TODO: allOf, eitherOf, not
  multipleOf, maximum, exclusiveMaximum, minimum, exclusiveMinimum, maxLength, minLength, pattern, maxItems, minItems
}

/**
 * Validates a value with a schema. It is a shallow validation.
 * 
 * @param rules set of validation rules, which means that you can add your own rules.
 * 
 * @category Entries
 */
export const validate = (rules:Rules):Validate => (value, slot, schema, lookup) => {
  if (! isJsonValue(value)) {
    if (schema && schema.type) {
      const error = {code:'type.'+schema.type, detail:'given value: '+value}
      return {...slot, value, invalid:true, error}
    } else {
      const error = {code:'value', detail:'given value: '+value}
      return {...slot, value, invalid:true, error}
    }
  }

  if (schema) {
    const result = applyRules(value, schema, lookup, rules)
    if (result !== true) {
      return {...slot, value, invalid:true, error:result}
    }
  }
  return {...slot, value, invalid:false, error:null}
}

/**
 * 
 * 
 * 
 * @category Entries
 */
export const applyRules = (value:any, schema:Schema, lookup:Lookup, rules:Rules):true|MgError => {
  for (let p in schema) {
    const f = rules[p]
    if (! f) continue
    const result = f(schema[p], value, lookup, rules)
    if (result !== true) return result
  }
  return true
}

/**
 * Executes coercion. Coercion is a process that interpretes a user input of string into a value of schema-specified type.
 * 
 * @category Entries
 */
export const coerce = (input:string, slot:Slot, schema:Schema):Slot => {
  input = "" + input  // coerce to string
  if (! schema) {
    throw new Error('coerce/0: no schema')
  }
  if (! schema.type || typeof schema.type != 'string') {
    throw new Error('coerce/1: type not specified')
  }
  const type = schema.type
  if (['null', 'boolean', 'boolean?', 'integer', 'integer?', 'number', 'number?', 'string'].indexOf(type) == -1) {
    throw new Error('coerce/2: not a coercion enabled type: ' + type)
  }

  switch (type) {
    case 'null': 
      break
    case 'number': 
    case 'number?': 
      const n = +input
      if ("" + n === input) {
        return {value:n, input, touched:slot.touched}
      }
      break
    case 'integer': 
    case 'integer?': 
      const i = +input
      if ("" + i === input && i % 1 === 0) {
        return {value:i, input, touched:slot.touched}
      }
      break
    case 'boolean': 
    case 'boolean?': 
      if (input === "true" || input === "false") {
        return {value:input==="true", input, touched:slot.touched}
      }
      break
    case 'string': 
      return {value:input, input, touched:slot.touched}
  }
  if (input == "" && nullable(type)) {
    return {value:null, input, touched:slot.touched}
  }
  return {input, touched:slot.touched}
}
