/**
 * @module core/framework
 */

import { normalizePath } from './utils'
import * as E from './store'
import * as S from './schema'
import * as X from './errors'
import { app, h as h0, VNode, ActionType, View as HaView } from 'hyperapp'
import {MgError, NormalizeError} from './errors'
import {Json, Schema, Mdr, SchemaDb, Lookup, Rules} from './schema'
import {Store} from './store'
export {Store} from './store'

/**
 * @category Types
 */
export type Validity = {invalid:boolean, error:MgError|null}

/**
 * Developer-supplied evolve function.<br>
 * In this function, derived data are calculated.
 * 
 * @param store an store before evolve
 * @param updatePointer a common path of currently updated data
 * @param prevStore an store before current update
 * @returns evolved store
 * @category Types
 */
export type Evolve = (store:Store, updatePointer:string|null, prevStore:Store|null) => Store

/**
 * Developer-supplied render function.<br>
 * Render function maps store to vdom.
 * 
 * @param store current store
 * @returns VDOM
 * @category Types
 */
export type Render = (store:Store) => VNode<{}> | HaView<UnmagicalState, UnmagicalActions>

/**
 * Type of update function.
 * @param args one or more arguments; The last parameter will be Store.
 * @category Types
 */
export type Update = (...args:any[]) => Store|Promise<any>

type ThenHandler = (result:any) => any
type XThenHandler = (result:any, store:Store) => any
type DialogState = {
  data: any, 
  fulfill: (result:any) => undefined, 
  reject: (result:any) => undefined
}
type OnPromiseThenParam = {
  result: any,
  ret: (any:any) => void,
  handler: XThenHandler
}

/**
 * @hidden
 */
export type UnmagicalState = {
  baseStore: Store, 
  store: Store, 
  normalizeError: NormalizeError
}

/**
 * @hidden
 */
export type UnmagicalActions = {
  onTextboxInput: UnmagicalAction<Event>, 
  onTextboxBlur: UnmagicalAction<Event>, 
  onSliderInput: UnmagicalAction<Event>, 
  onSliderChange: UnmagicalAction<Event>, 
  onListboxChange: UnmagicalAction<Event>, 
  onRadioChange: UnmagicalAction<Event>, 
  onCheckboxChange: UnmagicalAction<Event>, 
  onSmartControlChange: UnmagicalAction<{path:string,input:string}|[{path:string,input:string}]>, 
  onUpdate: UnmagicalAction<Event|{update:string,params:any[]}>, 
  onPromiseSettle: UnmagicalAction<Event|{name:string,result:any}>, 
  onPromiseThen: UnmagicalAction<OnPromiseThenParam>
}

/**
 * @hidden
 */
export type UnmagicalAction<T> = ActionType<T, UnmagicalState, UnmagicalActions>

/**
 * @category start
 */
export type StartParameter = {
  data: Json, 
  schema: Schema, 
  render: Render, 
  containerEl: Element, 
  evolve?: Evolve, 
  updates?: Record<string,Update>
  rules?: Rules, 
  catalog?: Record<string,string>
}

/**
 * @category start
 */
export type StartValue = {
  onUpdate: UnmagicalAction<Event|{update:string,params:any[]}>
}

/**
 * @namespace
 */
export namespace API {
  // re-export from store
  export const test = E.test
  export const get = E.get
  export const getMdr = E.getMdr
  export const add = E.add
  export const remove = E.remove
  export const replace = E.replace
  export const move = E.move
  export const copy = E.copy
  export const duplicate = E.duplicate
  export const validate = E.validate
  export const mapDeep = E.mapDeep
  export const reduceDeep = E.reduceDeep
  export const getExtra = E.getExtra

  /**
   * 
   * @param {string} path 
   * @param {Store} store
   * @returns {Store} 
   */
  export const touchAll = (path:string, store:Store):Store => {
    return E.mapDeep((mdr, _path) => ({...mdr, touched:true}), path, store)
  }

