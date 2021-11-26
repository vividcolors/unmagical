//@ts-check
/** @module core/updates */

import { API, Update } from './framework'
import { Env } from './env'
import { Json } from './schema'
import { MgError } from './errors'



/**
 * Repository, which can search/add/replace/remove entities.
 * @category Types
 */
export type Repository = {
  search: (query:Record<string,any>) => Promise<{entities:Json[], totalCount:number}>, 
  add: (entity:Json) => Promise<Json>, 
  replace: (entity:Json) => Promise<Json>, 
  remove: (entity:Json) => Promise<void>
}


/**
 * Loads a specified entity to the form for editing.
 * @category For Entity List
 */
export const editItem = (itemPath:string, formPath:string, env:Env):Env => {
  const form = {
    method: "replace", 
    data: API.extract(itemPath, env)
  }
  return API.add(formPath, form, env)
}

/**
 * Loads an initial data to the form for creating an entity.
 * @category For Entity List
 */
export const createItem = (data:Json, formPath:string, env:Env):Env => {
  const form = {
    method: "add", 
    data
  }
  return API.add(formPath, form, env)
}

/**
 * @category For Entity List
 */
export type CommitItemOptions = {
  errorSelector?: string, 
  loadingName?: string, 
  successName?: string, 
  failureName?: string
}

/**
 * Stores the entity in the form into a repository.
 * @category For Entity List
 */
export const commitItem = (repository:Repository) => (formPath:string, listPath:string, options:CommitItemOptions, env:Env):Env|Promise<any> => {
  const {enter, leave} = API.makePortal(env)
  const opts:CommitItemOptions = {
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
      const query = API.extract(queryPath, env) as Record<string,any>
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
      const mgerror:MgError = {code:error.name, detail:error.message}
      return API.openFeedback(opts.failureName, mgerror, env)
    }))
  }
}

/**
 * Discard the entity in the form.
 * @category For Entity List
 */
export const discardItem = (formPath:string, env:Env):Env => {
  env = API.replace(formPath, null, env)
  return env
}

/**
 * @category For Entity List
 */
export type DeleteItemOptions = {
  confirmName?: string, 
  loadingName?: string, 
  successName?: string, 
  failureName?: string
}

/**
 * Deletes an entity from a repository.
 * @category For Entity List
 */
export const deleteItem = (repository:Repository) => (itemPath:string, listPath:string, options:DeleteItemOptions, env:Env):Env|Promise<any> => {
  const {enter, leave} = API.makePortal(env)
  const opts:DeleteItemOptions = {
    confirmName: 'confirm', 
    loadingName: 'loading', 
    successName: 'success', 
    failureName: 'failure', 
    ...options
  }
  const queryPath = listPath + '/query'
  const itemsPath = listPath + '/items'
  const totalCountPath = listPath + '/totalCount'
  return leave(API.openDialog(opts.confirmName, {}, env))
  .then(enter((ok, env) => {
    const data = API.extract(itemPath, env)
    env = API.closeDialog(opts.confirmName, env)
    if (! ok) return env
    env = API.openProgress(opts.loadingName, null, env)
    return leave(repository.remove(data), env)
    .then(enter((_unused, env) => {
      const query = API.extract(queryPath, env) as Record<string,any>
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
      const mgerror:MgError = {code:error.name, detail:error.message}
      return API.openFeedback(opts.failureName, mgerror, env)
    }))
  }))
}

/**
 * @category For Entity List
 */
export type LoadItemsOptions = {
  loadingName?: string, 
  failureName?: string, 
  page?: number, 
  pageProperty?: string
}

/**
 * Fetches entities from a repository
 * @category For Entity List
 */
export const loadItems = (repository:Repository) => (listPath:string, options:LoadItemsOptions, env:Env):Env|Promise<any> => {
  const {enter, leave} = API.makePortal(env)
  const opts:LoadItemsOptions = {
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
  const query = API.extract(queryPath, env) as Record<string,any>
  if (opts.page !== null && opts.pageProperty) {
    query[opts.pageProperty] = opts.page
  }
  return leave(repository.search(query), env)
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
    const mgerror:MgError = {code:error.name, detail:error.message}
    return API.openFeedback(opts.failureName, mgerror, env)
  }))
}

/**
 * @category For Entity List
 */
export type SearchItemsOptions = {
  errorSelector?: string, 
  loadingName?: string, 
  failureName?: string
}

/**
 * Searches entities from a repository
 * @category For Entity List
 */
export const searchItems = (repository:Repository) => (formPath:string, listPath:string, options:SearchItemsOptions, env:Env):Env|Promise<any> => {
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
  const query = API.extract(formPath, env) as Record<string,any>
  return leave(repository.search(query), env)
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
    const mgerror:MgError = {code:error.name, detail:error.message}
    return API.openFeedback(opts.failureName, mgerror, env)
  }))
}

