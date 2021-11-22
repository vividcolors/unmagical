
import template from 'string-template'
import {VNode} from 'hyperapp'
export {API, start, h} from '../core/framework'

import {playTextbox} from '../core/hocs/textbox'

export const Input = playTextbox(({invalid, message, ...props}) => {
  let clazz = ('class' in props) ? props['class'] : ''
  clazz += " input"
  if (invalid) clazz += " is-danger"
  return (
    <input {...props} class={clazz} />
  )
})

const foo = () => {
  return (
    <Input aria-label="foo" path="/abc" class="abc" />
  )
}

export const Textarea = playTextbox(({invalid, message,...props}) => {
  let clazz = ('class' in props) ? props['class'] : ''
  clazz + " textarea"
  if (invalid) clazz += " is-danger"
  return (
    <textarea {...props} class={clazz}></textarea>
  )
})

// bulma has no range-sliders

import {playListbox} from '../core/hocs/listbox'

interface SelectAttrs {
  class?: string, 
  disabled?: boolean, 
  inputProps?: object
}

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

export const Select = playListbox<SelectAttrs>(({onchange, 'data-mg-path':dataMgPath, 'data-mg-value-attribute':dataMgValueAttribute, value, disabled = false, class:clazz = '', inputProps = {}, ...props}, children) => {
  clazz += " select"
  if (props.invalid) clazz += " is-danger"
  return (
    <div {...props}>
      <select {...inputProps} onchange={onchange} data-mg-path={dataMgPath} data-mg-value-attribute={dataMgValueAttribute} disabled={disabled}>
        {setValueToChildren(value, children)}
      </select>
    </div>
  )
})

import {playRadio} from '../core/hocs/radio'

interface RadioAttrs {
  name?: string, 
  disabled?: boolean, 
  class?: string, 
  inputProps?: object
}

export const Radio = playRadio<RadioAttrs>(({onchange, 'data-mg-path':dataMgPath, 'data-mg-value-attribute':dataMgValueAttribute, disabled = false, name, checked = false, value, class:clazz = '', invalid, inputProps = {}, ...props}, children) => {
  clazz += ' radio'
  return (
    <label {...props} disabled={disabled}>
      <input {...inputProps} type="radio" onchange={onchange} data-mg-path={dataMgPath} data-mg-value-attribute={dataMgValueAttribute} name={name} disabled={disabled} checked={checked} value={value} />
      {children}
    </label>
  )
})

import {playCheckbox} from '../core/hocs/checkbox'

interface CheckboxAttrs {
  disabled?: boolean, 
  inputProps?: object
}

export const Checkbox = playCheckbox<CheckboxAttrs>(({onchange, 'data-mg-path':dataMgPath, 'data-mg-checked-attribute':dataMgCheckedAttribute, disabled = false, checked = false, inputProps ...props}, children) => {
  return (
    <label {...props} disabled={disabled}>
      <input type="checkbox" onchange={onchange} data-mg-path={dataMgPath} data-mg-checked-attribute={dataMgCheckedAttribute} disabled={disabled} checked={checked} />
      {children}
    </label>
  )
})

export const Field = C.playField(({invalid, message, label = '', ...props}, children) => {
  return (
    <div {...props}>
      {label ? (<label class="label">{label}</label>) : null}
      {children}
      {invalid && message ? (
        <p class="help is-danger">{message}</p>
      ) : null}
    </div>
  )
}, {fixedClass:'field'})

export const UpdateButton = C.compose(C.playUpdateButton, C.playProgress)("button", {fixedClass:'button', shownClass:'is-loading'})

export const SettleButton = C.playSettleButton('button', {fixedClass:'button'})

export const DeleteButton = C.playUpdateButton("button", {fixedClass:"delete"})

export const Clickable = C.playUpdateButton("a")

