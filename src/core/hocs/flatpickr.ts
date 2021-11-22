
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent, OnCreateFunc, OnDestroyFunc} from '../components'

const instantiateFlatpickr = (path:string, onchange:UnmagicalAction<{path:string,input:string}|[{path:string,input:string}]>, defaultValue:string, clearerId:string, config:object):{oncreate:OnCreateFunc,ondestroy:OnDestroyFunc} => {
  let instance = null
  return {
    oncreate: (el) => {
      const cfg = {
        ...config, 
        defaultDate: defaultValue || null
      }
      // @ts-ignore
      instance = flatpickr(el, cfg)
      instance.config.onChange.push((selectedDates, dateStr:string) => {
        onchange({path, input:dateStr})
      })
      if (clearerId) {
        const clearer = document.getElementById(clearerId)
        if (clearer) {
          clearer.onclick = instance.clear
        }
      }
    }, 
    ondestroy: (el) => {
      if (instance) {
        instance.destroy()
        instance = null
      }
    }
  }
}
export type FlatpickrExtraProps = {
  path: string, 
  clearerId: string|null, 
  config: object
}

export type FlatpickrAutoProps = {
  invalid: boolean, 
  message: string, 
  oncreate: OnCreateFunc, 
  ondestroy: OnDestroyFunc
}

export const playFlatpickr = <OtherAttrs extends {}>(C:NodeName<FlatpickrAutoProps & OtherAttrs>):NodeName<FlatpickrExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {path, clearerId = null, config = {}, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    const {oncreate, ondestroy} = instantiateFlatpickr(path, actions.onSmartControlChange, slot.input, clearerId, config)
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    const attrs:FlatpickrAutoProps = {
      ...attributes, 
      invalid, 
      message: slot.error ? state.normalizeError(slot.error).message : '', 
      oncreate, 
      ondestroy
    }
    return h(C, attrs, ...children)
  }
}