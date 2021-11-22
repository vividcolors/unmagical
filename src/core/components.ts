
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

export const compose = <A1,A2>(p1, p2) => (C, map = null) => {
  return (props, children) => (state, actions) => {
    const more = (props, children) => {
      return p1(C, map)(props, children)(state, actions)
    }
    const x = p2(more, map)(props, children)(state, actions)
    return x || p1(C, map)(props, children)(state, actions)
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

