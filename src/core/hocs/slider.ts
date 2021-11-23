
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent} from '../components'


export type SliderExtraProps = {
  path: string
}

export type SliderAutoProps = {
  'data-mg-path': string, 
  'data-mg-value-attribute': string, 
  oninput: UnmagicalAction<Event>, 
  onchange: UnmagicalAction<Event>, 
  value: string, 
  invalid: boolean, 
  message: string
}

export const playSlider = <OtherAttrs extends {}>(C:NodeName<SliderAutoProps & OtherAttrs>):UnmagicalComponent<SliderExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {path, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    const attrs:SliderAutoProps = {
      ...attributes, 
      'data-mg-path': path, 
      'data-mg-value-attribute': 'value', 
      oninput: actions.onSliderInput, 
      onchange: actions.onSliderChange, 
      value: slot.input, 
      invalid, 
      message: slot.error ? state.normalizeError(slot.error).message : ''
    } 
    return h(C, attrs, ...children)
  }
}
