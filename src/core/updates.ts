//@ts-check
/** @module core/updates */

import { API, Update } from './framework'
import { Store } from './store'
import { Json } from './schema'
import { MgError } from './errors'



/**
 * Repository, which can search/add/replace/remove entities.
 * @category Types
 */
export type Repository = {
  get: (id:string|number) => Promise<Json>, 
  search: (query:Record<string,any>) => Promise<{entities:Json[], totalCount:number}>, 
  add: (entity:Json) => Promise<Json>, 
  replace: (entity:Json) => Promise<Json>, 
  remove: (entity:Json) => Promise<void>
}

export type SingularRepository = {
  get: () => Promise<Json>, 
  replace: (entity:Json) => Promise<Json>
}


/**
 * Loads a specified entity to the form for editing.
 * @category For Entity List
 */
export const editEntity = (entityPath:string, formPath:string, store:Store):Store => {
  const form = {
    method: "replace", 
    data: API.get(entityPath, store)
  }
  return API.add(formPath, form, store)
}

/**
 * Loads an initial data to the form for creating an entity.
 * @category For Entity List
 */
export const makeEntity = (data:Json, formPath:string, store:Store):Store => {
  const form = {
    method: "add", 
    data
  }
  return API.add(formPath, form, store)
}

/**
 * @category For Entity List
 */
export type CommitEntityOptions = {
  errorSelector?: string, 
  loadingName?: string, 
  successName?: string, 
  failureName?: string
}

/**
 * Stores the entity in the form into a repository.
 * @category For Entity List
 */
