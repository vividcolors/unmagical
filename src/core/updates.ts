//@ts-check
/** @module core/updates */

import { API } from './framework'

/**
 * 
 * @typedef {import("./schema").Json} Json
 * @typedef {import("./env").Env} Env
 * @typedef {import("./repository").Repository} Repository
 * @typedef {import("./errors").MgError} MgError
 */


/**
 * 
 * @function
 * @private
 * @param {string} s 
 * @returns {string}
 */
const capitalize = (s) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * 
 * @function
 * @private
 * @param {string} prefix 
 * @param {Object} obj 
 * @returns {Object}
 */
const decoratePropNames = (prefix, obj) => {
  if (prefix == '') return obj
  const rv = {}
  for (let p in obj) {
    rv[prefix + capitalize(p)] = obj[p]
  }
  return rv
}

/**
 * 
 * @function
 * @param {Repository} repository 
 * @param {string} prefix
 * @returns {Object}
 * @description
 * ```
 * {
 *   editItem: (itemPath:string, formPath:string, env:Env) => Env
 *   createItem: (data:Json, string:formPath, env:Env) => Env
 *   commitItem: (string:formPath, listPath:formPath, options:Object, env:Env) => Env|Promise
 *     options = {
 *       errorSelector :string  // default null
 *       loadingName :string  // default "loading"
 *       successName :string  // default "success"
 *       failureName :string  // default "failure"
 *     }
 *   discardItem: (formPath:string, env:Env) => Env
 *   deleteItem: (itemPath:string, listPath:string, options:Object, env:Env) => Env|Promise
 *     options = {
 *       confirmName :string  // default "confirm"
 *       loadingName :string  // default "loading"
 *       successName :string  // default "success"
 *       failureName :string  // default "failure"
 *     }
 *   loadItems: (listPath:string, options:Object, env:Env) => Env|Promise
 *     options = {
 *       loadingName :string  // default "loading"
 *       failureName :string  // default "failure"
 *       page :number  // default null
 *       pageProperty :string  // default null
 *     }
 *   searchItems: (formPath:string, listPath:string, options:Object, env:Env) => Env|Promise
 *     options = {
 *       errorSelector :string  // default null
 *       loadingName :string  // default "loading"
 *       failureName :string  // default "failure"
 *     }
 * }
 * ```
 */
