
import {Json} from '../schema'
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent} from '../components'


export type SettleButtonExtraProps = {
  name: string, 
  result: Json
}

export type SettleButtonAutoProps = {
  'data-mg-name': string, 
  'data-mg-result': string, 
  onclick: UnmagicalAction<Event>
}

export const playSettleButton = <OtherAttrs extends {}>(C:NodeName<SettleButtonAutoProps & OtherAttrs>):UnmagicalComponent<SettleButtonExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {name, result, ...attributes} = props
    const attrs:SettleButtonAutoProps = {
      ...attributes, 
      'data-mg-name': name, 
      'data-mg-result': JSON.stringify(typeof result == "undefined" ? null : result), 
      onclick: actions.onPromiseSettle
    }
    return h(C, attrs, ...children)
  }
}
