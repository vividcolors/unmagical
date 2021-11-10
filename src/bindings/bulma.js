
import * as C from '../core/components'
import {API, start, h} from '../core/framework'
export {API, start, h} from '../core/framework'

export const Input = C.playTextbox('input', {fixedClass:'input', invalidClass:'is-danger'})

export const Textarea = C.playTextbox('textarea', {fixedClass:'textarea', invalidClass:'is-danger'})

// bulma has no range-sliders

export const Select = C.playListbox(({onchange, 'data-mg-path':dataMgPath, 'data-mg-value-attribute':dataMgValueAttribute, disabled = false, ...props}, children) => {
  return (
    <div {...props}>
      <select onchange={onchange} data-mg-path={dataMgPath} data-mg-value-attribute={dataMgValueAttribute} disabled={disabled}>
        {children}
      </select>
    </div>
  )
}, {fixedClass:'select', invalidClass:'is-danger'})

export const Radio = C.playRadio(({onchange, 'data-mg-path':dataMgPath, 'data-mg-value-attribute':dataMgValueAttribute, disabled = false, name, checked = false, value, ...props}, children) => {
  return (
    <label disabled={disabled} {...props}>
      <input type="radio" onchange={onchange} data-mg-path={dataMgPath} data-mg-value-attribute={dataMgValueAttribute} name={name} disabled={disabled} checked={checked} value={value} />
      {children}
    </label>
  )
}, {fixedClass:'radio'})

export const Checkbox = C.playCheckbox(({onchange, 'data-mg-path':dataMgPath, 'data-mg-checked-attribute':dataMgCheckedAttribute, disabled = false, checked = false, ...props}, children) => {
  return (
    <label disabled={disabled} {...props}>
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

export const Dialog = C.playDialog(({'mg-name':name, title, createMessage = null, message = null, hideCancelButton = false, okLabel = 'OK', cancelLabel = 'Cancel', data, ...props}) => {
  message = createMessage ? createMessage(data) : message
  return (
    <div key={name} {...props}>
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{title}</p>
        </header>
        <section class="modal-card-body">
          <p>{message}</p>
        </section>
        <footer class="modal-card-foot">
          <SettleButton class="button is-success" mg-name={name} mg-result={true}>{okLabel}</SettleButton>
          {! hideCancelButton ? (<SettleButton class="button" mg-name={name} mg-result={false}>{cancelLabel}</SettleButton>) : null}
        </footer>
      </div>
    </div>
  )
}, {fixedClass:'modal is-active', '@nullIfHidden':true, '@transition':'fade'})

export const Notification = C.playFeedback(({'mg-name':name, data, createMessage = null, message = null, ...props}) => {
  message = createMessage ? createMessage(data) : message
  return (
    <div key={name} {...props}>
      <DeleteButton mg-update="closeFeedback" mg-context={[name]}></DeleteButton>
      <p>{message}</p>
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