export const Dialog = C.playDialog(({'mg-name':name, title, message, hideCancelButton = false, okLabel = 'OK', cancelLabel = 'Cancel', data, ...props}) => {
  const effectiveMessage = template(message, data)
  return (
    <div key={name} {...props}>
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{title}</p>
        </header>
        <section class="modal-card-body">
          <p>{effectiveMessage}</p>
        </section>
        <footer class="modal-card-foot">
          <SettleButton class="button is-success" mg-name={name} mg-result={true}>{okLabel}</SettleButton>
          {! hideCancelButton ? (<SettleButton class="button" mg-name={name} mg-result={false}>{cancelLabel}</SettleButton>) : null}
        </footer>
      </div>
    </div>
  )
}, {fixedClass:'modal is-active', '@nullIfHidden':true, '@transition':'fade'})

export const Notification = C.playFeedback(({'mg-name':name, data, message, ...props}) => {
  const effectiveMessage = template(message, data)
  return (
    <div key={name} {...props}>
      <DeleteButton mg-update="closeFeedback" mg-context={[name]}></DeleteButton>
      <p>{effectiveMessage}</p>
    </div>
  )
}, {fixedClass:'notification', '@nullIfHidden': true, '@transition':'slide'})

export const Progress = C.playProgress(({value, ...props}) => {
  return (
    <progress class={clazz} {...props}>indeterminated</progress>
  )
}, {fixedClass:'progress', '@nullIfHidden': true, current: 'value'})

export const Modal = C.playModal((props, children) => {
  return (
    <div {...props}>
      <div class="modal-background"></div>
      {children}
    </div>
  )
}, {fixedClass:'modal is-active'})

const defaultShow = (n) => n
export const Pagination = C.playPagination(({page, prev, next, first, last, siblings, show = defaultShow, prevLabel = 'Previous', nextLabel = 'Next', 'mg-list-path':listPath, loadItemsOptions, ...props}) => {
  return (
    <nav class="pagination" role="navigation" aria-label="pagination">
      <Clickable class="pagination-previous" mg-update="loadItems" mg-context={[listPath, {...loadItemsOptions, page:prev}]} disabled={! prev}>{prevLabel}</Clickable>
      <Clickable class="pagination-next" mg-update="loadItems" mg-context={[listPath, {...loadItemsOptions, page:next}]} disabled={! next}>{nextLabel}</Clickable>
      <ul class="pagination-list">
        {first ? (<li><Clickable class="pagination-link" mg-update="loadItems" mg-context={[listPath, {...loadItemsOptions, page:first}]}>{show(first)}</Clickable></li>) : null}
        {first ? (<li><span class="pagination-ellipsis">&hellip;</span></li>) : null}
        {siblings.map(pno => (<li><Clickable class={`pagination-link ${pno == page ? 'is-current' : ''}`} mg-update="loadItems" mg-context={[listPath, {...loadItemsOptions, page:pno}]}>{show(pno)}</Clickable></li>))}
        {last ? (<li><span class="pagination-ellipsis">&hellip;</span></li>) : null}
        {last ? (<li><Clickable class="pagination-link" mg-update="loadItems" mg-context={[listPath, {...loadItemsOptions, page:last}]}>{show(last)}</Clickable></li>) : null}
      </ul>
    </nav>
  )
}, {current:'page'})

export const DatePicker = C.playFlatpickr("input", {fixedClass:'input', invalidClass:'is-danger'})

export const ColorPicker = C.playPickr(({value, iconClass = 'material-icons', iconText = 'palette', ...props}) => {
  return (
    <button {...props}>
      <span class="icon"><i class={iconClass} style={{color:value}}>{iconText}</i></span>
    </button>
  )
}, {fixedClass:'button', invalidClass:'is-danger'})

export const ReorderableMenuList = C.playSortable(({itemPath = null, group = null, showItem = null, items = null, ...props}, children) => {
  return (
    <ul {...props}>
      {(showItem && items) ? (
        items.map((item, index) => showItem(item, index, itemPath, group))
      ) : (
        children
      )}
    </ul>
  )
}, {})
*/