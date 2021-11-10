//@ts-check

import { normalizePath, normalizeQuery } from './utils'
import * as E from './env'
import * as S from './schema'
import { app, h as h0 } from 'hyperapp'

/**
 * 
 * @typedef {import("./schema").Json} Json
 * @typedef {import("./schema").Schema} Schema
 * @typedef {import("./schema").Slot} Slot
 * @typedef {import("./schema").SchemaDb} SchemaDb
 * @typedef {import("./schema").LookupFunc} LookupFunc
 * @typedef {import("./env").Env} Env
 */


 /**
  * @namespace
  */
export const API = {
  // re-export from env
  test: E.test, 
  extract: E.extract, 
  getSlot: E.getSlot, 
  add: E.add, 
  remove: E.remove, 
  replace: E.replace, 
  move: E.move, 
  copy: E.copy, 
  duplicate: E.duplicate, 
  validate: E.validate, 
  mapDeep: E.mapDeep, 
  reduceDeep: E.reduceDeep, 
  getExtra: E.getExtra, 

  /**
   * 
   * @param {string} path 
   * @param {Env} env
   * @returns {Env} 
   */
  touchAll: (path, env) => {
    return E.mapDeep((slot, _path) => ({...slot, touched:true}), path, env)
  }, 

  /**
   * 
   * @param {string} path 
   * @param {Env} env
   * @returns {number} 
   */
  countValidationErrors: (path, env) => {
    return E.reduceDeep((cur, slot, _path) => {
      const d = slot.touched && slot.invalid ? 1 : 0
      return cur + d
    }, 0, path, env)
  }, 

  /**
   * 
   * @param {string} path 
   * @param {Env} env
   * @returns {string[]} 
   */
  validationErrors: (path, env) => {
    const errors = []
    E.reduceDeep((_cur, slot, path) => {
      if (slot.touched && slot.invalid) {
        errors.push(path)
      }
      return null
    }, null, path, env)
    return errors
  }, 

  /**
   * @param {string} path
   * @param {Env} env
   * @returns {{invalid:boolean, message:string}}
   */
  foldValidity: (path, env) => {
    return API.reduceDeep((cur, slot, _path) => {
      if (cur.invalid) return cur
      if (slot.touched && slot.invalid) return {invalid:true, message:slot.message}
      return cur
    }, /** @type {{invalid:boolean,message:string}} */({invalid:false, message:''}), path, env)
  }, 

  /**
   * @param {number} ms
   * @param {Env} env
   * @returns {Promise}
   */
  sleep: (ms, env) => {
    const p = new Promise((fulfill, reject) => {
      setTimeout(() => {
        fulfill(null)
      }, ms)
    })
    E.doReturn(env)
    return p
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Promise}
   */
  startReordering: (name, env) => {
    const p = new Promise((fulfill, reject) => {
      env = E.setExtra(name, {fulfill, reject}, env)
    })
    E.doReturn(env)
    return p
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  endReordering: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return env
    return E.setExtra(name, null, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {true|null}
   */
  getReordering: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return null
    return true
  }, 

  /**
   * @param {string} name
   * @param {any} data
   * @param {Env} env
   * @returns {Promise}
   */
  openDialog: (name, data, env) => {
    const p = new Promise((fulfill, reject) => {
      env = E.setExtra(name, {data, fulfill, reject}, env)
    })
    E.doReturn(env)
    return p
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  closeDialog: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return env
    return E.setExtra(name, null, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {any|null}
   */
  getDialog: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return null
    return extra.data
  }, 

  /**
   * @param {string} name
   * @param {any} data
   * @param {Env} env
   * @returns {Env}
   */
  openFeedback: (name, data, env) => {
    return E.setExtra(name, data, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  closeFeedback: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return env
    return E.setExtra(name, null, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {any|null}
   */
  getFeedback: (name, env) => {
    return E.getExtra(name, env)
  }, 

  /**
   * @param {string} name
   * @param {number} current
   * @param {Env} env
   * @returns {Env}
   */
  setPage: (name, current, env) => {
    return E.setExtra(name, current, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {number}
   */
  getPage: (name, env) => {
    const extra = E.getExtra(name, env)
    return (extra !== null) ? extra : 0
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  nextPage: (name, env) => {
    const extra = E.getExtra(name, env)
    const current = (extra !== null) ? extra : 0
    return E.setExtra(name, current + 1, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  prevPage: (name, env) => {
    const extra = E.getExtra(name, env)
    const current = (extra !== null) ? extra : 0
    return E.setExtra(name, current - 1, env)
  }, 

  /**
   * @param {string} name
   * @param {boolean} shown
   * @param {Env} env
   * @returns {Env}
   */
  setSwitch: (name, shown, env) => {
    return E.setExtra(name, shown, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {boolean}
   */
  getSwitch: (name, env) => {
    const extra = E.getExtra(name, env)
    return (extra !== null) ? extra : false
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  toggleSwitch: (name, env) => {
    const extra = E.getExtra(name, env)
    const current = (extra !== null) ? extra : false
    return E.setExtra(name, !current, env)
  }, 

  /*
   * TODO: progress bar, ReadStream, ...
   */
  /**
   * @param {string} name
   * @param {any} unknown
   * @param {Env} env
   * @returns {Env}
   */
  openProgress: (name, unknown, env) => {
    return E.setExtra(name, {current:-1}, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  closeProgress: (name, env) => {
    return E.setExtra(name, null, env)
  }, 

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {number|null}
   */
  getProgress: (name, env) => {
    const extra = E.getExtra(name, env)
    if (! extra) return null
    return extra.current
  }, 

  /**
   * @template P
   * @param {Env} env
   * @param {P} p
   * @returns {P}
   */
  withEnv: (env, p) => {
    if (env) E.doReturn(env)
    return p
  }, 

  /**
   * @param {(result:any, env:Env) => any} handler
   * @returns {(result:any) => any}
   */
  wrap: (handler) => {  // Our customized handler :: [result, env] => ...
    return (result) => {  // This is the actual, standard promise handler
      let result1 = null  // We will get the result in this variable.
      const ret = (res1) => {result1 = res1}
      actions.onPromiseThen({result, handler, ret})  // enter into hyperapp. Its result is undefined.
      return result1
    }
  }, 

  /**
   * @param {string} itemPath
   * @param {string} actionUrl
   * @param {string} formPath
   * @param {Env} env
   * @returns {Env}
   */
  editItem: (itemPath, actionUrl, formPath, env) => {
    const form = {
      action: actionUrl, 
      data: API.extract(itemPath, env)
    }
    return API.add(formPath, form, env)
  }, 

  /**
   * @param {Json} data
   * @param {string} actionUrl
   * @param {string} formPath
   * @param {Env} env
   * @returns {Env}
   */
  createItem: (data, actionUrl, formPath, env) => {
    const form = {
      action: actionUrl, 
      data
    }
    return API.add(formPath, form, env)
  }, 

  /**
   * @param {string} formPath
   * @param {string} listPath
   * @param {Object} options
   * @param {string} options.errorSelector
   * @param {string} options.commitMethod
   * @param {string} options.loadMethod
   * @param {string} options.totalCountHeader
   * @param {string} options.loadingName
   * @param {string} options.successName
   * @param {string} options.failureName
   * @param {boolean} options.omitEmptyString
   * @param {Env} env
   * @returns {Env|Promise}
   */
  commitItem: (formPath, listPath, options, env) => {
    const opts = {
      errorSelector: null, 
      commitMethod: 'POST', 
      loadMethod: 'GET', 
      totalCountHeader: '', 
      loadingName: 'loading', 
      successName: 'success', 
      failureName: 'failure', 
      omitEmptyString: true, 
      ...options
    }
    const actionPath = formPath + '/action'
    const dataPath = formPath + '/data'
    const loadUrl = API.extract(listPath + '/baseUrl', env)
    const queryPath = listPath + '/query'
    const itemsPath = listPath + '/items'
    const totalCountPath = listPath + '/totalCount'
    env = API.touchAll(dataPath, env)
    env = API.validate(dataPath, env)
    const numErrors = API.countValidationErrors(dataPath, env)
    if (numErrors) {
      if (opts.errorSelector) {
        window.setTimeout(() => {
          const targetEl = document.querySelector(opts.errorSelector)
          if (targetEl) targetEl.scrollIntoView()
        }, 100)
      }
      return env
    } else {
      const url = /** @type {string} */ (API.extract(actionPath, env))
      const data = API.extract(dataPath, env)
      const fetchOptions = {
        method: opts.commitMethod, 
        mode: 'cors', 
        body: JSON.stringify(data), 
        headers: {
          'Content-Type': 'application/json'
        }
      }
      env = API.openProgress(opts.loadingName, null, env)
      return API.withEnv(env, 
        /** @ts-ignore */
        fetch(url, fetchOptions)
        .then(API.wrap((response, env) => {
          if (! response.ok) {
            const error = new Error(response.statusText)
            error.name = 'HTTP Error'
            throw API.withEnv(env, error)
          }
          const fetchOptions2 = {
            method: opts.loadMethod, 
            mode: 'cors', 
            headers: {
              'Content-Type': 'application/json'
            }
          }
          const qs = new URLSearchParams(normalizeQuery(API.extract(queryPath, env), opts.omitEmptyString))
          const url = loadUrl + '?' + qs.toString()
          return API.withEnv(env, 
            /** @ts-ignore */
            fetch(url, fetchOptions2)
            .then(API.wrap((response, env) => {
              if (! response.ok) {
                const error = new Error(response.statusText)
                error.name = 'HTTP Error'
                throw API.withEnv(env, error)
              }
              return API.withEnv(env, response.json())
                .then(API.wrap((items, env) => {
                  env = API.replace(itemsPath, items, env)
                  env = API.replace(formPath, null, env)
                  env = API.closeProgress(opts.loadingName, env)
                  if (opts.totalCountHeader && API.test(totalCountPath, env)) {
                    const total = +(response.headers.get(opts.totalCountHeader))
                    env = API.replace(totalCountPath, total, env)
                  }
                  return API.sleep(500, env)
                    .then(API.wrap((response, env) => {
                      return API.openFeedback(opts.successName, {}, env)
                    }))
                }))
            }))
          )
        }))
        .catch(API.wrap((error, env) => {
          env = API.closeProgress(opts.loadingName, env)
          console.error('commision failed', error)
          const data = {name:error.name, message:error.message, url}
          return API.openFeedback(opts.failureName, data, env)
        }))
      )
    }
  }, 

  /**
   * @param {string} formPath
   * @param {Env} env
   * @returns {Env}
   */
  discardItem: (formPath, env) => {
    env = API.replace(formPath, null, env)
    return env
  }, 

  /**
   * @param {string} url
   * @param {string} listPath
   * @param {Object} options
   * @param {string} options.deleteMethod
   * @param {string} options.loadMethod
   * @param {string} options.totalCountHeader
   * @param {string} options.confirmName
   * @param {string} options.loadingName
   * @param {string} options.successName
   * @param {string} options.failureName
   * @param {boolean} options.omitEmptyString
   * @param {Env} env
   * @returns {Env|Promise}
   */
  deleteItem: (url, listPath, options, env) => {
    const opts = {
      deleteMethod: 'DELETE', 
      loadMethod: 'GET', 
      totalCountHeader: '', 
      confirmName: 'confirm', 
      loadingName: 'loading', 
      successName: 'success', 
      failureName: 'failure', 
      omitEmptyString: true, 
      ...options
    }
    const loadUrl = API.extract(listPath + '/baseUrl', env)
    const queryPath = listPath + '/query'
    const itemsPath = listPath + '/items'
    const totalCountPath = listPath + '/totalCount'
    return API.openDialog(opts.confirmName, {}, env)
      .then(API.wrap((ok, env) => {
        env = API.closeDialog(opts.confirmName, env)
        if (! ok) return env
        env = API.openProgress(opts.loadingName, null, env)
        const fetchOptions = {
          method: opts.deleteMethod, 
          mode: 'cors', 
          headers: {
            'Content-Type': 'application/json'
          }
        }
        return API.withEnv(env, 
          /** @ts-ignore */
          fetch(url, fetchOptions)
          .then(API.wrap((response, env) => {
            if (! response.ok) {
              const error = new Error(response.statusText)
              error.name = 'HTTP Error'
              throw API.withEnv(env, error)
            }
            const fetchOptions2 = {
              method: opts.loadMethod, 
              mode: 'cors', 
              headers: {
                'Content-Type': 'application/json'
              }
            }
            const qs = new URLSearchParams(normalizeQuery(API.extract(queryPath, env), opts.omitEmptyString))
            const url = loadUrl + '?' + qs.toString()
            return API.withEnv(env, 
              /** @ts-ignore */
              fetch(url, fetchOptions2)
              .then(API.wrap((response, env) => {
                if (! response.ok) {
                  const error = new Error(response.statusText)
                  error.name = 'HTTP Error'
                  throw API.withEnv(env, error)
                }
                return API.withEnv(env, response.json())
                  .then(API.wrap((items, env) => {
                    env = API.closeProgress(opts.loadingName, env)
                    env = API.replace(itemsPath, items, env)
                    if (opts.totalCountHeader && API.test(totalCountPath, env)) {
                      const total = +(response.headers.get(opts.totalCountHeader))
                      env = API.replace(totalCountPath, total, env)
                    }
                    return API.openFeedback(opts.successName, {}, env)
                  }))
              }))
            )
          }))
          .catch(API.wrap((error, env) => {
            env = API.closeProgress(opts.loadingName, env)
            console.error('deletion failed', error)
            const data = {name:error.name, message:error.message, url}
            return API.openFeedback(opts.failureName, data, env)
          }))
        )
      }))
  }, 

  /**
   * @param {string} listPath
   * @param {Object} options
   * @param {string} options.totalCountHeader
   * @param {string} options.method
   * @param {string} options.loadingName
   * @param {string} options.failureName
   * @param {number} options.page
   * @param {string} options.pageProperty
   * @param {boolean} options.omitEmptyString
   * @param {Env} env
   * @returns {Env|Promise}
   */
  loadItems: (listPath, options, env) => {
    const opts = {
      totalCountHeader: '', 
      method: 'GET', 
      loadingName: 'loading', 
      failureName: 'failure', 
      page: null, 
      pageProperty: null, 
      omitEmptyString: true, 
      ...options
    }
    const loadUrl = API.extract(listPath + '/baseUrl', env)
    const queryPath = listPath + '/query'
    const itemsPath = listPath + '/items'
    const totalCountPath = listPath + '/totalCount'
    const fetchOptions = {
      method: opts.method, 
      mode: 'cors', 
      headers: {
        'Content-Type': 'application/json'
      }
    }
    if (opts.page !== null && opts.pageProperty) {
      env = API.replace(queryPath + '/' + opts.pageProperty, opts.page, env)
    }
    env = API.openProgress(opts.loadingName, null, env)
    const qs = new URLSearchParams(normalizeQuery(API.extract(queryPath, env), opts.omitEmptyString))
    const url = loadUrl + '?' + qs.toString()
    return API.withEnv(env, 
      /** @ts-ignore */
      fetch(url, fetchOptions)
      .then(API.wrap((response, env) => {
        if (! response.ok) {
          const error = new Error(response.statusText)
          error.name = 'HTTP Error'
          throw API.withEnv(env, error)
        }
        return API.withEnv(env, response.json())
          .then(API.wrap((items, env) => {
            env = API.closeProgress(opts.loadingName, env)
            env = API.replace(itemsPath, items, env)
            if (opts.totalCountHeader && API.test(totalCountPath, env)) {
              const total = +(response.headers.get(opts.totalCountHeader))
              env = API.replace(totalCountPath, total, env)
            }
            return env
          }))
      }))
      .catch(API.wrap((error, env) => {
        env = API.closeProgress(opts.loadingName, env)
        console.error('loading failed', error)
        const data = {name:error.name, message:error.message, url}
        return API.openFeedback(opts.failureName, data, env)
      }))
    )
  }, 

  /**
   * @param {string} formPath
   * @param {string} listPath
   * @param {Object} options
   * @param {string} options.errorSelector
   * @param {string} options.totalCountHeader
   * @param {string} options.method
   * @param {string} options.loadingName
   * @param {string} options.failureName
   * @param {number} options.page
   * @param {string} options.pageProperty
   * @param {boolean} options.omitEmptyString
   * @param {Env} env
   * @returns {Env|Promise}
   */
  searchItems: (formPath, listPath, options, env) => {
    let errorSelector = null
    if ("errorSelector" in options) {
      errorSelector = options.errorSelector
      delete options.errorSelector
    }    
    env = API.touchAll(formPath, env)
    env = API.validate(formPath, env)
    const numErrors = API.countValidationErrors(formPath, env)
    if (numErrors) {
      if (errorSelector) {
        window.setTimeout(() => {
          const targetEl = document.querySelector(errorSelector)
          if (targetEl) targetEl.scrollIntoView()
        }, 100)
      }
      return env
    }
    env = API.copy(formPath, listPath + '/query', env)
    return API.loadItems(listPath, options, env)
  }, 

  /**
   * 
   * @param {string} url
   * @param {Object} options
   * @param {string} options.path
   * @param {string} options.errorSelector
   * @param {string} options.method
   * @param {string} options.loadingName
   * @param {string} options.successName
   * @param {string} options.failureName
   * @param {Env} env
   * @returns {Env|Promise}
   */
  submit: (url, options, env) => {
    const opts = {
      path: '', 
      errorSelector: null, 
      method: 'POST', 
      loadingName: 'loading', 
      successName: 'success', 
      failureName: 'failure', 
      ...options
    }
    env = API.touchAll(opts.path, env)
    env = API.validate(opts.path, env)
    const numErrors = API.countValidationErrors(opts.path, env)
    if (numErrors) {
      if (opts.errorSelector) {
        window.setTimeout(() => {
          const targetEl = document.querySelector(opts.errorSelector)
          if (targetEl) targetEl.scrollIntoView()
        }, 100)
      }
      return env
    } else {
      const fetchOptions = {
        method: opts.method, 
        mode: 'cors', 
        body: JSON.stringify(E.extract(opts.path, env)), 
        headers: {
          'Content-Type': 'application/json'
        }
      }
      env = API.openProgress(opts.loadingName, null, env)
      return API.withEnv(env, 
        /** @ts-ignore */
        fetch(url, fetchOptions)
        .then(API.wrap((response, env) => {
          if (! response.ok) {
            const error = new Error(response.statusText)
            error.name = 'HTTP Error'
            throw API.withEnv(env, error)
          }
          env = API.closeProgress(opts.loadingName, env)
          return API.openFeedback(opts.successName, {}, env)
        }))
        .catch(API.wrap((error, env) => {
          env = API.closeProgress(opts.loadingName, env)
          console.error('loading failed', error)
          const data = {name:error.name, message:error.message, url}
          return API.openFeedback(opts.failureName, data, env)
        }))
      )
    }
  }, 

  /**
   * @param {string} name 
   * @param {string} fromPath 
   * @param {Env} env
   * @returns {Env|Promise}
   */
  reorder: (name, fromPath, env) => {
    return API.startReordering(name, env)
      .then(API.wrap(({path}, env) => {
        env = API.endReordering(name, env)
        return API.move(fromPath, path, env)
      }))
  }, 

  /**
   * 
   * @param {Json} data
   * @param {Object} options
   * @param {string} options.confirmName
   * @param {Env} env
   * @returns {Env|Promise}
   */
  reset: (data, options, env) => {
    const opts = {
      confirmName: 'confirm', 
      ...options
    }
    return API.openDialog(opts.confirmName, {}, env)
      .then(API.wrap((ok, env) => {
        env = API.closeDialog(opts.confirmName, env)
        if (ok) {
          return API.replace("", data, env)
        } else {
          return env
        }
      }))
  }, 

  /**
   * @param {string} partPath
   * @param {string} formPath
   * @param {Env} env
   * @returns {Env}
   */
  editPart: (partPath, formPath, env) => {
    const form = {
      action: partPath, 
      data: API.extract(partPath, env)
    }
    env = API.replace(formPath, form, env)
    return env
  }, 

  /**
   * @param {string} pathToAdd 
   * @param {Json} data 
   * @param {string} formPath 
   * @param {Env} env
   */
  createPart: (pathToAdd, data, formPath, env) => {
    const form = {
      action: pathToAdd, 
      data
    }
    env = API.replace(formPath, form, env)
    return env
  }, 

  /**
   * @param {string} formPath
   * @param {string | null} nextIdPath 
   * @param {Object} options
   * @param {string | null} options.errorSelector
   * @param {string | null} options.idProperty
   * @param {Env} env 
   * @returns {Env}
   */
  commitPart: (formPath, nextIdPath, options, env) => {
    const opts = {
      errorSelector: null, 
      idProperty: 'id', 
      ...options
    }
    const actionPath = formPath + '/action'
    const dataPath = formPath + '/data'
    env = API.touchAll(dataPath, env)
    env = API.validate(dataPath, env)
    const numErrors = API.countValidationErrors(dataPath, env)
    if (numErrors) {
      if (opts.errorSelector) {
        window.setTimeout(() => {
          const targetEl = document.querySelector(opts.errorSelector)
          if (targetEl) targetEl.scrollIntoView()
        }, 100)
      }
      return env
    } else {
      const path = /** @type {string} */ (API.extract(actionPath, env))
      const data = API.extract(dataPath, env)
      if (path[path.length - 1] == '-') {
        if (opts.idProperty && nextIdPath) {
          const nextId = /** @type {number} */ (API.extract(nextIdPath, env))
          env = API.replace(nextIdPath, nextId + 1, env)
          data[opts.idProperty] = nextId
        }
        env = API.add(path, data, env)
      } else {
        env = API.replace(path, data, env)
      }
      env = API.replace(formPath, null, env)
      return env
    }
  }, 

  /**
   * @param {string} formPath 
   * @param {Env} env 
   * @returns {Env}
   */
  discardPart: (formPath, env) => {
    env = API.replace(formPath, null, env)
    return env
  }, 

  /**
   * 
   * @param {string} partPath
   * @param {Object} options
   * @param {string} options.confirmName
   * @param {Env} env
   * @returns {Promise}
   */
  removePart: (partPath, options, env) => {
    const opts = {
      confirmName: 'confirm', 
      ...options
    }
    return API.openDialog(opts.confirmName, {}, env)
      .then(API.wrap((ok, env) => {
        env = API.closeDialog(opts.confirmName, env)
        if (ok) {
          env = API.remove(partPath, env)
          return env
        } else {
          return env
        }
      }))
  }, 

  /**
   * @param {string} partPath 
   * @param {string | null} nextIdPath
   * @param {Object} options
   * @param {string | null} options.pathToAdd
   * @param {string | null} options.idProperty
   * @param {Env} env
   */
  copyPart: (partPath, nextIdPath, options, env) => {
    const opts = {
      pathToAdd: '', 
      idProperty: 'id', 
      ...options
    }
    const data = API.extract(partPath, env)
    if (opts.idProperty && nextIdPath) {
      const nextId = /** @type {number} */ (API.extract(nextIdPath, env))
      data[opts.idProperty] = nextId
      env = API.add(nextIdPath, nextId + 1, env)
    }
    const pathToAdd = opts.pathToAdd || partPath
    env = API.add(pathToAdd, data, env)
    return env
  }
}

const updateEnabledApis = {
  openDialog: API.openDialog, 
  closeDialog: API.closeDialog, 
  openFeedback: API.openFeedback, 
  closeFeedback: API.closeFeedback, 
  openProgress: API.openProgress, 
  closeProgress: API.closeProgress, 
  setPage: API.setPage, 
  nextPage: API.nextPage, 
  prevPage: API.prevPage, 
  setSwitch: API.setSwitch, 
  toggleSwitch: API.toggleSwitch, 
  editItem: API.editItem, 
  createItem: API.createItem, 
  commitItem: API.commitItem, 
  discardItem: API.discardItem, 
  deleteItem: API.deleteItem, 
  loadItems: API.loadItems, 
  searchItems: API.searchItems, 
  submit: API.submit, 
  reorder: API.reorder, 
  reset: API.reset, 
  editPart: API.editPart, 
  createPart: API.createPart, 
  commitPart: API.commitPart, 
  discardPart: API.discardPart, 
  removePart: API.removePart, 
  copyPart: API.copyPart
}

/**
 * @type {Object|null}
 */
let actions = null

/**
 * @param {Object} params
 * @param {Json} params.data
 * @param {Schema} params.schema
 * @param {(Env) => import('hyperapp').VNode} params.view
 * @param {Element} params.containerEl
 * @param {((env:Env, updatePointer:string, prevEnv:Env|null) => Env) | null} params.evolve
 * @param {{[name:string]:(any)}} params.updates
 * @param {((value:any, slot:Slot, schema:Schema, lookup:LookupFunc) => Slot) | null} params.validate
 * @param {((input:string, slot:Slot, schema:Schema) => Slot) | null} params.coerce
 */
export const start = (
    {
      data, 
      schema, 
      view, 
      containerEl, 
      evolve = null, 
      updates = {}, 
      validate = null, 
      coerce = null
    }) => {
  // complements reasonable defaults
  if (! evolve) evolve = (env, _pointer, _prevEnv) => env
  if (! validate) validate = S.validate(S.defaultRules, S.defaultMessages)
  if (! coerce) coerce = S.coerce(S.defaultRules, S.defaultMessages)

  const schemaDb = S.buildDb(schema)

  const actions0 = {
    onTextboxInput: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const value = ev.currentTarget[ev.currentTarget.dataset.mgValueAttribute]
      const slot0 = E.getSlot(path, state.baseEnv)
      const slot = {...slot0, input:value}
      const baseEnv = E.setSlot(path, slot, state.baseEnv)
      // We don't call evolve() here, because oninput is not a check point of evolve().
      // Thus we update not only baseEnv but also env.
      const slotb0 = E.getSlot(path, state.env)
      const slotb = {...slotb0, input:value}
      const env = E.setSlot(path, slotb, state.env)
      return {...state, baseEnv, env}
    }, 
    onTextboxBlur: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const value = ev.currentTarget[ev.currentTarget.dataset.mgValueAttribute]
      const npath = normalizePath(path)
      const slot0 = {...E.getSlot(path, state.baseEnv), touched:true}
      const slot = coerce(value, slot0, schemaDb[npath])
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setSlot(path, slot, baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = evolve(baseEnv, updatePointer, baseEnv)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onSliderInput: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const value = ev.currentTarget[ev.currentTarget.dataset.mgValueAttribute]
      const slot0 = E.getSlot(path, state.baseEnv)
      const slot = {...slot0, input:value}
      const baseEnv = E.setSlot(path, slot, state.baseEnv)
      // We don't call evolve() here, because oninput is not a check point of evolve().
      // Thus we update not only baseEnv but also env.
      const slotb0 = E.getSlot(path, state.env)
      const slotb = {...slotb0, input:value}
      const env = E.setSlot(path, slotb, state.env)
      return {...state, baseEnv, env}
    }, 
    onSliderChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const value = ev.currentTarget[ev.currentTarget.dataset.mgValueAttribute]
      const npath = normalizePath(path)
      const slot0 = {...E.getSlot(path, state.baseEnv), touched:true}
      const slot = coerce(value, slot0, schemaDb[npath])
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setSlot(path, slot, baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = evolve(baseEnv, updatePointer, state.env)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onListboxChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const value = ev.currentTarget[ev.currentTarget.dataset.mgValueAttribute]
      const npath = normalizePath(path)
      const slot0 = {...E.getSlot(path, state.baseEnv), touched:true}
      const slot = coerce(value, slot0, schemaDb[npath])
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setSlot(path, slot, baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = evolve(baseEnv, updatePointer, state.env)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onRadioChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const value = ev.currentTarget[ev.currentTarget.dataset.mgValueAttribute]
      const npath = normalizePath(path)
      const slot0 = {...E.getSlot(path, state.baseEnv), touched:true}
      const slot = coerce(value, slot0, schemaDb[npath])
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setSlot(path, slot, baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = evolve(baseEnv, updatePointer, state.env)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onCheckboxChange: (ev) => (state, actions) => {
      const path = ev.currentTarget.dataset.mgPath
      const checked = ev.currentTarget[ev.currentTarget.dataset.mgCheckedAttribute]
      const value = checked ? "true" : "false"
      const npath = normalizePath(path)
      const slot0 = {...E.getSlot(path, state.baseEnv), touched:true}
      const slot = coerce(value, slot0, schemaDb[npath])
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setSlot(path, slot, baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = evolve(baseEnv, updatePointer, state.env)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onSmartControlChange: (pair) => (state, actions) => {
      const pairs = Array.isArray(pair) ? pair : [pair]
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      for (let i = 0; i < pairs.length; i++) {
        const {path, input} = pairs[i]
        const slot0 = {...E.getSlot(path, baseEnv), touched:true}
        const slot = coerce(input, slot0, schemaDb[normalizePath(path)])
        baseEnv = E.setSlot(path, slot, baseEnv)
      }
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = evolve(baseEnv, updatePointer, state.env)
      env = E.validate("", env)
      return {...state, baseEnv, env}
    }, 
    onUpdate: (ev) => (state, actions) => {
      const update = ('currentTarget' in ev) ? ev.currentTarget.dataset.mgUpdate : ev.update
      const context = ('currentTarget' in ev) ? JSON.parse(ev.currentTarget.dataset.mgContext || "null") : ev.context
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setRet((env0) => {baseEnv = env0}, baseEnv)
      const func = updates[update] || updateEnabledApis[update]
      if (! func) throw new Error('onUpdate/0: no update or unknown update')
      if (! Array.isArray(context)) throw new Error('onUpdate/1: parameter must be an array')
      if (context.length + 1 != func.length) throw new Error('onUpdate/2: bad number of parameters')
      const res = func.apply(null, [...context, baseEnv])
      baseEnv = E.setRet(null, E.isEnv(res) ? res : baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = state.env
      if (! E.isSame(state.baseEnv, baseEnv)) {
        env = evolve(baseEnv, updatePointer, env)
        env = E.validate("", env)
      }
      return {...state, baseEnv, env}
    }, 
    onPromiseSettle: (ev) => (state, actions) => {
      const name = ('currentTarget' in ev) ? ev.currentTarget.dataset.mgName : ev.name
      const result = ('currentTarget' in ev) ? JSON.parse(ev.currentTarget.dataset.mgResult || "null") : ev.result
      const extra = E.getExtra(name, state.baseEnv)
      if (! extra || ! extra.fulfill) throw new Error('onPromiseSettle/0: no callback or unknown callback')
      // Calling fulfill directly will cause the process to re-enter the hyperapp, 
      // so use a different tick.
      window.requestAnimationFrame(() => {
        extra.fulfill(result)
      })
    }, 
    onPromiseThen: (context) => (state, actions) => {
      let updatePointer
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setRet((env0) => {baseEnv = env0}, baseEnv)
      const res = context.handler(context.result, baseEnv)
      baseEnv = E.setRet(null, E.isEnv(res) ? res : baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = state.env
      if (! E.isSame(state.baseEnv, baseEnv)) {
        env = evolve(baseEnv, updatePointer, env)
        env = E.validate("", env)
      }
      if (! E.isEnv(res)) {
        context.ret(res)
      }
      return {...state, baseEnv, env}
    }
  }

  let updatePointer
  let baseEnv = E.makeEnv(data, schemaDb, validate, true)
  baseEnv = E.validate("", baseEnv);
  [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
  let env = evolve(baseEnv, updatePointer, null)
  env = E.validate("", env)
  const state = {
    baseEnv, 
    env
  }
  const view1 = (state, actions) => view(state.env)
  actions = app(state, actions0, view1, containerEl)
  return {
    onUpdate: actions.onUpdate, 
  }
}



export const h = h0