export const commitEntity = (repository:Repository) => (formPath:string, listPath:string, options:CommitEntityOptions, store:Store):Store|Promise<any> => {
  const {enter, leave} = API.makePortal(store)
  const opts:CommitEntityOptions = {
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
  store = API.touchAll(dataPath, store)
  store = API.validate(dataPath, store)
  const numErrors = API.countValidationErrors(dataPath, store)
  if (numErrors) {
    if (opts.errorSelector) {
      window.setTimeout(() => {
        const targetEl = document.querySelector(opts.errorSelector)
        if (targetEl) targetEl.scrollIntoView()
      }, 100)
    }
    return store
  } else {
    store = API.openProgress(opts.loadingName, null, store)
    const data = API.get(dataPath, store)
    const action = (API.get(methodPath, store)) as "add"|"replace"
    return leave(repository[action](data), store)
    .then(enter((_item, store) => {
      const query = API.get(queryPath, store) as Record<string,any>
      return leave(repository.search(query), store)
    }))
    .then(enter(({entities, totalCount}, store) => {
      store = API.replace(itemsPath, entities, store)
      store = API.replace(formPath, null, store)
      store = API.replace(totalCountPath, totalCount, store)
      store = API.closeProgress(opts.loadingName, store)
      return leave(API.sleep(500, store))
    }))
    .then(enter((_unused, store) => {
      return API.openFeedback(opts.successName, {}, store)
    }))
    .catch(enter((error, store) => {
      store = API.closeProgress(opts.loadingName, store)
      console.error('commision failed', error)
      const mgerror:MgError = {code:error.name, detail:error.message}
      return API.openFeedback(opts.failureName, mgerror, store)
    }))
  }
}

/**
 * Discard the entity in the form.
 * @category For Entity List
 */
export const discardEntity = (formPath:string, store:Store):Store => {
  store = API.replace(formPath, null, store)
  return store
}

/**
 * @category For Entity List
 */
export type DeleteEntityOptions = {
  confirmName?: string, 
  loadingName?: string, 
  successName?: string, 
  failureName?: string
}

/**
 * Deletes an entity from a repository.
 * @category For Entity List
 */
export const deleteEntity = (repository:Repository) => (entityPath:string, listPath:string, options:DeleteEntityOptions, store:Store):Store|Promise<any> => {
  const {enter, leave} = API.makePortal(store)
  const opts:DeleteEntityOptions = {
    confirmName: 'confirm', 
    loadingName: 'loading', 
    successName: 'success', 
    failureName: 'failure', 
    ...options
  }
  const queryPath = listPath + '/query'
  const itemsPath = listPath + '/items'
  const totalCountPath = listPath + '/totalCount'
  return leave(API.openDialog(opts.confirmName, {}, store))
  .then(enter((ok, store) => {
    const data = API.get(entityPath, store)
    store = API.closeDialog(opts.confirmName, store)
    if (! ok) return store
    store = API.openProgress(opts.loadingName, null, store)
    return leave(repository.remove(data), store)
    .then(enter((_unused, store) => {
      const query = API.get(queryPath, store) as Record<string,any>
      return leave(repository.search(query), store)
    }))
    .then(enter(({entities, totalCount}, store) => {
      store = API.closeProgress(opts.loadingName, store)
      store = API.replace(itemsPath, entities, store)
      store = API.replace(totalCountPath, totalCount, store)
      return leave(API.sleep(500, store))
    }))
    .then(enter((_unused, store) => {
      return API.openFeedback(opts.successName, {}, store)
    }))
    .catch(enter((error, store) => {
      store = API.closeProgress(opts.loadingName, store)
      console.error('deletion failed', error)
      const mgerror:MgError = {code:error.name, detail:error.message}
      return API.openFeedback(opts.failureName, mgerror, store)
    }))
  }))
}

/**
 * @category For Entity List
 */
export type LoadEntitiesOptions = {
  loadingName?: string, 
  failureName?: string, 
  page?: number, 
  pageProperty?: string
}

/**
 * Fetches entities from a repository
 * @category For Entity List
 */
export const loadEntities = (repository:Repository) => (listPath:string, options:LoadEntitiesOptions, store:Store):Store|Promise<any> => {
  const {enter, leave} = API.makePortal(store)
  const opts:LoadEntitiesOptions = {
    loadingName: 'loading', 
    failureName: 'failure', 
    page: null, 
    pageProperty: null, 
    ...options
  }
  const queryPath = listPath + '/query'
  const itemsPath = listPath + '/items'
  const totalCountPath = listPath + '/totalCount'
  store = API.openProgress(opts.loadingName, null, store)
  const query = API.get(queryPath, store) as Record<string,any>
  if (opts.page !== null && opts.pageProperty) {
    query[opts.pageProperty] = opts.page
  }
  return leave(repository.search(query), store)
  .then(enter(({entities, totalCount}, store) => {
    store = API.closeProgress(opts.loadingName, store)
    if (opts.page !== null && opts.pageProperty) {
      store = API.replace(queryPath + '/' + opts.pageProperty, opts.page, store)
    }
    store = API.replace(itemsPath, entities, store)
    store = API.replace(totalCountPath, totalCount, store)
    return store
  }))
  .catch(enter((error, store) => {
    store = API.closeProgress(opts.loadingName, store)
    console.error('loading failed', error)
    const mgerror:MgError = {code:error.name, detail:error.message}
    return API.openFeedback(opts.failureName, mgerror, store)
  }))
}

/**
 * @category For Entity List
 */
export type SearchEntitiesOptions = {
  errorSelector?: string, 
  loadingName?: string, 
  failureName?: string
}

/**
 * Searches entities from a repository
 * @category For Entity List
 */
export const searchEntities = (repository:Repository) => (formPath:string, listPath:string, options:SearchEntitiesOptions, store:Store):Store|Promise<any> => {
  let errorSelector = null
  if ("errorSelector" in options) {
    errorSelector = options.errorSelector
    delete options.errorSelector
  }    
  store = API.touchAll(formPath, store)
  store = API.validate(formPath, store)
  const numErrors = API.countValidationErrors(formPath, store)
  if (numErrors) {
    if (errorSelector) {
      window.setTimeout(() => {
        const targetEl = document.querySelector(errorSelector)
        if (targetEl) targetEl.scrollIntoView()
      }, 100)
    }
    return store
  }

  const {enter, leave} = API.makePortal(store)
  const opts = {
    loadingName: 'loading', 
    failureName: 'failure', 
    ...options
  }
  const queryPath = listPath + '/query'
  const itemsPath = listPath + '/items'
  const totalCountPath = listPath + '/totalCount'
  store = API.openProgress(opts.loadingName, null, store)
  const query = API.get(formPath, store) as Record<string,any>
  return leave(repository.search(query), store)
  .then(enter(({entities, totalCount}, store) => {
    store = API.closeProgress(opts.loadingName, store)
    store = API.replace(queryPath, query, store)
    store = API.replace(itemsPath, entities, store)
    store = API.replace(totalCountPath, totalCount, store)
    return store
  }))
  .catch(enter((error, store) => {
    store = API.closeProgress(opts.loadingName, store)
    console.error('search failed', error)
    const mgerror:MgError = {code:error.name, detail:error.message}
    return API.openFeedback(opts.failureName, mgerror, store)
  }))
}

/**
 * Helper function. Builds a neat update collection for entity list app.
 * @category For Entity List
 */
export const makeEntityListUpdates = (repository:Repository):Record<string,Update> => {
  return {
    editEntity, 
    makeEntity, 
    commitEntity: commitEntity(repository), 
    discardEntity, 
    deleteEntity: deleteEntity(repository), 
    loadEntities: loadEntities(repository), 
    searchEntities: searchEntities(repository)
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
export const submit = (repository:Repository) => (method:"add"|"replace", options:SubmitOptions, store:Store):Store|Promise<any> => {
  const {enter, leave} = API.makePortal(store)
  const opts:SubmitOptions = {
    path: '', 
    errorSelector: null, 
    loadingName: 'loading', 
    successName: 'success', 
    failureName: 'failure', 
    ...options
  }
  store = API.touchAll(opts.path, store)
  store = API.validate(opts.path, store)
  const numErrors = API.countValidationErrors(opts.path, store)
  if (numErrors) {
    if (opts.errorSelector) {
      window.setTimeout(() => {
        const targetEl = document.querySelector(opts.errorSelector)
        if (targetEl) targetEl.scrollIntoView()
      }, 100)
    }
    return store
  } else {
    const data = API.get(opts.path, store)
    store = API.openProgress(opts.loadingName, null, store)
    return leave(repository[method](data), store)
    .then(enter((data, store) => {
      store = API.closeProgress(opts.loadingName, store)
      return leave(API.sleep(500, store))
      .then(enter((_unused, store) => {
        return API.openFeedback(opts.successName, {data}, store)
      }))
    }))
    .catch(enter((error, store) => {
      store = API.closeProgress(opts.loadingName, store)
      console.error('loading failed', error)
      const mgerror:MgError = {code:error.name, detail:error.message}
      return API.openFeedback(opts.failureName, mgerror, store)
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
export const reset = (data:Json, options:ResetOptions, store:Store):Store|Promise<any> => {
  const {enter, leave} = API.makePortal(store)
  const opts:ResetOptions = {
    confirmName: 'confirm', 
    ...options
  }
  return leave(API.openDialog(opts.confirmName, {}, store))
  .then(enter((ok, store) => {
    store = API.closeDialog(opts.confirmName, store)
    if (ok) {
      return API.replace("", data, store)
    } else {
      return store
    }
  }))
}

/**
 * Loads a part of the entity into the form for editing.
 * @category For Single Entity
 */
export const editPart = (partPath:string, formPath:string, store:Store):Store => {
  const form = {
    method: 'replace', 
    action: partPath, 
    data: API.get(partPath, store)
  }
  store = API.replace(formPath, form, store)
  return store
}

/**
 * Loads data into the form for createing a part of the entity.
 * @category For Single Entity
 */
export const makePart = (pathToAdd:string, data:Json, formPath:string, store:Store):Store => {
  const form = {
    method: 'add', 
    action: pathToAdd, 
    data
  }
  store = API.replace(formPath, form, store)
  return store
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
export const commitPart = (formPath:string, nextIdPath:string, options:CommitPartOptions, store:Store):Store => {
  const opts:CommitPartOptions = {
    errorSelector: null, 
    idProperty: 'id', 
    ...options
  }
  const actionPath = formPath + '/action'
  const methodPath = formPath + '/method'
  const dataPath = formPath + '/data'
  store = API.touchAll(dataPath, store)
  store = API.validate(dataPath, store)
  const numErrors = API.countValidationErrors(dataPath, store)
  if (numErrors) {
    if (opts.errorSelector) {
      window.setTimeout(() => {
        const targetEl = document.querySelector(opts.errorSelector)
        if (targetEl) targetEl.scrollIntoView()
      }, 100)
    }
    return store
  } else {
    const method = API.get(methodPath, store) as "add"|"replace"
    const path = API.get(actionPath, store) as string
    const data = API.get(dataPath, store)
    if (method == "add") {
      if (opts.idProperty && nextIdPath) {
        const nextId = API.get(nextIdPath, store) as number
        store = API.replace(nextIdPath, nextId + 1, store)
        data[opts.idProperty] = nextId
      }
      store = API.add(path, data, store)
    } else {
      store = API.replace(path, data, store)
    }
    store = API.replace(formPath, null, store)
    return store
  }
}

/**
 * Discards data in the form.
 * @category For Single Entity
 */
export const discardPart = (formPath:string, store:Store):Store => {
  store = API.replace(formPath, null, store)
  return store
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
export const removePart = (partPath:string, options:RemovePartOptions, store:Store):Store|Promise<any> => {
  const {enter, leave} = API.makePortal(store)
  const opts:RemovePartOptions = {
    confirmName: 'confirm', 
    ...options
  }
  return leave(API.openDialog(opts.confirmName, {}, store))
  .then(enter((ok, store) => {
    store = API.closeDialog(opts.confirmName, store)
    if (ok) {
      store = API.remove(partPath, store)
      return store
    } else {
      return store
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
export const copyPart = (partPath:string, nextIdPath:string, options:CopyPartOptions, store:Store):Store => {
  const opts:CopyPartOptions = {
    pathToAdd: '', 
    idProperty: 'id', 
    ...options
  }
  const data = API.get(partPath, store)
  if (opts.idProperty && nextIdPath) {
    const nextId = API.get(nextIdPath, store) as number
    data[opts.idProperty] = nextId
    store = API.add(nextIdPath, nextId + 1, store)
  }
  const pathToAdd = opts.pathToAdd || partPath
  store = API.add(pathToAdd, data, store)
  return store
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
    makePart, 
    commitPart, 
    discardPart, 
    removePart, 
    copyPart
  }
}