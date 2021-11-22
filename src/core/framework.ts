//@ts-check

import { normalizePath } from './utils'
import * as E from './env'
import * as S from './schema'
import * as X from './errors'
import { app, h as h0, VNode, ActionType, View } from 'hyperapp'
import {MgError, NormalizeError} from './errors'
import {Json, Schema, Slot, SchemaDb, Lookup, Rules} from './schema'
import {Env} from './env'

export type Validity = {invalid:boolean, error:MgError|null}

type ThenHandler = (result:any) => any
type XThenHandler = (result:any, env:Env) => any
type Update = (...args:any[]) => Env
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
/*type OnUpdateByEvent<S, A> = ActionType<Event, S, A>
type OnUpdateByCall<S, A> = ActionType<{update:string, context:any[]}, S, A>
type OnUpdate<S, A> = OnUpdateByEvent<S, A>|OnUpdateByCall<S, A>*/

export interface UnmagicalState {
  baseEnv: Env, 
  env: Env, 
  normalizeError: NormalizeError
}

export interface UnmagicalActions {
  onTextboxInput: UnmagicalAction<Event>, 
  onTextboxBlur: UnmagicalAction<Event>, 
  onSliderInput: UnmagicalAction<Event>, 
  onSliderChange: UnmagicalAction<Event>, 
  onListboxChange: UnmagicalAction<Event>, 
  onRadioChange: UnmagicalAction<Event>, 
  onCheckboxChange: UnmagicalAction<Event>, 
  onSmartControlChange: UnmagicalAction<{path:string,input:string}|[{path:string,input:string}]>, 
  onUpdate: UnmagicalAction<Event|{update:string,context:any[]}>, 
  onPromiseSettle: UnmagicalAction<Event|{name:string,result:any}>, 
  onPromiseThen: UnmagicalAction<OnPromiseThenParam>
}

export type UnmagicalAction<T> = ActionType<T, UnmagicalState, UnmagicalActions>

export interface StartParameter {
  data: Json, 
  schema: Schema, 
  view: (env:Env) => VNode, 
  containerEl: Element, 
  evolve?: (env:Env, updatePointer:string|null, prevEnv:Env|null) => Env, 
  updates?: Record<string,Update>
  rules?: Rules, 
  catalog?: Record<string,string>
}

export interface StartValue {
  onUpdate: UnmagicalAction<Event|{update:string,context:any[]}>
}

export interface OnceParameter {
  data: Json, 
  schema: Schema, 
  evolve?: (env:Env, updatePointer:string|null, prevEnv:Env|null) => Env, 
  rules?: Rules
}

/**
 * @namespace
 */
export namespace API {
  // re-export from env
  export const test = E.test
  export const extract = E.extract
  export const getSlot = E.getSlot
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
   * @param {Env} env
   * @returns {Env} 
   */
  export const touchAll = (path:string, env:Env):Env => {
    return E.mapDeep((slot, _path) => ({...slot, touched:true}), path, env)
  }

  /**
   * 
   * @param {string} path 
   * @param {Env} env
   * @returns {number} 
   */
  export const countValidationErrors = (path:string, env:Env):number => {
    return E.reduceDeep((cur, slot, _path) => {
      const d = slot.touched && slot.invalid ? 1 : 0
      return cur + d
    }, 0, path, env)
  }

  /**
   * 
   * @param {string} path 
   * @param {Env} env
   * @returns {string[]} 
   */
  export const validationErrors = (path:string, env:Env):string[] => {
    const errors:string[] = []
    E.reduceDeep((_cur, slot, path) => {
      if (slot.touched && slot.invalid) {
        errors.push(path)
      }
      return null
    }, null, path, env)
    return errors
  }

  /**
   * @param {string} path
   * @param {Env} env
   * @returns {{invalid:boolean, error:MgError|null}}
   */
  export const foldValidity = (path:string, env:Env):Validity => {
    return API.reduceDeep<Validity>((cur, slot, _path) => {
      if (cur.invalid) return cur
      if (slot.touched && slot.invalid) return {invalid:true, error:slot.error}
      return cur
    }, {invalid:false, error:null}, path, env)
  }