  /**
   * 
   * @param {string} path 
   * @param {Store} store
   * @returns {number} 
   */
  export const countValidationErrors = (path:string, store:Store):number => {
    return E.reduceDeep((cur, mdr, _path) => {
      const d = mdr.touched && mdr.invalid ? 1 : 0
      return cur + d
    }, 0, path, store)
  }

  /**
   * 
   * @param {string} path 
   * @param {Store} store
   * @returns {string[]} 
   */
  export const validationErrors = (path:string, store:Store):string[] => {
    const errors:string[] = []
    E.reduceDeep((_cur, mdr, path) => {
      if (mdr.touched && mdr.invalid) {
        errors.push(path)
      }
      return null
    }, null, path, store)
    return errors
  }

  /**
   * @param {string} path
   * @param {Store} store
   * @returns {{invalid:boolean, error:MgError|null}}
   */
  export const foldValidity = (path:string, store:Store):Validity => {
    return API.reduceDeep<Validity>((cur, mdr, _path) => {
      if (cur.invalid) return cur
      if (mdr.touched && mdr.invalid) return {invalid:true, error:mdr.error}
      return cur
    }, {invalid:false, error:null}, path, store)
  }

  /**
   * @param {number} ms
   * @param {Store} store
   * @returns {[Promise, Store]}
   */
  export const sleep = (ms:number, store:Store):[Promise<null>, Store] => {
    const p = new Promise<null>((fulfill, reject) => {
      setTimeout(() => {
        fulfill(null)
      }, ms)
    })
    return [p, store]
  }

  /**
   * @param {string} name
   * @param {string} itemPath
   * @param {string} group
   * @param {Store} store
   * @returns {[Promise, Store]}
   */
  export const startReordering = <T>(name:string, itemPath:string, group:string, store:Store):[Promise<T>, Store] => {
    const p = new Promise<T>((fulfill, reject) => {
      store = E.setExtra(name, {itemPath, group, fulfill, reject}, store)
    })
    return [p, store]
  }

  /**
   * @param {string} name
   * @param {Store} store
   * @returns {Store}
   */
  export const endReordering = (name:string, store:Store):Store => {
    const extra = E.getExtra(name, store)
    if (! extra) return store
    return E.setExtra(name, null, store)
  }

  /**
   * @param {string} name
   * @param {Store} store
   * @returns {string|null}
   */
  export const getReordering = (name:string, store:Store):string|null => {
    const extra = E.getExtra(name, store) as {itemPath:string}|null
    if (! extra) return null
    return extra.itemPath
  }

  /**
   * @param {string} name
   * @param {any} data
   * @param {Store} store
   * @returns {[Promise, Store]}
   */
  export const openDialog = (name:string, data:any, store:Store):[Promise<boolean>,Store] => {
    const p = new Promise<boolean>((fulfill, reject) => {
      store = E.setExtra(name, {data, fulfill, reject}, store)
    })
    return [p, store]
  }

  /**
   * @param {string} name
   * @param {Store} store
   * @returns {Store}
   */
  export const closeDialog = (name:string, store:Store):Store => {
    const extra = E.getExtra(name, store)
    if (! extra) return store
    return E.setExtra(name, null, store)
  }

  /**
   * @param {string} name
   * @param {Store} store
   * @returns {any|null}
   */
  export const getDialog = (name:string, store:Store):any|null => {
    const extra = E.getExtra(name, store) as DialogState|null
    if (! extra) return null
    return extra.data
  }

  /**
   * @param {string} name
   * @param {any} data
   * @param {Store} store
   * @returns {Store}
   */
  export const openFeedback = (name:string, data:any, store:Store):Store => {
    return E.setExtra(name, data, store)
  }

  /**
   * @param {string} name
   * @param {Store} store
   * @returns {Store}
   */
  export const closeFeedback = (name:string, store:Store):Store => {
    const extra = E.getExtra(name, store)
    if (! extra) return store
    return E.setExtra(name, null, store)
  }

  /**
   * @param {string} name
   * @param {Store} store
   * @returns {any|null}
   */
  export const getFeedback = (name:string, store:Store):any|null => {
    return E.getExtra(name, store)
  }