/**
 * Helper function. Builds a neat update collection for entity list app.
 * @category For Entity List
 */
export const makeEntityListUpdates = (repository:Repository):Record<string,Update> => {
  return {
    editItem, 
    createItem, 
    commitItem: commitItem(repository), 
    discardItem, 
    deleteItem: deleteItem(repository), 
    loadItems: loadItems(repository), 
    searchItems: searchItems(repository)
  }
}

/**
 * @category For Single Entity
 */
export type SubmitOptions = {
  path?: string, 
  errorSelector?: string, 
  loadingName?: string, 
  successName?: string, 
  failureName?: string
}

/**
 * Submits data to a repository. The method can be "add" or "replace".
 * @category For Single Entity
 */
export const submit = (repository:Repository) => (method:"add"|"replace", options:SubmitOptions, env:Env):Env|Promise<any> => {
  const {enter, leave} = API.makePortal(env)
  const opts:SubmitOptions = {
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
    return leave(repository[method](data), env)
    .then(enter((data, env) => {
      env = API.closeProgress(opts.loadingName, env)
      return leave(API.sleep(500, env))
      .then(enter((_unused, env) => {
        return API.openFeedback(opts.successName, {data}, env)
      }))
    }))
    .catch(enter((error, env) => {
      env = API.closeProgress(opts.loadingName, env)
      console.error('loading failed', error)
      const mgerror:MgError = {code:error.name, detail:error.message}
      return API.openFeedback(opts.failureName, mgerror, env)
    }))
  }
}

/**
 * @category For Single Entity
 */
export type ResetOptions = {
  confirmName?: string
}

/**
 * Resets data.
 * @category For Single Entity
 */
export const reset = (data:Json, options:ResetOptions, env:Env):Env|Promise<any> => {
  const {enter, leave} = API.makePortal(env)
  const opts:ResetOptions = {
    confirmName: 'confirm', 
    ...options
  }
  return leave(API.openDialog(opts.confirmName, {}, env))
  .then(enter((ok, env) => {
    env = API.closeDialog(opts.confirmName, env)
    if (ok) {
      return API.replace("", data, env)
    } else {
      return env
    }
  }))
}

/**
 * Loads a part of the entity into the form for editing.
 * @category For Single Entity
 */
export const editPart = (partPath:string, formPath:string, env:Env):Env => {
  const form = {
    method: 'replace', 
    action: partPath, 
    data: API.extract(partPath, env)
  }
  env = API.replace(formPath, form, env)
  return env
}

/**
 * Loads data into the form for createing a part of the entity.
 * @category For Single Entity
 */
export const createPart = (pathToAdd:string, data:Json, formPath:string, env:Env):Env => {
  const form = {
    method: 'add', 
    action: pathToAdd, 
    data
  }
  env = API.replace(formPath, form, env)
  return env
}

/**
 * @category For Single Entity
 */
export type CommitPartOptions = {
  errorSelector?: string, 
  idProperty?: string
}

/**
 * Stores the part in the form into the entity.
 * @category For Single Entity
 */
export const commitPart = (formPath:string, nextIdPath:string, options:CommitPartOptions, env:Env):Env => {
  const opts:CommitPartOptions = {
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
}

/**
 * Discards data in the form.
 * @category For Single Entity
 */
export const discardPart = (formPath:string, env:Env):Env => {
  env = API.replace(formPath, null, env)
  return env
}

/**
 * @category For Single Entity
 */
export type RemovePartOptions = {
  confirmName?: string
}

/**
 * Removes a part of the entity.
 * @category For Single Entity
 */
export const removePart = (partPath:string, options:RemovePartOptions, env:Env):Env|Promise<any> => {
  const {enter, leave} = API.makePortal(env)
  const opts:RemovePartOptions = {
    confirmName: 'confirm', 
    ...options
  }
  return leave(API.openDialog(opts.confirmName, {}, env))
  .then(enter((ok, env) => {
    env = API.closeDialog(opts.confirmName, env)
    if (ok) {
      env = API.remove(partPath, env)
      return env
    } else {
      return env
    }
  }))
}

/**
 * @category For Single Entity
 */
export type CopyPartOptions = {
  pathToAdd?: string, 
  idProperty?: string
}

/**
 * Copies a part of the entity.
 * @category For Single Entity
 */
export const copyPart = (partPath:string, nextIdPath:string, options:CopyPartOptions, env:Env):Env => {
  const opts:CopyPartOptions = {
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

/**
 * Helper function. Builds a neat update collection for single entity app.
 * @category For Single Entity
 */
export const makeEntityUpdates = (repository:Repository):Record<string,Update> => {
  return {
    submit: submit(repository), 
    reset, 
    editPart, 
    createPart, 
    commitPart, 
    discardPart, 
    removePart, 
    copyPart
  }
}