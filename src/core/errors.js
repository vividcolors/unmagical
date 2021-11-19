// @ts-check
/** @module core/errors */

import showText from 'string-template'

/**
 * 
 * @callback NormalizeErrorFunc
 * @param {MgError} error
 * @returns {MgError}
 */
/**
 * @typedef {Object} MgError
 * @property {string} code
 * @property {string} [detail]
 * @property {string|number|boolean|string} [hint]
 * @property {string} [message]
 */
/* - type.{type}
 * - rule.{rule}
 * - http.{statusCode}
 * - system.net
 */

/**
 * Returns true if a given object is an instance of MgError
 * @function
 * @param {any} x
 * @returns {boolean} 
 */
export const isError = (x) => {
  return (typeof x == 'object' && x != null && 'code' in x)
}

 /**
  * Extends a MgError for viewing, and returns its extended instance.
  * @function
  * @param {Record<string,string>} catalog
  * @returns {NormalizeErrorFunc}
  */
export const normalizeError = (catalog) => (error) => {
  const template = catalog[error.code] || catalog['detail' in error ? 'fallback' : 'fallback.nodetail']
  const message = showText(template, error)
  return {...error, message}
}

/**
 * @namespace
 */
export const defaultErrorMessages = {
  /**
   * @name "fallback"
   */
  'fallback': 'Error code:{code}; detail:{detail}', 
  /**
   * @name "fallback.nodetail"
   */
  'fallback.nodetail': 'Error code:{code}', 
  /**
   * @name "value"
   */
  'value': 'Invalid value', 
  /**
   * @name "type.null"
   */
  'type.null': 'Please input a null value', 
  /**
   * @name "type.boolean"
   */
  'type.boolean': 'Please input a boolean value', 
  /**
   * @name "type.boolean?"
   */
  'type.boolean?': 'Please input a boolean value or a null', 
  /**
   * @name "type.integer"
   */
  'type.integer': 'Please input an integer', 
  /**
   * @name "type.integer?"
   */
  'type.integer?': 'Please input an integer or a null', 
  /**
   * @name "type.number"
   */
  'type.number': 'Please input a number', 
  /**
   * @name "type.number?"
   */
  'type.number?': 'Please input a number or a null', 
  /**
   * @name "type.string"
   */
  'type.string': 'Please input a string', 
  /**
   * @name "type.object"
   */
  'type.object': 'Please input an object value', 
  /**
   * @name "type.object?"
   */
  'type.object?': 'Please input an object value or a null', 
  /**
   * @name "type.array"
   */
  'type.array': 'Please input an array value', 
  /**
   * @name "type.array?"
   */
  'type.array?': 'Please input an array value or a null', 
  /**
   * @name "rule.enum"
   */
  'rule.enum': 'Invalid input', 
  /**
   * @name "rule.const"
   */
  'rule.const': 'Input {hint}',  // param
  /**
   * @name "rule.const.nohint"
   */
  'rule.const.nohint': 'Invalid input', 
  /**
   * @name "rule.notEmpty"
   */
  'rule.notEmpty': 'Please input', 
  /**
   * @name "rule.required"
   */
  'rule.required': 'Missing property "{hint}"',  // param[i]
  /**
   * @name "rule.switchRequired"
   */
  'rule.switchRequired': 'Missing property "{hint}"',  // required[i]
  /**
   * @name "rule.sqitchRequired.nohint"
   */
  'rule.switchRequired.nohint': 'Properties are missing', 
  /**
   * @name "rule.same"
   */
  'rule.same': 'Please input {hint}',  // target
  /**
   * @name "rule.same.nohint"
   */
  'rule.same.nohint': 'Invalid input', 
  /**
   * @name "rule.multipleOf"
   */
  'rule.multipleOf': 'Please enter a multiple of {hint}',  // param
  /**
   * @name "rule.maximum"
   */
  'rule.maximum': 'Please enter {hint} or less',  // param
  /**
   * @name "rule.exclusiveMaximum"
   */
  'rule.exclusiveMaximum': 'Please enter less than {hint}',  // param
  /**
   * @name "rule.minimum"
   */
  'rule.minimum': 'Please enter {hint} or more',  // param
  /**
   * @name "rule.exclusiveMinimum"
   */
  'rule.exclusiveMinimum': 'Please enter more than {hint}',  // param
  /**
   * @name "rule.maxLength"
   */
  'rule.maxLength': 'Please enter no more than {hint} characters',  // param
  /**
   * @name "rule.minLength"
   */
  'rule.minLength': 'Please enter at least {hint} characters',  // param
  /**
   * @name "rule.pattern"
   */
  'rule.pattern': 'Invalid format',  // param
  /**
   * @name "rule.maxItems"
   */
  'rule.maxItems': 'Please make it {hint} or less',  // param
  /**
   * @name "rule.minItems"
   */
  'rule.minItems': 'Please make it {hint} or more',  // param
  /**
   * @name "http.400"
   */
  'http.400': 'HTTP error: {detail}', 
  /**
   * @name "http.401"
   */
  'http:401': 'HTTP error: {detail}', 
  /**
   * @name "http.403"
   */
  'http:403': 'HTTP error: {detail}', 
  /**
   * @name "http.404"
   */
  'http.404': 'HTTP error: {detail}', 
  /**
   * @name "http.405"
   */
  'http.405': 'HTTP error: {detail}', 
  /**
   * @name "http.406"
   */
  'http.406': 'HTTP error: {detail}', 
  /**
   * @name "http.407"
   */
  'http.407': 'HTTP error: {detail}', 
  /**
   * @name "http.408"
   */
  'http.408': 'HTTP error: {detail}', 
  /**
   * @name "http.409"
   */
  'http.409': 'HTTP error: {detail}', 
  /**
   * @name "http.410"
   */
  'http.410': 'HTTP error: {detail}', 
  /**
   * @name "http.500"
   */
  'http.500': 'HTTP error: {detail}', 
  /**
   * @name "http.501"
   */
  'http.501': 'HTTP error: {detail}', 
  /**
   * @name "http.502"
   */
  'http.502': 'HTTP error: {detail}', 
  /**
   * @name "http.503"
   */
  'http.503': 'HTTP error: {detail}', 

}