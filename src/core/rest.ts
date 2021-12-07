/**
 * REST client of Repository implmentation
 * 
 * @module core/rest
 */

import {normalizeQuery} from './utils'
import {Repository} from './updates'

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

export type MakeRestRepositoryOptions = {
  idProperty?: string, 
  omitEmptyQueryParam?:boolean, 
  totalCountHeader?:string, 
  headers?:Record<string,string>, 
  optionsForSearch?:MakeRestRepositoryOptions, 
  optionsForAdd?:MakeRestRepositoryOptions, 
  optionsForUpdate?:MakeRestRepositoryOptions, 
  optionsForRemove?:MakeRestRepositoryOptions
}

/**
 * 
 * @returns {Repository}
 */
export const makeRestRepository = (baseUrl:string, options:MakeRestRepositoryOptions = {}):Repository => {
  const opts:MakeRestRepositoryOptions = {
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