  /**
   * @param {number} ms
   * @param {Env} env
   * @returns {[Promise, Env]}
   */
  export const sleep = (ms:number, env:Env):[Promise<null>, Env] => {
    const p = new Promise<null>((fulfill, reject) => {
      setTimeout(() => {
        fulfill(null)
      }, ms)
    })
    return [p, env]
  }

  /**
   * @param {string} name
   * @param {string} itemPath
   * @param {string} group
   * @param {Env} env
   * @returns {[Promise, Env]}
   */
  export const startReordering = <T>(name:string, itemPath:string, group:string, env:Env):[Promise<T>, Env] => {
    const p = new Promise<T>((fulfill, reject) => {
      env = E.setExtra(name, {itemPath, group, fulfill, reject}, env)
    })
    return [p, env]
  }

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  export const endReordering = (name:string, env:Env):Env => {
    const extra = E.getExtra(name, env)
    if (! extra) return env
    return E.setExtra(name, null, env)
  }

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {string|null}
   */
  export const getReordering = (name:string, env:Env):string|null => {
    const extra = E.getExtra(name, env) as {itemPath:string}|null
    if (! extra) return null
    return extra.itemPath
  }

  /**
   * @param {string} name
   * @param {any} data
   * @param {Env} env
   * @returns {[Promise, Env]}
   */
  export const openDialog = (name:string, data:any, env:Env):[Promise<boolean>,Env] => {
    const p = new Promise<boolean>((fulfill, reject) => {
      env = E.setExtra(name, {data, fulfill, reject}, env)
    })
    return [p, env]
  }

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  export const closeDialog = (name:string, env:Env):Env => {
    const extra = E.getExtra(name, env)
    if (! extra) return env
    return E.setExtra(name, null, env)
  }

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {any|null}
   */
  export const getDialog = (name:string, env:Env):any|null => {
    const extra = E.getExtra(name, env) as DialogState|null
    if (! extra) return null
    return extra.data
  }

  /**
   * @param {string} name
   * @param {any} data
   * @param {Env} env
   * @returns {Env}
   */
  export const openFeedback = (name:string, data:any, env:Env):Env => {
    return E.setExtra(name, data, env)
  }

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  export const closeFeedback = (name:string, env:Env):Env => {
    const extra = E.getExtra(name, env)
    if (! extra) return env
    return E.setExtra(name, null, env)
  }

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {any|null}
   */
  export const getFeedback = (name:string, env:Env):any|null => {
    return E.getExtra(name, env)
  }

  /**
   * @param {string} name
   * @param {number} current
   * @param {Env} env
   * @returns {Env}
   */
  export const setPage = (name:string, current:number, env:Env):Env => {
    return E.setExtra(name, current, env)
  }

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {number}
   */
  export const getPage = (name:string, env:Env):number => {
    const extra = E.getExtra(name, env) as number|null
    return (extra !== null) ? extra : 0
  }

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  export const nextPage = (name:string, env:Env):Env => {
    const extra = E.getExtra(name, env) as number|null
    const current = (extra !== null) ? extra : 0
    return E.setExtra(name, current + 1, env)
  }

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  export const prevPage = (name:string, env:Env):Env => {
    const extra = E.getExtra(name, env) as number|null
    const current = (extra !== null) ? extra : 0
    return E.setExtra(name, current - 1, env)
  }

  /**
   * @param {string} name
   * @param {boolean} shown
   * @param {Env} env
   * @returns {Env}
   */
  export const setSwitch = (name:string, shown:boolean, env:Env):Env => {
    return E.setExtra(name, shown, env)
  }

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {boolean}
   */
  export const getSwitch = (name:string, env:Env):boolean => {
    const extra = E.getExtra(name, env) as boolean|null
    return (extra !== null) ? extra : false
  }

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  export const toggleSwitch = (name:string, env:Env):Env => {
    const extra = E.getExtra(name, env) as boolean|null
    const current = (extra !== null) ? extra : false
    return E.setExtra(name, !current, env)
  }

  /*
   * TODO: progress bar, ReadStream, ...
   */
  /**
   * @param {string} name
   * @param {any} unknown
   * @param {Env} env
   * @returns {Env}
   */
  export const openProgress = (name:string, unknown:any, env:Env):Env => {
    return E.setExtra(name, {current:-1}, env)
  }

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {Env}
   */
  export const closeProgress = (name:string, env:Env):Env => {
    return E.setExtra(name, null, env)
  }

