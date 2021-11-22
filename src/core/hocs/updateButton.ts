
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent} from '../components'


export type UpdateButtonExtraProps = {
  update: string, 
  context: JSON
}

export type UpdateButtonAutoProps = {
  'data-mg-update': string, 
  'data-mg-context': string, 
  onclick: UnmagicalAction<Event>
}

export const playUpdateButton = <OtherAttrs extends {}>(C:NodeName<UpdateButtonAutoProps & OtherAttrs>):NodeName<UpdateButtonExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {update, context, ...attributes} = props
    const attrs:UpdateButtonAutoProps = {
      ...attributes, 
      'data-mg-update': update, 
      'data-mg-context': JSON.stringify(typeof context == "undefined" ? null : context), 
      onclick: actions.onUpdate
    }
    return h(C, attrs, ...children)
  }
}
