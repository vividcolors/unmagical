
import * as C from '../src/components'
import {API, start, h} from '../src/framework'
export {API, start, h} from '../src/framework'

const attributeMap = {
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
    invalidClass: 'is-danger', 
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
    message: 'message'
  }, 
  feedback: {
    message: 'message'
  }
}

export const Textbox = C.playTextbox('input', attributeMap)
export const Listbox = C.playListbox('select', attributeMap)
export const Radio = C.playRadio('input', attributeMap)
export const Checkbox = C.playCheckbox('input', attributeMap)
export const Button = C.playButton('button', attributeMap)

export const Field = ({path, env, ...props}, children) => {
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

const fadeIn = (el) => {
  C.suspendRoot()
  el.animate([
    {opacity: 0}, 
    {opacity: 1}
  ], 200)
}

const fadeOut = (el, done) => {
  C.resumeRoot()
  const anim = el.animate([
    {opacity: 1}, 
    {opacity: 0}
  ], 200)
  C.prepareToDestroy(el, anim, done)
}

/**
 * Bulma doesn't have Loader/Spinner, then we define simple one.
 */
export const Loader = C.playLoader(({'mg-name':name, ...props}) => {
  const style = {
    position:"fixed",
    boxSizing: 'border-box', 
    top:0,
    right: 0, 
    bottom:0,
    left:0,
    backgroundColor:'rgba(0,0,0,0.5)'
  }
  return (
    <div key={name} style={style} {...props} oncreate={fadeIn} onremove={fadeOut}>
      <div style={{color:"#FFFFFF"}}>Loading...</div>
    </div>
  )
}, attributeMap)

export const Dialog = C.playDialog(({'mg-name':name, class:clazz = '', message, ...props}) => {
  clazz += ' modal is-active'
  return (
    <div class={clazz} key={name} {...props} oncreate={fadeIn} onremove={fadeOut}>
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
}, attributeMap)

export const Feedback = C.playFeedback(({'mg-name':name, message, class:clazz = '', ...props}) => {
  // add simple layout
  const style = {
    boxSizing: 'border-box', 
    opacity: 1, 
    position: 'fixed', 
    right: '10px', 
    bottom: '10px'
  }
  clazz += ' notification is-primary'
  return (
    <div class={clazz} key={name} style={style} {...props} oncreate={fadeIn} onremove={fadeOut}>
      <Button class="delete" mg-name={name} mg-result={true}></Button>
      <p>{message}</p>
    </div>
  )
}, attributeMap)
