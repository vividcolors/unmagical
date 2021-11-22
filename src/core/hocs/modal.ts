import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent, suspendRoot, resumeRoot, prepareToDestroy, OnCreateFunc, OnRemoveFunc, DoneFunc} from '../components'
import {dialogOnCreate, dialogOnRemove} from './dialog'


export type ModalExtraProps = {
    shown: boolean
  }
  
  export type ModalAutoProps = {
    shown: boolean, 
    oncreate: OnCreateFunc, 
    onremove: OnRemoveFunc
  }
  
  export const playModal = (transition:"fade"|"scale", nullIfHidden:boolean) => <OtherAttrs extends {}>(C:NodeName<ModalAutoProps & OtherAttrs>):NodeName<ModalExtraProps & OtherAttrs> => {
    return (props, children) => (state, actions) => {
      const attributes = props
      if (! attributes.shown && nullIfHidden) return null
      const attrs:ModalAutoProps = {
        ...attributes, 
        oncreate: dialogOnCreate[transition], 
        onremove: dialogOnRemove[transition]
      }
      return h(C, attrs, ...children)
    }
  }