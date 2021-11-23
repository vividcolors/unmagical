//@ts-check
/** @module core/repository */

import {normalizeQuery} from './utils'
import {MgError} from './errors'
import {Json} from './schema'

export interface Repository {
  search: (query:Record<string,any>) => Promise<{entities:Json[], totalCount:number}>, 
  add: (entity:Json) => Promise<Json>, 
  replace: (entity:Json) => Promise<Json>, 
  remove: (entity:Json) => Promise<void>
}


/**
 * 
 * @function
 * @private
 * @param {Response} response 
 * @returns {Error}
 */
const responseToError = (response:Response):Error => {
  const message = response.status + ' ' + response.statusText
  const error = new Error(message)
  error.name = 'http.' + response.status
  return error
}

export type CreateRestRepositoryOptions = {
  idProperty?: string, 
  omitEmptyQueryParam?:boolean, 
  totalCountHeader?:string, 
  headers?:Record<string,string>, 
  optionsForSearch?:CreateRestRepositoryOptions, 
  optionsForAdd?:CreateRestRepositoryOptions, 
  optionsForUpdate?:CreateRestRepositoryOptions, 
  optionsForRemove?:CreateRestRepositoryOptions
}

/**
 * 
 * @function
 * @param {string} baseUrl
 * @param {Object} options
 * @param {string} options.idProperty
 * @param {boolean} options.omitEmptyQueryParam
 * @param {string} options.totalCountHeader
 * @param {Object} options.optionsForSearch
 * @param {Object} options.optionsForAdd
 * @param {Object} options.optionsForUpdate
 * @param {Object} options.optionsForRemove
 * @returns {Repository}
 */
export const createRestRepository = (baseUrl:string, options:CreateRestRepositoryOptions = {}):Repository => {
  const opts:CreateRestRepositoryOptions = {
    idProperty: 'id', 
    omitEmptyQueryParam: true, 
    totalCountHeader: 'X-Total-Count', 
    optionsForSearch: {}, 
    optionsForAdd: {}, 
    optionsForUpdate: {}, 
    optionsForRemove: {}, 
    ...options
  }
  return {
    search: (query) => {
      const fetchOptions = {
        method: 'GET', 
        mode: 'cors', 
        ...opts.optionsForSearch, 
        headers: {
          'Content-Type': 'application/json', 
          ...(opts.optionsForSearch.headers || {})
        }
      }
      const qs = new URLSearchParams(normalizeQuery(query, opts.omitEmptyQueryParam))
      const url = baseUrl + '?' + qs.toString()
      return fetch(url, fetchOptions as RequestInit)
      .then(( /** @type {Response} */ response) => {
        if (! response.ok) throw responseToError(response)
        return response.json()
        .then((entities) => {
          const totalCount = +(response.headers.get(opts.totalCountHeader))
          return {entities, totalCount}
        })
      })
    }, 
    add: (entity) => {
      const fetchOptions = {
        method: 'POST', 
        mode: 'cors', 
        ...opts.optionsForAdd, 
        headers: {
          'Content-Type': 'application/json', 
          ...(opts.optionsForAdd.headers || {})
        }, 
        body: JSON.stringify(entity)
      }
      const url = baseUrl
      return fetch(url, fetchOptions as RequestInit)
      .then((/** @type {Response} */ response) => {
        if (! response.ok) throw responseToError(response)
        return response.json()
      })
    }, 
    replace: (entity) => {
      const fetchOptions = {
        method: 'PUT', 
        mode: 'cors', 
        ...opts.optionsForUpdate, 
        headers: {
          'Content-Type': 'application/json', 
          ...(opts.optionsForUpdate.headers || {})
        }, 
        body: JSON.stringify(entity)
      }
      const url = baseUrl + '/' + entity[opts.idProperty]
      return fetch(url, fetchOptions as RequestInit)
      .then((/** @type {Response} */ response) => {
        if (! response.ok) throw responseToError(response)
        return response.json()
      })
    }, 
    remove: (entity) => {
      const fetchOptions = {
        method: 'DELETE', 
        mode: 'cors', 
        ...opts.optionsForRemove, 
        headers: {
          'Content-Type': 'application/json', 
          ...(opts.optionsForRemove.headers || {})
        }
      }
      const url = baseUrl + '/' + entity[opts.idProperty]
      return fetch(url, fetchOptions as RequestInit)
      .then((/** @type {Response} */ response) => {
        if (! response.ok) throw responseToError(response)
      })
    }
  }
}
