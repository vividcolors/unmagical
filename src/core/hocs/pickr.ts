
import {UnmagicalAction, UnmagicalState, UnmagicalActions, API} from '../framework'
import {NodeName, Children, h, UnmagicalComponent, OnCreateFunc, OnDestroyFunc} from '../components'

const instantiatePickr = (path:string, onchange:UnmagicalAction<{path:string,input:string}|[{path:string,input:string}]>, defaultValue:string, clearerId:string, options:object):{oncreate:OnCreateFunc, ondestroy:OnDestroyFunc} => {
  let instance = null
  return {
    oncreate: (el) => {
      const opts = {
        ...options, 
        useAsButton: true, 
        default: defaultValue || null, 
        el
      }
      // @ts-ignore
      instance = Pickr.create(opts)
      instance.on('clear', () => {
        onchange({path, input:''})
      }).on('save', (color) => {
        const input = color ? color.toHEXA().toString() : null
        instance.hide()
        onchange({path, input})
      })
      if (clearerId) {
        const clearer = document.getElementById(clearerId)
        if (clearer) {
          clearer.onclick = (ev) => {
            instance.setColor(null)
          }
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

export type PickrExtraProps = {
  path: string, 
  clearerId: string, 
  options: object
}

export type PickrAutoProps = {
  value: string, 
  invalid: boolean, 
  message: string, 
  oncreate: OnCreateFunc, 
  ondestroy: OnDestroyFunc
}

export const playPickr = <OtherAttrs extends {}>(C:NodeName<PickrAutoProps & OtherAttrs>):NodeName<PickrExtraProps & OtherAttrs> => {
  return (props, children) => (state, actions) => {
    const {path, clearerId = null, options = {}, ...attributes} = props
    const slot = API.getSlot(path, state.env)
    if (! slot) return null
    const {oncreate, ondestroy} = instantiatePickr(path, actions.onSmartControlChange, slot.input, clearerId, options)
    const invalid = ((slot.touched || false) && (slot.invalid || false))
    const attrs:PickrAutoProps = {
      value: slot.input, 
      invalid, 
      message: slot.error ? state.normalizeError(slot.error).message : '', 
      oncreate, 
      ondestroy
    }
    return h(C, attrs, ...children)
  }
}