export const makeEntityListUpdates = (repository, prefix = '') => {
  const rv = {
    /**
     * @param {string} itemPath
     * @param {string} formPath
     * @param {Env} env
     * @returns {Env}
     */
    editItem: (itemPath, formPath, env) => {
      const form = {
        method: "replace", 
        data: API.extract(itemPath, env)
      }
      return API.add(formPath, form, env)
    }, 

    /**
     * @param {Json} data
     * @param {string} formPath
     * @param {Env} env
     * @returns {Env}
     */
    createItem: (data, formPath, env) => {
      const form = {
        method: "add", 
        data
      }
      return API.add(formPath, form, env)
    }, 

    /**
     * @param {string} formPath
     * @param {string} listPath
     * @param {Object} options
     * @param {string} options.errorSelector
     * @param {string} options.loadingName
     * @param {string} options.successName
     * @param {string} options.failureName
     * @param {boolean} options.omitEmptyString
     * @param {Env} env
     * @returns {Env|Promise}
     */
    commitItem: (formPath, listPath, options, env) => {
      const {enter, leave} = API.makePortal(env)
      const opts = {
        errorSelector: null, 
        loadingName: 'loading', 
        successName: 'success', 
        failureName: 'failure', 
        ...options
      }
      const methodPath = formPath + '/method'
      const dataPath = formPath + '/data'
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
        env = API.openProgress(opts.loadingName, null, env)
        const data = API.extract(dataPath, env)
        const action = (API.extract(methodPath, env)) as "add"|"replace"
        return leave(repository[action](data), env)
        .then(enter((_item, env) => {
          const query = /** @type {Record<string, any>} */ (API.extract(queryPath, env))
          return leave(repository.search(query), env)
        }))
        .then(enter(({entities, totalCount}, env) => {
          env = API.replace(itemsPath, entities, env)
          env = API.replace(formPath, null, env)
          env = API.replace(totalCountPath, totalCount, env)
          env = API.closeProgress(opts.loadingName, env)
          return leave(API.sleep(500, env))
        }))
        .then(enter((_unused, env) => {
          return API.openFeedback(opts.successName, {}, env)
        }))
        .catch(enter((error, env) => {
          env = API.closeProgress(opts.loadingName, env)
          console.error('commision failed', error)
          const mgerror = /** @type {MgError} */ ({code:error.name, detail:error.message})
          return API.openFeedback(opts.failureName, mgerror, env)
        }))
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
     * @param {string} itemPath
     * @param {string} listPath
     * @param {Object} options
     * @param {string} options.confirmName
     * @param {string} options.loadingName
     * @param {string} options.successName
     * @param {string} options.failureName
     * @param {Env} env
     * @returns {Env|Promise}
     */
    deleteItem: (itemPath, listPath, options, env) => {
      const {enter, leave} = API.makePortal(env)
      const opts = {
        confirmName: 'confirm', 
        loadingName: 'loading', 
        successName: 'success', 
        failureName: 'failure', 
        ...options
      }
      const queryPath = listPath + '/query'
      const itemsPath = listPath + '/items'
      const totalCountPath = listPath + '/totalCount'
      return /** @type {Promise} */(leave(API.openDialog(opts.confirmName, {}, env)))
      .then(enter((ok, env) => {
        const data = API.extract(itemPath, env)
        env = API.closeDialog(opts.confirmName, env)
        if (! ok) return env
        env = API.openProgress(opts.loadingName, null, env)
        return /** @type {Promise} */ (leave(repository.remove(data), env))
        .then(enter((_unused, env) => {
          const query = /** @type {Record<String,any>} */ (API.extract(queryPath, env))
          return leave(repository.search(query), env)
        }))
        .then(enter(({entities, totalCount}, env) => {
          env = API.closeProgress(opts.loadingName, env)
          env = API.replace(itemsPath, entities, env)
          env = API.replace(totalCountPath, totalCount, env)
          return leave(API.sleep(500, env))
        }))
        .then(enter((_unused, env) => {
          return API.openFeedback(opts.successName, {}, env)
        }))
        .catch(enter((error, env) => {
          env = API.closeProgress(opts.loadingName, env)
          console.error('deletion failed', error)
          const mgerror = /** @type {MgError} */ ({code:error.name, detail:error.message})
          return API.openFeedback(opts.failureName, mgerror, env)
        }))
      }))
    }, 
  
    /**
     * @param {string} listPath
     * @param {Object} options
     * @param {string} options.loadingName
     * @param {string} options.failureName
     * @param {number} options.page
     * @param {string} options.pageProperty
     * @param {Env} env
     * @returns {Env|Promise}
     */
    loadItems: (listPath, options, env) => {
      const {enter, leave} = API.makePortal(env)
      const opts = {
        loadingName: 'loading', 
        failureName: 'failure', 
        page: null, 
        pageProperty: null, 
        ...options
      }
      const queryPath = listPath + '/query'
      const itemsPath = listPath + '/items'
      const totalCountPath = listPath + '/totalCount'
      env = API.openProgress(opts.loadingName, null, env)
      const query = /** @type {Record<String,any>} */ (API.extract(queryPath, env))
      if (opts.page !== null && opts.pageProperty) {
        query[opts.pageProperty] = opts.page
      }
      return /** @type {Promise} */ (leave(repository.search(query), env))
      .then(enter(({entities, totalCount}, env) => {
        env = API.closeProgress(opts.loadingName, env)
        if (opts.page !== null && opts.pageProperty) {
          env = API.replace(queryPath + '/' + opts.pageProperty, opts.page, env)
        }
        env = API.replace(itemsPath, entities, env)
        env = API.replace(totalCountPath, totalCount, env)
        return env
      }))
      .catch(enter((error, env) => {
        env = API.closeProgress(opts.loadingName, env)
        console.error('loading failed', error)
        const mgerror = /** @type {MgError} */ ({code:error.name, detail:error.message})
        return API.openFeedback(opts.failureName, mgerror, env)
      }))
    }, 
  
    /**
     * @param {string} formPath
     * @param {string} listPath
     * @param {Object} options
     * @param {string} options.errorSelector
     * @param {string} options.loadingName
     * @param {string} options.failureName
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

      const {enter, leave} = API.makePortal(env)
      const opts = {
        loadingName: 'loading', 
        failureName: 'failure', 
        ...options
      }
      const queryPath = listPath + '/query'
      const itemsPath = listPath + '/items'
      const totalCountPath = listPath + '/totalCount'
      env = API.openProgress(opts.loadingName, null, env)
      const query = /** @type {Record<String,any>} */ (API.extract(formPath, env))
      return /** @type {Promise} */ (leave(repository.search(query), env))
      .then(enter(({entities, totalCount}, env) => {
        env = API.closeProgress(opts.loadingName, env)
        env = API.replace(queryPath, query, env)
        env = API.replace(itemsPath, entities, env)
        env = API.replace(totalCountPath, totalCount, env)
        return env
      }))
      .catch(enter((error, env) => {
        env = API.closeProgress(opts.loadingName, env)
        console.error('search failed', error)
        const mgerror = /** @type {MgError} */ ({code:error.name, detail:error.message})
        return API.openFeedback(opts.failureName, mgerror, env)
      }))
    }
  }

  return decoratePropNames(prefix, rv)
}

