import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent, prepareToDestroy, OnCreateFunc, OnRemoveFunc, DoneFunc} from '../components'


const listItemOnCreate:Record<string,OnCreateFunc> = {
  fade: (el) => {
    el.animate([
      {opacity: 0}, 
      {opacity: 1}
    ], 200)
    el.scrollIntoView()
  }, 
  slide: (el) => {
    const r = el.getBoundingClientRect()
    el.animate([
      {offset:0, maxHeight: 0}, 
      {offset:0.999, maxHeight: ((r.height * 1.2) + 30) + 'px'}, 
      {offset:1, maxHeight:'none'}
    ], 200)
    el.scrollIntoView()
  }
}
const listItemOnRemove:Record<string,OnRemoveFunc> = {
  fade: (el, done) => {
    const anim = el.animate([
      {opacity: 1}, 
      {opacity: 0}
    ], 200)
    prepareToDestroy(el, anim, done)
  }, 
  slide: (el, done) => {
    const r = el.getBoundingClientRect()
    const anim = el.animate([
      {maxHeight: ((r.height * 1.2) + 30) + 'px'}, 
      {maxHeight: 0}
    ], 200)
    prepareToDestroy(el, anim, done)
  }
}

export type ListItemExtraProps = {}

export type ListItemAutoProps = {
  oncreate: OnCreateFunc, 
  onremove: OnRemoveFunc
}

export const playListItem = (transition:"fade"|"slide") => <OtherAttrs extends {}>(C:NodeName<ListItemAutoProps & OtherAttrs>):UnmagicalComponent<ListItemExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const attributes = props
    const attrs:ListItemAutoProps = {
      ...attributes, 
      oncreate: listItemOnCreate[transition], 
      onremove: listItemOnRemove[transition]
    }
    return h(C, attrs, ...children)
  }
}