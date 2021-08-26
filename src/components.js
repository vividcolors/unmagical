
import {h} from 'hyperapp'
import * as E from '/env'
import {start, render, addComponent} from './framework'
import {range} from 'ramda'

// props = {path?}
addComponent('TextInput', ([_tag, props], env, actions) => {
  const path = props.hasOwnProperty('path') ? props.path : '0'
  const slot = E.gets(path, env)
  const invalid = !(slot.disabled || false) && (slot.touched || false) && (slot.invalid || false)
  return (
    <input type="text" class={`mg-TextInput ${invalid ? 'mg-invalid' : ''}`} oninput={actions.onTextInput} onblur={actions.onTextBlur} data-path={E.makePath(path, env)} value={slot.input || ''} disabled={slot.disabled || false} />
  )
})

// props = {path?, name, value, label, testOptions}
// testOptionsを真にすると、optionsメタを使って当部品のenabilityを判断するようになる。
addComponent('Radio', ([_tag, props], env, actions) => {
  const path = props.hasOwnProperty('path') ? props.path : '0'
  const epath = E.makePath(path, env)
  const slot = E.gets(path, env)
  let disabled = slot.disabled || false
  if (!disabled && props.hasOwnProperty('testOptions') && props.testOptions) {
    disabled = (slot.options || []).indexOf(props.value) == -1
  }
  const invalid = !disabled && (slot.touched || false) && (slot.invalid || false)
  return (
    <label>
      <input type="radio" class={`mg-Radio ${invalid ? 'mg-invalid' : ''}`} name={props.name} onchange={actions.onSelectionChange} value={props.value} checked={(slot.input || '') == props.value} disabled={disabled} data-path={epath} />
      <span>{props.label}</span>
    </label>
  )
})

// props = {path?, label}
addComponent('Checkbox', ([_tag, props], env, actions) => {
  const path = props.hasOwnProperty('path') ? props.path : '0'
  const slot = E.gets(path, env)
  const invalid = !(slot.disabled || false) && (slot.touched || false) && (slot.invalid || false)
  return (
    <label>
      <input type="checkbox" class={`mg-Checkbox ${invalid ? 'mg-invalid' : ''}`} onchange={actions.onToggleChange} checked={slot['@value'] || false} data-path={E.makePath(path, env)} disabled={slot.disabled || false} />
      <span>{props.label}</span>
    </label>
  )
})

// props = {path, label?}
addComponent('Field', ([_tag, props, ...children], env, actions) => {
  const env2 = E.goTo(props.path, env)
  const slot = E.gets('0', env2)
  if (slot.disabled) return null
  const invalid = slot.touched && slot.invalid
  return (
    <div class={`mg-Field ${invalid ? 'mg-invalid' : ''}`}>
      {props.label ? (
        <label>{props.label}</label>
      ) : null}
      <div class="qp--body">
        {children.map(c => render(c, env2, actions))}
      </div>
      {invalid ? (
        <span class="qp--message">{slot.message}</span>
      ) : null}
    </div>
  )
})

// TODO disabled, invalid, message, etc.
// props = {path, astbody?}
addComponent('List', ([_tag, props, child], env, actions) => {
  env = E.goTo(props.path, env)
  const length = E.length('0', env)
  const astbody = props.hasOwnProperty('astbody') ? props.astbody : false
  if (astbody) {
    return (
      <tbody class="qp-List">
        {range(0, length).map(i => render(child, E.goTo('0/' + i, env), actions))}
      </tbody>
    )
  } else {
    return (
      <ul class="qp-List">
        {range(0, length).map(i => render(child, E.goTo('0/' + i, env), actions))}
      </ul>
    )
  }
})

// TODO disabledにしたいときにどうするか
// props = {label, actions}
//   actions = [action, ...]
//   action = {name, [paramName]:paramValue, ...}
addComponent('ActionButton', ([_tag, props], env, actions) => {
  const dataProps = {'data-actionlength':props.actions.length}
  for (let i = 0; i < props.actions.length; i++) {
    const spec = props.actions[i]
    for (let p in spec) {
      // TODO pathだけ動的に解決するのはどうか。fromだったら解決しないのか
      if (p == 'path') {
        dataProps[`data-action${i}${p}`] = E.makePath(spec[p], env)
      } else {
        dataProps[`data-action${i}${p}`] = spec[p]
      }
    }
  }
  return (
    <button type="button" onclick={actions.onExecute} {...dataProps}>{props.label}</button>
  )
})

// props = {path?}
addComponent('Text', ([_tag, props], env) => {
  const path = props.hasOwnProperty('path') ? props.path : '0'
  const value = E.lookup(path, env)
  return (
    <span class="wq-Text">{value}</span>
  )
})

window.start = start