  /**
   * @param {string} name
   * @param {Env} env
   * @returns {number|null}
   */
  export const getProgress = (name:string, env:Env):number|null => {
    const extra = E.getExtra(name, env) as {current:number}|null
    if (! extra) return null
    return extra.current
  }
  
  /**
   * @param {string} name 
   * @param {string} fromPath 
   * @param {string} group
   * @param {Env} env
   * @returns {Env|Promise}
   */
  export const reorder = (name:string, fromPath:string, group:string, env:Env):Env|Promise<{path:string}> => {
    const {enter, leave} = API.makePortal(env)
    return leave(API.startReordering<{path:string}>(name, fromPath, group, env))
    .then(enter(({path}, env) => {
      env = API.endReordering(name, env)
      return API.move(fromPath, path, env)
    }))
  }

  /**
   * @param {Env} env
   */
  export const makePortal = (env:Env) => {
    return {
      /**
       * @param {(result:any, env:Env) => any} handler
       * @returns {(result:any) => any}
       */
      enter: (handler:XThenHandler):ThenHandler => {  // Our customized handler :: [result, env] => ...
        return (result) => {  // This is the actual, standard promise handler
          let result1 = null  // We will get the result in this variable.
          const ret = (res1) => {result1 = res1}
          (env.onPromiseThen as UnmagicalAction<OnPromiseThenParam>)({result, handler, ret})  // enter into hyperapp. Its result is undefined.
          return result1
        }
      }, 
      /**
       * @param {[(Promise|Error), Env] | (Promise|Error)} x
       * @param {Env} [y]
       * @returns {Promise|Error}
       */
      leave: <T>(x:[T, Env]|T, y?:Env):T => {
        const p = Array.isArray(x) ? x[0] : x
        const env = Array.isArray(x) ? x[1] : y
        if (! E.isEnv(env)) throw new Error('exit/1: env required')
        E.doReturn(env)
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
 * @param {Object} params
 * @param {Json} params.data
 * @param {Schema} params.schema
 * @param {(env:Env) => import('hyperapp').VNode} params.view
 * @param {Element} params.containerEl
 * @param {((env:Env, updatePointer:string, prevEnv:Env|null) => Env) | null} params.evolve
 * @param {{[name:string]:(any)}} params.updates
 * @param {Rules} params.rules
 * @param {Record<string,string>} params.catalog
 */
export const start = (
    {
      data, 
      schema, 
      view, 
      containerEl, 
      evolve = null, 
      updates = {}, 
      rules = null, 
      catalog = null
    }:StartParameter):StartValue => {
  // complements reasonable defaults
  if (! evolve) evolve = (env, _pointer, _prevEnv) => env
  const validate = S.validate(rules || S.defaultRules)
  const coerce = S.coerce
  const normalizeError = X.normalizeError(catalog || X.defaultErrorMessages)

  const schemaDb = S.buildDb(schema)

  const actions0 = {
    onTextboxInput: (ev:Event) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const path = (ev.currentTarget as HTMLElement).dataset.mgPath
      const value = ev.currentTarget[(ev.currentTarget as HTMLElement).dataset.mgValueAttribute]
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
    onTextboxBlur: (ev:Event) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const path = (ev.currentTarget as HTMLElement).dataset.mgPath
      const value = ev.currentTarget[(ev.currentTarget as HTMLElement).dataset.mgValueAttribute]
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
    onSliderInput: (ev:Event) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const path = (ev.currentTarget as HTMLElement).dataset.mgPath
      const value = ev.currentTarget[(ev.currentTarget as HTMLElement).dataset.mgValueAttribute]
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
    onSliderChange: (ev:Event) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const path = (ev.currentTarget as HTMLElement).dataset.mgPath
      const value = ev.currentTarget[(ev.currentTarget as HTMLElement).dataset.mgValueAttribute]
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
    onListboxChange: (ev:Event) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const path = (ev.currentTarget as HTMLElement).dataset.mgPath
      const value = ev.currentTarget[(ev.currentTarget as HTMLElement).dataset.mgValueAttribute]
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
    onRadioChange: (ev:Event) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const path = (ev.currentTarget as HTMLElement).dataset.mgPath
      const value = ev.currentTarget[(ev.currentTarget as HTMLElement).dataset.mgValueAttribute]
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
    onCheckboxChange: (ev:Event) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const path = (ev.currentTarget as HTMLElement).dataset.mgPath
      const checked = ev.currentTarget[(ev.currentTarget as HTMLElement).dataset.mgCheckedAttribute]
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
    onSmartControlChange: (pair:{path:string,input:string}|[{path:string,input:string}]) => (state:UnmagicalState, actions:UnmagicalActions) => {
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
    onUpdate: (ev:Event|{update:string,context:any[]}) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const update = ('currentTarget' in ev) ? (ev.currentTarget as HTMLElement).dataset.mgUpdate : ev.update
      const context = ('currentTarget' in ev) ? JSON.parse((ev.currentTarget as HTMLElement).dataset.mgContext || "null") : ev.context
      let updatePointer:string
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setPortal((env0) => {baseEnv = env0}, actions.onPromiseThen, baseEnv)
      const func = updates[update] || updateEnabledApis[update]
      if (! func) throw new Error('onUpdate/0: no update or unknown update')
      if (! Array.isArray(context)) throw new Error('onUpdate/1: parameter must be an array')
      if (context.length + 1 != func.length) throw new Error('onUpdate/2: bad number of parameters')
      const res = func.apply(null, [...context, baseEnv])
      baseEnv = E.setPortal(null, null, E.isEnv(res) ? res : baseEnv)
      baseEnv = E.validate("", baseEnv);
      [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
      let env = state.env
      if (! E.isSame(state.baseEnv, baseEnv)) {
        env = evolve(baseEnv, updatePointer, env)
        env = E.validate("", env)
      }
      return {...state, baseEnv, env}
    }, 
    onPromiseSettle: (ev:Event|{name:string,result:any}) => (state:UnmagicalState, actions:UnmagicalActions) => {
      const name = ('currentTarget' in ev) ? (ev.currentTarget as HTMLElement).dataset.mgName : ev.name
      const result = ('currentTarget' in ev) ? JSON.parse((ev.currentTarget as HTMLElement).dataset.mgResult || "null") : ev.result
      const extra = E.getExtra(name, state.baseEnv) as DialogState
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
      let baseEnv = E.beginUpdateTracking(state.baseEnv)
      baseEnv = E.setPortal((env0) => {baseEnv = env0}, actions.onPromiseThen, baseEnv)
      const res = context.handler(context.result, baseEnv)
      baseEnv = E.setPortal(null, null, E.isEnv(res) ? res : baseEnv)
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

  let updatePointer:string
  let baseEnv = E.makeEnv(data, schemaDb, validate, true)
  baseEnv = E.validate("", baseEnv);
  [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
  let env = evolve(baseEnv, updatePointer, null)
  env = E.validate("", env)
  const state:UnmagicalState = {
    baseEnv, 
    env, 
    normalizeError
  }
  const view1:View<UnmagicalState, UnmagicalActions> = (state, actions) => view(state.env)
  const actions = app(state, actions0, view1, containerEl)
  return {
    onUpdate: actions.onUpdate, 
  }
}

/**
 * @param {Object} params
 * @param {Json} params.data
 * @param {Schema} params.schema
 * @param {((env:Env, updatePointer:string, prevEnv:Env|null) => Env) | null} params.evolve
 * @param {Rules} params.rules
 */
export const once = (
    {
      data, 
      schema, 
      evolve = null, 
      rules = null
    }:OnceParameter):Env => {
  // complements reasonable defaults
  if (! evolve) evolve = (env, _pointer, _prevEnv) => env
  const validate = S.validate(rules || S.defaultRules)

  const schemaDb = S.buildDb(schema)
  
  let updatePointer
  let baseEnv = E.makeEnv(data, schemaDb, validate, true)
  baseEnv = E.validate("", baseEnv);
  [updatePointer, baseEnv] = E.endUpdateTracking(baseEnv)
  let env = evolve(baseEnv, updatePointer, null)
  env = E.validate("", env)
  return env
}

export const h = h0