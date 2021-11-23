
import { API, h, UnmagicalState, UnmagicalActions, UnmagicalAction } from './framework'
export { API, h, UnmagicalState, UnmagicalActions, UnmagicalAction } from './framework'
import * as X from './errors'
import {VNode, Component, Children} from 'hyperapp'
import { dialogOnCreate } from './hocs/dialog'
export {VNode, Component, Children} from 'hyperapp'

export type DoneFunc = () => void
export type OnCreateFunc = (el:Element) => void
export type OnRemoveFunc = (el:Element, done:DoneFunc) => void
export type OnDestroyFunc = (el:Element) => void

export type UnmagicalComponent<A> = Component<A,UnmagicalState,UnmagicalActions>
export type NodeName<A> = UnmagicalComponent<A> | string
export type Hoc<A> = (c:NodeName<A>) => UnmagicalComponent<A>


export const suspendRoot = () => {
  const rootEl = document.documentElement
  const c = +rootEl.dataset.mgSuspendCount
  if (!c || c < 1) {
    rootEl.dataset.mgSuspendCount = "" + 1
    rootEl.style.overflow = "hidden"
  } else {
    rootEl.dataset.mgSuspendCount = "" + (c - 1)
  }
}

export const resumeRoot = () => {
  const rootEl = document.documentElement
  const c = +rootEl.dataset.mgSuspendCount
  if (c <= 1) {
    delete rootEl.dataset.mgSuspendCount
    rootEl.style.overflow = null
  } else {
    rootEl.dataset.mgSuspendCount = "" + (c + 1)
  }
}

export const prepareToDestroy = (el:Element, anim:Animation, done:DoneFunc) => {
  const tid = setTimeout(() => {
    done()
    anim.onfinish = null
  }, 800)
  anim.onfinish = () => {
    done()
    clearTimeout(tid)
  }
}

export const compose = <Attrs>(p1:Hoc<Attrs>, p2:Hoc<Attrs>):Hoc<Attrs> => (C) => {
  return (props, children) => (state, actions) => {
    const more = (props, children) => {
      const i = p1(C)(props, children)
      return (typeof i == 'function') ? i(state, actions) : i
    }
    const i = p2(more)(props, children)
    const x = (typeof i == 'function') ? i(state, actions) : i
    if (x) return x
    const i2 = p1(C)(props, children)
    return (typeof i == 'function') ? i(state, actions) : i
  }
}

export const addClass = (attributes, attr, clazz) => {
  if (! clazz) return
  if (! attributes.hasOwnProperty(attr)) attributes[attr] = ''
  attributes[attr] += ' ' + clazz
}




/*
The following code is left as it may be used in the future.

export const playSmartControl = (C, map = {}) => {
  map = {...defaultAttributeMap.smartControl, ...map}
  return (props, children) => (state, actions) => {
    const {...attributes} = props
    const path = props['mg-path']
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    attributes[map.onchange] = actions.onSmartControlChange
    addAttr(attributes, map.value, slot.input)
    addClass(attributes, map.class, map.fixedClass)
    return h(C, attributes, ...children)
  }
}
*/

