
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent, suspendRoot, resumeRoot, prepareToDestroy, OnCreateFunc, OnRemoveFunc, DoneFunc} from '../components'


export const dialogOnCreate:Record<string,OnCreateFunc> = {
  fade: (el:Element):void => {
    suspendRoot()
    el.animate([
      {opacity: 0}, 
      {opacity: 1}
    ], 200)
  }, 
  scale: (el:Element):void => {
    suspendRoot()
    el.animate([
      {transform: 'scale(0.8)'}, 
      {transform: 'scale(1)'}
    ])
  }
}
export const dialogOnRemove:Record<string,OnRemoveFunc> = {
  fade: (el:Element, done:DoneFunc):void => {
    resumeRoot()
    const anim = el.animate([
      {opacity: 1}, 
      {opacity: 0}
    ], 200)
    prepareToDestroy(el, anim, done)
  }, 
  scale: (el:Element, done:DoneFunc):void => {
    resumeRoot()
    const anim = el.animate([
      {transform: 'scale(1)'}, 
      {transform: 'scale(0.8)'}
    ], 200)
    prepareToDestroy(el, anim, done)
  }
}

export type DialogExtraProps = {
  name: string
}

export type DialogAutoProps = {
  name: string, 
  data: any, 
  oncreate: OnCreateFunc, 
  onremove: OnRemoveFunc, 
  shown: boolean
}

export const playDialog = (transition:"fade"|"scale", nullIfHidden:boolean) => <OtherAttrs extends {}>(C:NodeName<DialogAutoProps & OtherAttrs>):UnmagicalComponent<DialogExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const attributes = props
    const name = attributes.name
    const data = API.getDialog(name, state.env)
    if (nullIfHidden && data === null) return null
    const attrs:DialogAutoProps = {
      ...attributes, 
      data, 
      oncreate: dialogOnCreate[transition], 
      onremove: dialogOnRemove[transition], 
      shown: (data !== null)
    }
    return h(C, attrs, ...children)
  }
}