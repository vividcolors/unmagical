
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent} from '../components'


export type SettleButtonExtraProps = {
  name: string, 
  result: JSON
}

export type SettleButtonAutoProps = {
  'data-mg-name': string, 
  'data-mg-result': string, 
  onclick: UnmagicalAction<Event>
}

export const playSettleButton = <OtherAttrs extends {}>(C:NodeName<SettleButtonAutoProps & OtherAttrs>):NodeName<SettleButtonExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {name, result, ...attributes} = props
    const attrs:SettleButtonAutoProps = {
      'data-mg-name': name, 
      'data-mg-result': JSON.stringify(typeof result == "undefined" ? null : result), 
      onclick: actions.onPromiseSettle
    }
    return h(C, attrs, ...children)
  }
}
