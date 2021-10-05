
import * as C from '../src/components'
import {API, start, h} from '../src/framework'
export {API, start, h} from '../src/framework'

const bindingMap = {
  textbox: {
    oninput: 'oninput', 
    onblur: 'onblur', 
    value: 'value', 
    class: 'class', 
    invalidClass: 'is-danger', 
    invalid: 'data-mg-invalid'
  }, 
  listbox: {
    onchange: 'onchange', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: 'data-mg-invalid'
  }, 
  option: {
    selected: 'selected', 
    value: 'value'
  }, 
  radio: {
    onchange: 'onchange', 
    checked: 'checked', 
    value: 'value', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: 'data-mg-invalid'
  }, 
  checkbox: {
    onchange: 'onchange', 
    checked: 'checked', 
    class: 'class', 
    invalidClass: 'mg-invalid', 
    invalid: 'data-mg-invalid'
  }, 
  button: {
    onclick: 'onclick', 
    update: 'data-mg-update', 
    context: 'data-mg-context', 
    name: 'data-mg-name', 
    result: 'data-mg-result'
  }, 
  dialog: {
    message: 'message', 
    fulfill: 'fulfill', 
    reject: 'reject'
  }, 
  feedback: {
    message: 'message', 
    fulfill: 'fulfill', 
    reject: 'reject'
  }
}

export const Textbox = C.Textbox
export const Listbox = C.Listbox
export const Radio = C.Radio
export const Checkbox = C.Checkbox
export const Button = C.Button

export const Field = ({path, env, ...props}, children) => {
  console.log('Field', path, env)
  if (! API.test(path, env)) return null
  const slot = API.getSlot(path, env)
  const invalid = slot.touched && slot.invalid
  return (
    <div {...props}>
      {children}
      {invalid && slot.message ? (
        <p class="help is-danger">{slot.message}</p>
      ) : null}
    </div>
  )
}

/**
 * Bulma doesn't have Loader/Spinner, then we define simple one.
 */
export const Loader = C.playLoader((props) => {
  return (
    <div style={{position:"fixed",top:0,right:0,bottom:0,left:0,backgroundColor:'#000000',opacity:0.5}}>
      <div style={{color:"#FFFFFF"}}>Loading...</div>
    </div>
  )
})

export const Dialog = C.playDialog(({'mg-name':name, message, ...props}) => {
  return (
    <div {...props}>
      <div class="modal-background"></div>
      <div class="modal-card">
        <section class="modal-card-body">
          <p>{message}</p>
        </section>
        <footer class="modal-card-foot">
          <Button class="button is-success" mg-name={name} mg-result={true}>OK</Button>
          <Button class="button" mg-name={name} mg-result={false}>キャンセル</Button>
        </footer>
      </div>
    </div>
  )
})

export const Feedback = C.playFeedback(({'mg-name':name, message, ...props}) => {
  return (
    <div {...props}>
      <Button class="delete" mg-name={name} mg-result={true}></Button>
      <p>{message}</p>
    </div>
  )
})

/*
export const Field = ({path, label, env}, children) => {
  if (! API.test(path, env)) return null
  const slot = API.getSlot(path, env)
  const invalid = slot.touched && slot.invalid
  return (
    <div class={`mg-Field ${invalid ? 'mg-invalid' : ''}`} key={path}>
      {label ? (
        <div class="mg--header"><span class="mg--label">{label}</span></div>
      ) : null}
      <div class="mg--body">
        {children}
      </div>
      {invalid ? (
        <span class="mg--message">{slot.message}</span>
      ) : null}
    </div>
  )
}

export const InputGroup = ({class:clazz, ...props}, children) => {
  return (
    <div class={`mg-InputGroup ${clazz || ''}`}>
      <div class="mg--inner">
        {children}
      </div>
    </div>
  )
}

export const InputRadio = C.playRadio

export const Radio = ({path, name, value, label, disabled = false}) => {
  return (
    <label>
      {C.playRadio()}
      <CRadio type="radio" mg-path={path} name={name} value={value} disabled={disabled} />
      <span>{label}</span>
    </label>
  )
}

export const Checkbox = C.playCheckbox(({path, label, disabled = false}) => {
  return (
    <label>
      <CCheckbox type="checkbox" mg-role="checkbox" mg-path={path} disabled={disabled} />
      <span>{label}</span>
    </label>
  )
})

export const Loader = C.playLoader((props) => {
  return (
    <div class="loader">
      Loading...
    </div>
  )
})

export const Dialog = C.playDialog((props) => {
  return (
    <div class="dialog">
      <p>{props.message}</p>
      <C.Button mg-name={props['mg-name']} mg-result={false}>キャンセル</C.Button>
      <Button mg-name={props['mg-name']} mg-result={true}>OK</Button>
    </div>
  )
})

export const Feedback = C.playFeedback((props) => {
  return (
    <div class="feedback">
      <p>{props.message}</p>
      <Button mg-name={props['mg-name']} mg-result={true}>閉じる</Button>
    </div>
  )
})
*/