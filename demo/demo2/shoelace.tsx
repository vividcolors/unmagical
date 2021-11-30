
import * as C from '../../src/core/components'
import {VNode} from '../../src/core/components'
import {showText} from '../../src/core/utils'
import {API, start, h} from '../../src/core/framework'
export {API, start, h} from '../../src/core/framework'
/*
const attributeMap = {
  input: {
    oninput: 'onsl-input', 
    onblur: 'onsl-blur', 
    value: 'value', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid', 
    message: 'message'
  }, 
  range: {
    oninput: 'unused-input', 
    onchange: 'onsl-change', 
    value: 'value', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid', 
    message: 'message'
  }, 
  rating: {
    oninput: 'oninput', 
    onchange: 'onsl-change', 
    value: 'value', 
    class: 'class', 
    invalidClass: '', 
    invalid: '', 
    message: ''
  }, 
  select: {
    onchange: 'onsl-change', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid', 
    value: 'value', 
    option: {
      selected: 'checked', 
      value: 'value'
    }, 
    message: 'message'
  }, 
  radio: {
    onchange: 'onsl-change', 
    checked: 'checked', 
    value: 'value', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid', 
    message: ''
  }, 
  checkbox: {
    onchange: 'onsl-change', 
    checked: 'checked', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid', 
    message: ''
  }, 
  colorpicker: {
    oninput: 'unused-input', 
    onchange: 'onsl-change', 
    value: 'value', 
    class: 'class', 
    invalidClass: '', 
    invalid: 'invalid', 
    message: ''
  }, 
  updateButton: {
    onclick: 'onclick', 
    '@nullIfHidden': false, 
    current: '', 
    class: 'class', 
    shown: 'loading', 
    shownClass: ''
  }, 
  settleButton: {
    onclick: 'onclick'
  }, 
  dialog: {
    '@nullIfHidden': false, 
    data: 'data', 
    shown: 'open', 
    shownClass: ''
  }, 
  alert: {
    '@nullIfHidden': true, 
    data: 'data'
  }, 
  drawer: {
    '@nullIfHidden': false, 
    shown: 'open', 
    shownClass: ''
  }, 
  spinner: {
    '@nullIfHidden': true, 
    current: 'value'
  }
}
*/

export type AnyAttrs = {
  [key:string]:any 
}

export const Input = C.playTextbox<{messageProps?:object}&AnyAttrs>(({invalid, message, messageProps = {}, oninput, onblur, ...props}, children) => {
  return (
    <sl-input {...props} invalid={invalid} onsl-input={oninput} onsl-blur={onblur}>
      {children}
      {(invalid && message) ? (
        <div {...messageProps} slot="help-text">{message}</div>
      ) : null}
    </sl-input>
  )
})

export const Textarea = C.playTextbox<{messageProps?:object}&AnyAttrs>(({invalid, message, messageProps = {}, oninput, onblur, ...props}, children) => {
  return (
    <sl-textarea {...props} invalid={invalid} onsl-input={oninput} onsl-blur={onblur}>
      {children}
      {(invalid && message) ? (
        <div {...messageProps} slot="help-text">{message}</div>
      ) : null}
    </sl-textarea>
  )
})

export const Range = C.playSlider<{messageProps?:object}&AnyAttrs>(({invalid, message, messageProps = {}, oninput:_unused, onchange, ...props}, children) => {
  return (
    <sl-range {...props} invalid={invalid} onsl-change={onchange}>
      {children}
      {(invalid && message) ? (
        <div {...messageProps} slot="help-text">{message}</div>
      ) : null}
    </sl-range>
  )
})

// This component behaves strangely and should not be used in production.
export const Rating = C.playSlider<AnyAttrs>(({oninput:_unused, invalid:_unused2, message:_unused3, onchange, ...props}, children) => {
  return (
    <sl-rating {...props} onsl-change={onchange}>
      {children}
    </sl-rating>
  )
})

const setValueToChildren = (value:string, cs:Array<VNode|string>):Array<VNode|string> => {
  return cs.map(o => {
    if (typeof o != 'object') return o
    const children = (o.children && o.children.length) ? setValueToChildren(value, o.children) : o.children
    if ('value' in o.attributes) {
      return {...o, selected: (o as VNode<{value:string}>).attributes.value == value, children}
    } else {
      return {...o, children}
    }
  })
}

export const Select = C.playListbox<{messageProps?:object}&AnyAttrs>(({invalid, value, message, messageProps, onchange, ...props}, children) => {
  return (
    <sl-select {...props} invalid={invalid} value={value} onsl-change={onchange}>
      {setValueToChildren(value, children)}
      {(invalid && message) ? (
        <div {...messageProps} slot="help-text">{message}</div>
      ) : null}
    </sl-select>
  )
})

