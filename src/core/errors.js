// @ts-check

import showText from 'string-template'

/**
 * @typedef {{
 *   code:string, 
 *   detail?:string, 
 *   hint?:null|number|boolean|string, 
 *   message?:string
 * }} MgError
 * @typedef {{[key:string]:string}} Catalog
 * 
 * - type.{type}
 * - rule.{rule}
 * - http.{statusCode}
 * - system.net
 */

export const isError = (x) => {
  return (typeof x == 'object' && x != null && 'code' in x)
}

 /**
  * 
  * @param {Catalog} catalog
  * @returns {(error:MgError) => MgError}
  */
export const normalizeError = (catalog) => (error) => {
  const template = catalog[error.code] || catalog['detail' in error ? 'fallback' : 'fallback.nodetail']
  const message = showText(template, error)
  return {...error, message}
}

/**
 * @type Catalog
 */
export const defaultErrorMessages = {
  'fallback': 'Error code:{code}; detail:{detail}', 
  'fallback.nodetail': 'Error code:{code}', 
  'value': 'Invalid value', 
  'type.null': 'Please input a null value', 
  'type.boolean': 'Please input a boolean value', 
  'type.boolean?': 'Please input a boolean value or a null', 
  'type.integer': 'Please input an integer', 
  'type.integer?': 'Please input an integer or a null', 
  'type.number': 'Please input a number', 
  'type.number?': 'Please input a number or a null', 
  'type.string': 'Please input a string', 
  'type.object': 'Please input an object value', 
  'type.object?': 'Please input an object value or a null', 
  'type.array': 'Please input an array value', 
  'type.array?': 'Please input an array value or a null', 
  'rule.enum': 'Invalid input', 
  'rule.const': 'Input {hint}',  // param
  'rule.const.nohint': 'Invalid input', 
  'rule.required': 'Missing property "{hint}"',  // param[i]
  'rule.switchRequired': 'Missing property "{hint}"',  // required[i]
  'rule.switchRequired.nohint': 'Properties are missing', 
  'rule.same': 'Please input {hint}',  // target
  'rule.same.nohint': 'Invalid input', 
  'rule.multipleOf': 'Please enter a multiple of {hint}',  // param
  'rule.maximum': 'Please enter {hint} or less',  // param
  'rule.exclusiveMaximum': 'Please enter less than {hint}',  // param
  'rule.minimum': 'Please enter {hint} or more',  // param
  'rule.exclusiveMinimum': 'Please enter more than {hint}',  // param
  'rule.maxLength': 'Please enter no more than {hint} characters',  // param
  'rule.minLength': 'Please enter at least {hint} characters',  // param
  'rule.pattern': 'Invalid format',  // param
  'rule.maxItems': 'Please make it {hint} or less',  // param
  'rule.minItems': 'Please make it {hint} or more',  // param
  'http.400': 'HTTP error: {detail}', 
  'http:401': 'HTTP error: {detail}', 
  'http:403': 'HTTP error: {detail}', 
  'http.404': 'HTTP error: {detail}', 
  'http.405': 'HTTP error: {detail}', 
  'http.406': 'HTTP error: {detail}', 
  'http.407': 'HTTP error: {detail}', 
  'http.408': 'HTTP error: {detail}', 
  'http.409': 'HTTP error: {detail}', 
  'http.410': 'HTTP error: {detail}', 
  'http.500': 'HTTP error: {detail}', 
  'http.501': 'HTTP error: {detail}', 
  'http.502': 'HTTP error: {detail}', 
  'http.503': 'HTTP error: {detail}', 

}