  /**
   * @param {string} name
   * @param {number} current
   * @param {Store} store
   * @returns {Store}
   */
  export const setPage = (name:string, current:number, store:Store):Store => {
    return E.setExtra(name, current, store)
  }

  /**
   * @param {string} name
   * @param {Store} store
   * @returns {number}
   */
  export const getPage = (name:string, store:Store):number => {
    const extra = E.getExtra(name, store) as number|null
    return (extra !== null) ? extra : 0
  }

  /**
   * @param {string} name
   * @param {Store} store
   * @returns {Store}
   */
  export const nextPage = (name:string, store:Store):Store => {
    const extra = E.getExtra(name, store) as number|null
    const current = (extra !== null) ? extra : 0
    return E.setExtra(name, current + 1, store)
  }

  /**
   * @param {string} name
   * @param {Store} store
   * @returns {Store}
   */
  export const prevPage = (name:string, store:Store):Store => {
    const extra = E.getExtra(name, store) as number|null
    const current = (extra !== null) ? extra : 0
    return E.setExtra(name, current - 1, store)
  }

  /**
   * @param {string} name
   * @param {boolean} shown
   * @param {Store} store
   * @returns {Store}
   */
  export const setSwitch = (name:string, shown:boolean, store:Store):Store => {
    return E.setExtra(name, shown, store)
  }

  /**
   * @param {string} name
   * @param {Store} store
   * @returns {boolean}
   */
  export const getSwitch = (name:string, store:Store):boolean => {
    const extra = E.getExtra(name, store) as boolean|null
    return (extra !== null) ? extra : false
  }

  /**
   * @param {string} name
   * @param {Store} store
   * @returns {Store}
   */
  export const toggleSwitch = (name:string, store:Store):Store => {
    const extra = E.getExtra(name, store) as boolean|null
    const current = (extra !== null) ? extra : false
    return E.setExtra(name, !current, store)
  }

  /*
   * TODO: progress bar, ReadStream, ...
   */
  /**
   * @param {string} name
   * @param {any} unknown
   * @param {Store} store
   * @returns {Store}
   */
  export const openProgress = (name:string, unknown:any, store:Store):Store => {
    return E.setExtra(name, {current:-1}, store)
  }

  /**
   * @param {string} name
   * @param {Store} store
   * @returns {Store}
   */
  export const closeProgress = (name:string, store:Store):Store => {
    return E.setExtra(name, null, store)
  }

  /**
   * @param {string} name
   * @param {Store} store
   * @returns {number|null}
   */
  export const getProgress = (name:string, store:Store):number|null => {
    const extra = E.getExtra(name, store) as {current:number}|null
    if (! extra) return null
    return extra.current
  }
  
  /**
   * @param {string} name 
   * @param {string} fromPath 
   * @param {string} group
   * @param {Store} store
   * @returns {Store|Promise}
   */
  export const reorder = (name:string, fromPath:string, group:string, store:Store):Store|Promise<{path:string}> => {
    const {enter, leave} = API.makePortal(store)
    return leave(API.startReordering<{path:string}>(name, fromPath, group, store))
    .then(enter(({path}, store) => {
      store = API.endReordering(name, store)
      return API.move(fromPath, path, store)
    }))
  }