export const Radio = C.playRadio<AnyAttrs>(({invalid, message:unused1, onchange, ...props}, children) => {
  return (
    <sl-radio {...props} invalid={invalid} onsl-change={onchange}>
      {children}
    </sl-radio>
  )
})

export const Checkbox = C.playCheckbox<AnyAttrs>(({invalid, message:unused1, onchange, ...props}, children) => {
  return (
    <sl-checkbox {...props} invalid={invalid} onsl-change={onchange}>
      {children}
    </sl-checkbox>
  )
})

export const Switch = C.playCheckbox<AnyAttrs>(({invalid, message:unused1, onchange, ...props}, children) => {
  return (
    <sl-switch {...props} invalid={invalid} onsl-change={onchange}>
      {children}
    </sl-switch>
  )
})

export const ColorPicker = C.playSlider<AnyAttrs>(({invalid, oninput:unused1, onchange, message:unused2, ...props}, children) => {
  return (
    <sl-color-picker {...props} invalid={invalid} onsl-change={onchange}>
      {children}
    </sl-color-picker>
  )
})

export const UpdateButton = C.compose<AnyAttrs>(C.playUpdateButton, C.playProgress(false))(({shown, ...props}, children) => {
  return (
    <sl-button {...props} loading={shown}>
      {children}
    </sl-button>
  )
})

export const UpdateIconButton = C.playUpdateButton<AnyAttrs>("sl-icon-button")


export const SettleButton = C.playSettleButton<AnyAttrs>('sl-button')

const onDialogCreate = (el:Element) => {
  el.addEventListener('sl-request-close', event => event.preventDefault());
}

export const Dialog = C.playDialog("fade", false)<{message:string, hideCancelButton?:boolean, okLabel?:string, cancelLabel?:string}&AnyAttrs>(({name, shown, message, data, hideCancelButton = false, okLabel = 'OK', cancelLabel = 'Cancel', oncreate:_unused1, onremove:_unused2, ...props}) => {
  const effectiveMessage = showText(message, data)
  return (
    <sl-dialog {...props} oncreate={onDialogCreate} open={shown}>
      {effectiveMessage}
      <SettleButton name={name} result={true} slot="footer">{okLabel}</SettleButton>
      {!hideCancelButton ? (<SettleButton name={name} result={false} slot="footer">{cancelLabel}</SettleButton>) : null}
    </sl-dialog>
  )
})

function escapeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}  
const instantiateToast = ({name, message, data, onUpdate, 'sl-duration':duration = Infinity, ...props}) => {
  let toast = null
  const effectiveMessage = showText(message, data)
  const createToast = () => {
    const alert = Object.assign(document.createElement('sl-alert'), {
      ...props, 
      duration, 
      innerHTML: `
        ${escapeHtml(effectiveMessage)}
      `
    });
    document.body.append(alert);
    // @ts-ignore; We can call toast() for sl-alert
    alert.toast();
    toast = alert
  }
  const oncreate = (el:Element) => {
    createToast()
    toast.addEventListener('sl-hide', ev => {
      onUpdate({update:'closeFeedback', context:[name]})
    })
  }
  const ondestroy = (el:Element) => {
    if (toast) {
      toast.hide()
      toast = null
    }
  }
  return [oncreate, ondestroy]
}
export const Alert = C.playFeedback("fade",true)<{'sl-duration'?:number, message:string, onUpdate:any}&AnyAttrs>(({key, shown:_unused1, ...props}) => {
  const [oncreate, ondestroy] = instantiateToast(props)
  return (
    <div key={key} oncreate={oncreate} ondestroy={ondestroy} style={{display:"none"}}></div>
  )
})

export const Drawer = C.playSwitch(false)<{onUpdate:any}&AnyAttrs>(({name, shown, onUpdate, ...props}, children) => {
  delete props.oncreate
  const onDrawerCreate = (el:Element) => {
    el.addEventListener('sl-request-close', (ev) => {
      window.requestAnimationFrame(() => onUpdate({update:'setSwitch', context:[name, false]}))
    });
  }
  return (
    <sl-drawer {...props} oncreate={onDrawerCreate} open={shown}>
      {children}
    </sl-drawer>
  )
})

export const Spinner = C.playProgress(true)<AnyAttrs>(({current, ...props}, children) => {
  return (
    <sl-spinner {...props} value={current}>
      {children}
    </sl-spinner>
  )
})