/**
 * 
 * @param {Repository} repository 
 * @param {string} prefix
 * @returns {Object}
 * @description
 * ```
 * {
 *   submit: (method:string, options:Object, env:Env) => Env|Promise
 *     options = {
 *       path: string  // default ''
 *       errorSelector: string  // default null
 *       loadingName: string  // default "loading"
 *       successName: string  // default "success"
 *       failureName: string  // default "failure"
 *     }
 *   reset: (data:Json, options:Object, env:Env) => Env|Promise
 *     options = {
 *       confirmName: string  // default "confirm"
 *     }
 *   editPart: (partPath:string, formPath:string, env:Env) => Env
 *   createPart: (pathToAdd:string, data:Json, formPath:string, env:Env) => Env
 *   commitPart: (formPath:string, nextIdPath:string|null, options:Object, env:Env) => Env
 *     options = {
 *       errorSelector: string  // default null
 *       
 *     }
 * }
 * ```
 */
export const makeEntityUpdates = (repository, prefix = '') => {
  const rv = {
    /**
     * 
     * @param {string} method
     * @param {Object} options
     * @param {string} options.path
     * @param {string} options.errorSelector
     * @param {string} options.loadingName
     * @param {string} options.successName
     * @param {string} options.failureName
     * @param {Env} env
     * @returns {Env|Promise}
     */
    submit: (method, options, env) => {
      const {enter, leave} = API.makePortal(env)
      const opts = {
        path: '', 
        errorSelector: null, 
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
        const data = API.extract(opts.path, env)
        env = API.openProgress(opts.loadingName, null, env)
        return /** @type {Promise} */ (leave(repository[method](data), env))
        .then(enter((data, env) => {
          env = API.closeProgress(opts.loadingName, env)
          return /** @type {Promise} */ (leave(API.sleep(500, env)))
          .then(enter((_unused, env) => {
            return API.openFeedback(opts.successName, {data}, env)
          }))
        }))
        .catch(enter((error, env) => {
          env = API.closeProgress(opts.loadingName, env)
          console.error('loading failed', error)
          const mgerror = /** @type {MgError} */ ({code:error.name, detail:error.message})
          return API.openFeedback(opts.failureName, mgerror, env)
        }))
      }
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
      const {enter, leave} = API.makePortal(env)
      const opts = {
        confirmName: 'confirm', 
        ...options
      }
      return /** @type {Promise} */ (leave(API.openDialog(opts.confirmName, {}, env)))
      .then(enter((ok, env) => {
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
        method: 'replace', 
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
        method: 'add', 
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
      const methodPath = formPath + '/method'
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
        const method = API.extract(methodPath, env) as "add"|"replace"
        const path = API.extract(actionPath, env) as string
        const data = API.extract(dataPath, env)
        if (method == "add") {
          if (opts.idProperty && nextIdPath) {
            const nextId = API.extract(nextIdPath, env) as number
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
      const {enter, leave} = API.makePortal(env)
      const opts = {
        confirmName: 'confirm', 
        ...options
      }
      return /** @type {Promise} */ (leave(API.openDialog(opts.confirmName, {}, env)))
      .then(enter((ok, env) => {
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
        const nextId = API.extract(nextIdPath, env) as number
        data[opts.idProperty] = nextId
        env = API.add(nextIdPath, nextId + 1, env)
      }
      const pathToAdd = opts.pathToAdd || partPath
      env = API.add(pathToAdd, data, env)
      return env
    }
  }

  return decoratePropNames(prefix, rv)
}