  /**
   * @param {Store} store
   */
  export const makePortal = (store:Store) => {
    return {
      /**
       * @param {(result:any, store:Store) => any} handler
       * @returns {(result:any) => any}
       */
      enter: (handler:XThenHandler):ThenHandler => {  // Our customized handler :: [result, store] => ...
        return (result) => {  // This is the actual, standard promise handler
          let result1 = null  // We will get the result in this variable.
          const ret = (res1) => {result1 = res1}
          (store.onPromiseThen as UnmagicalAction<OnPromiseThenParam>)({result, handler, ret})  // enter into hyperapp. Its result is undefined.
          return result1
        }
      }, 
      /**
       * @param {[(Promise|Error), Store] | (Promise|Error)} x
       * @param {Store} [y]
       * @returns {Promise|Error}
       */
      leave: <T>(x:[T, Store]|T, y?:Store):T => {
        const p = Array.isArray(x) ? x[0] : x
        const store = Array.isArray(x) ? x[1] : y
        if (! E.isStore(store)) throw new Error('exit/1: store required')
        E.doReturn(store)
        return p
      }
    }
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
  reorder: API.reorder
}

/**
 * Starts frontend application.
 * @category start
 */
export const start = (
    {
      data, 
      schema, 
      render, 
      containerEl, 
      evolve = null, 
      updates = {}, 
      rules = null, 
      catalog = null
    }:StartParameter):StartValue => {
  // complements reasonable defaults
  if (! evolve) evolve = (store, _pointer, _prevStore) => store
  const validate = S.validate(rules || S.defaultRules)
  const coerce = S.coerce
  const normalizeError = X.normalizeError(catalog || X.defaultCatalog)

  const schemaDb = S.buildDb(schema)

  const actions0 = {
    onTextboxInput: (ev:Event) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const path = (ev.currentTarget as HTMLElement).dataset.mgPath
      const value = ev.currentTarget[(ev.currentTarget as HTMLElement).dataset.mgValueAttribute]
      const mdr0 = E.getMdr(path, state.baseStore)
      const mdr = {...mdr0, input:value}
      const baseStore = E.setMdr(path, mdr, state.baseStore)
      // We don't call evolve() here, because oninput is not a check point of evolve().
      // Thus we update not only baseStore but also store.
      const mdrb0 = E.getMdr(path, state.store)
      const mdrb = {...mdrb0, input:value}
      const store = E.setMdr(path, mdrb, state.store)
      return {...state, baseStore, store}
    }, 
    onTextboxBlur: (ev:Event) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const path = (ev.currentTarget as HTMLElement).dataset.mgPath
      const value = ev.currentTarget[(ev.currentTarget as HTMLElement).dataset.mgValueAttribute]
      const npath = normalizePath(path)
      const mdr0 = {...E.getMdr(path, state.baseStore), touched:true}
      const mdr = coerce(value, mdr0, schemaDb[npath])
      let updatePointer
      let baseStore = E.beginUpdateTracking(state.baseStore)
      baseStore = E.setMdr(path, mdr, baseStore)
      baseStore = E.validate("", baseStore);
      [updatePointer, baseStore] = E.endUpdateTracking(baseStore)
      let store = evolve(baseStore, updatePointer, baseStore)
      store = E.validate("", store)
      return {...state, baseStore, store}
    }, 
    onSliderInput: (ev:Event) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const path = (ev.currentTarget as HTMLElement).dataset.mgPath
      const value = ev.currentTarget[(ev.currentTarget as HTMLElement).dataset.mgValueAttribute]
      const mdr0 = E.getMdr(path, state.baseStore)
      const mdr = {...mdr0, input:value}
      const baseStore = E.setMdr(path, mdr, state.baseStore)
      // We don't call evolve() here, because oninput is not a check point of evolve().
      // Thus we update not only baseStore but also store.
      const mdrb0 = E.getMdr(path, state.store)
      const mdrb = {...mdrb0, input:value}
      const store = E.setMdr(path, mdrb, state.store)
      return {...state, baseStore, store}
    }, 
    onSliderChange: (ev:Event) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const path = (ev.currentTarget as HTMLElement).dataset.mgPath
      const value = ev.currentTarget[(ev.currentTarget as HTMLElement).dataset.mgValueAttribute]
      const npath = normalizePath(path)
      const mdr0 = {...E.getMdr(path, state.baseStore), touched:true}
      const mdr = coerce(value, mdr0, schemaDb[npath])
      let updatePointer
      let baseStore = E.beginUpdateTracking(state.baseStore)
      baseStore = E.setMdr(path, mdr, baseStore)
      baseStore = E.validate("", baseStore);
      [updatePointer, baseStore] = E.endUpdateTracking(baseStore)
      let store = evolve(baseStore, updatePointer, state.store)
      store = E.validate("", store)
      return {...state, baseStore, store}
    }, 
    onListboxChange: (ev:Event) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const path = (ev.currentTarget as HTMLElement).dataset.mgPath
      const value = ev.currentTarget[(ev.currentTarget as HTMLElement).dataset.mgValueAttribute]
      const npath = normalizePath(path)
      const mdr0 = {...E.getMdr(path, state.baseStore), touched:true}
      const mdr = coerce(value, mdr0, schemaDb[npath])
      let updatePointer
      let baseStore = E.beginUpdateTracking(state.baseStore)
      baseStore = E.setMdr(path, mdr, baseStore)
      baseStore = E.validate("", baseStore);
      [updatePointer, baseStore] = E.endUpdateTracking(baseStore)
      let store = evolve(baseStore, updatePointer, state.store)
      store = E.validate("", store)
      return {...state, baseStore, store}
    }, 
    onRadioChange: (ev:Event) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const path = (ev.currentTarget as HTMLElement).dataset.mgPath
      const value = ev.currentTarget[(ev.currentTarget as HTMLElement).dataset.mgValueAttribute]
      const npath = normalizePath(path)
      const mdr0 = {...E.getMdr(path, state.baseStore), touched:true}
      const mdr = coerce(value, mdr0, schemaDb[npath])
      let updatePointer
      let baseStore = E.beginUpdateTracking(state.baseStore)
      baseStore = E.setMdr(path, mdr, baseStore)
      baseStore = E.validate("", baseStore);
      [updatePointer, baseStore] = E.endUpdateTracking(baseStore)
      let store = evolve(baseStore, updatePointer, state.store)
      store = E.validate("", store)
      return {...state, baseStore, store}
    }, 
    onCheckboxChange: (ev:Event) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const path = (ev.currentTarget as HTMLElement).dataset.mgPath
      const checked = ev.currentTarget[(ev.currentTarget as HTMLElement).dataset.mgCheckedAttribute]
      const value = checked ? "true" : "false"
      const npath = normalizePath(path)
      const mdr0 = {...E.getMdr(path, state.baseStore), touched:true}
      const mdr = coerce(value, mdr0, schemaDb[npath])
      let updatePointer
      let baseStore = E.beginUpdateTracking(state.baseStore)
      baseStore = E.setMdr(path, mdr, baseStore)
      baseStore = E.validate("", baseStore);
      [updatePointer, baseStore] = E.endUpdateTracking(baseStore)
      let store = evolve(baseStore, updatePointer, state.store)
      store = E.validate("", store)
      return {...state, baseStore, store}
    }, 
    onSmartControlChange: (pair:{path:string,input:string}|[{path:string,input:string}]) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const pairs = Array.isArray(pair) ? pair : [pair]
      let updatePointer
      let baseStore = E.beginUpdateTracking(state.baseStore)
      for (let i = 0; i < pairs.length; i++) {
        const {path, input} = pairs[i]
        const mdr0 = {...E.getMdr(path, baseStore), touched:true}
        const mdr = coerce(input, mdr0, schemaDb[normalizePath(path)])
        baseStore = E.setMdr(path, mdr, baseStore)
      }
      baseStore = E.validate("", baseStore);
      [updatePointer, baseStore] = E.endUpdateTracking(baseStore)
      let store = evolve(baseStore, updatePointer, state.store)
      store = E.validate("", store)
      return {...state, baseStore, store}
    }, 
    onUpdate: (ev:Event|{update:string,params:any[]}) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const update = ('currentTarget' in ev) ? (ev.currentTarget as HTMLElement).dataset.mgUpdate : ev.update
      const params = ('currentTarget' in ev) ? JSON.parse((ev.currentTarget as HTMLElement).dataset.mgParams || "null") : ev.params
      let updatePointer:string
      let baseStore = E.beginUpdateTracking(state.baseStore)
      baseStore = E.setPortal((store0) => {baseStore = store0}, actions.onPromiseThen, baseStore)
      const func = updates[update] || updateEnabledApis[update]
      if (! func) throw new Error('onUpdate/0: no update or unknown update')
      if (! Array.isArray(params)) throw new Error('onUpdate/1: params must be an array')
      if (params.length + 1 != func.length) throw new Error('onUpdate/2: bad number of params')
      const res = func.apply(null, [...params, baseStore])
      baseStore = E.setPortal(null, null, E.isStore(res) ? res : baseStore)
      baseStore = E.validate("", baseStore);
      [updatePointer, baseStore] = E.endUpdateTracking(baseStore)
      let store = state.store
      if (! E.isSame(state.baseStore, baseStore)) {
        store = evolve(baseStore, updatePointer, store)
        store = E.validate("", store)
      }
      return {...state, baseStore, store}
    }, 
    onPromiseSettle: (ev:Event|{name:string,result:any}) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const name = ('currentTarget' in ev) ? (ev.currentTarget as HTMLElement).dataset.mgName : ev.name
      const result = ('currentTarget' in ev) ? JSON.parse((ev.currentTarget as HTMLElement).dataset.mgResult || "null") : ev.result
      const extra = E.getExtra(name, state.baseStore) as DialogState
      if (! extra || ! extra.fulfill) throw new Error('onPromiseSettle/0: no callback or unknown callback')
      // Calling fulfill() will cause the process to re-enter the hyperapp, 
      // so we call fulfill() not now but in a different opportunity.
      setTimeout(() => {
        extra.fulfill(result)
      }, 0)
      return null  // indicating no update.
    }, 
    onPromiseThen: (context:OnPromiseThenParam) => (state:UnmagicalState, actions:UnmagicalActions) => {
      let updatePointer:string
      let baseStore = E.beginUpdateTracking(state.baseStore)
      baseStore = E.setPortal((store0) => {baseStore = store0}, actions.onPromiseThen, baseStore)
      const res = context.handler(context.result, baseStore)
      baseStore = E.setPortal(null, null, E.isStore(res) ? res : baseStore)
      baseStore = E.validate("", baseStore);
      [updatePointer, baseStore] = E.endUpdateTracking(baseStore)
      let store = state.store
      if (! E.isSame(state.baseStore, baseStore)) {
        store = evolve(baseStore, updatePointer, store)
        store = E.validate("", store)
      }
      if (! E.isStore(res)) {
        context.ret(res)
      }
      return {...state, baseStore, store}
    }
  }

  let updatePointer:string
  let baseStore = E.makeStore(data, schemaDb, validate, true)
  baseStore = E.validate("", baseStore);
  [updatePointer, baseStore] = E.endUpdateTracking(baseStore)
  let store = evolve(baseStore, updatePointer, null)
  store = E.validate("", store)
  const state:UnmagicalState = {
    baseStore, 
    store, 
    normalizeError
  }
  const view1:HaView<UnmagicalState, UnmagicalActions> = (state, actions) => render(state.store) as VNode
  const actions = app(state, actions0, view1, containerEl)
  return {
    onUpdate: actions.onUpdate, 
  }
}

/**
 * @category once
 */
export type OnceParameter = {
  data: Json, 
  schema: Schema, 
  evolve?: Evolve, 
  rules?: Rules
}

/**
 * Runs headless Unmagical once. Thus you can obtain the evolved store from data.
 * @category once
 */
export const once = (
    {
      data, 
      schema, 
      evolve = null, 
      rules = null
    }:OnceParameter):Store => {
  // complements reasonable defaults
  if (! evolve) evolve = (store, _pointer, _prevStore) => store
  const validate = S.validate(rules || S.defaultRules)

  const schemaDb = S.buildDb(schema)
  
  let updatePointer
  let baseStore = E.makeStore(data, schemaDb, validate, true)
  baseStore = E.validate("", baseStore);
  [updatePointer, baseStore] = E.endUpdateTracking(baseStore)
  let store = evolve(baseStore, updatePointer, null)
  store = E.validate("", store)
  return store
}

/**
 * 
 * @category Entries
 */
export const h = h0
