
import {h} from 'hyperapp'
import * as E from '/env'
import {start, render, addComponent, evalXpath, applyDict} from './framework'
import {range} from 'ramda'

// props = {path?, addKey?}
addComponent('TextInput', ([_tag, props], env, actions) => {
  const path = props.hasOwnProperty('path') ? props.path : '0'
  const slot = E.gets(path, env)
  if (! slot) return null
  const invalid = !(slot.disabled || false) && (slot.touched || false) && (slot.invalid || false)
  const xprops = {}
  if (props.addKey) xprops.key = slot.key
  return (
    <input type="text" class={`mg-TextInput ${invalid ? 'mg-invalid' : ''}`} oninput={actions.onTextInput} onblur={actions.onTextBlur} data-path={E.makePath(path, env)} value={slot.input || ''} disabled={slot.disabled || false} {...xprops} />
  )
})

// props = {path?, name, value, label, testOptions, addKey?}
// testOptionsを真にすると、optionsメタを使って当部品のenabilityを判断するようになる。
addComponent('Radio', ([_tag, props], env, actions) => {
  const path = props.hasOwnProperty('path') ? props.path : '0'
  const epath = E.makePath(path, env)
  const slot = E.gets(path, env)
  if (! slot) return null
  let disabled = slot.disabled || false
  if (!disabled && props.hasOwnProperty('testOptions') && props.testOptions) {
    disabled = (slot.options || []).indexOf(props.value) == -1
  }
  const invalid = !disabled && (slot.touched || false) && (slot.invalid || false)
  const checked = (slot.input || '') == props.value
  const xprops = {}
  if (props.addKey) xprops.key = slot.key
  return (
    <label class="mg-Radio" {...xprops}>
      <input type="radio" class={`mg--input ${invalid ? 'mg-invalid' : ''}`} name={props.name} onchange={actions.onSelectionChange} value={props.value} checked={checked} disabled={disabled} data-path={epath} />
      <span class="mg--display">
        <span class="mg--graphic material-icons">{checked ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
        <span class="mg--label">{props.label}</span>
      </span>
    </label>
  )
})

// props = {path?, label, addKey?}
addComponent('Checkbox', ([_tag, props], env, actions) => {
  const path = props.hasOwnProperty('path') ? props.path : '0'
  const slot = E.gets(path, env)
  if (! slot) return null
  const invalid = !(slot.disabled || false) && (slot.touched || false) && (slot.invalid || false)
  const checked = slot['@value'] || false
  const xprops = {}
  if (props.addKey) xprops.key = slot.key
  return (
    <label class="mg-Checkbox" {...xprops}>
      <input type="checkbox" class={`mg--input ${invalid ? 'mg-invalid' : ''}`} onchange={actions.onToggleChange} checked={checked} data-path={E.makePath(path, env)} disabled={slot.disabled || false} />
      <span class="mg--display">
        <span class="mg--graphic material-icons">check</span>
        <span class="mg--label">{props.label}</span>
      </span>
    </label>
  )
})

addComponent('InputGroup', ([_tag, props, ...children], env, actions) => {
  return (
    <div class={`mg-InputGroup ${props.class || ''}`}>
      <div class="mg--inner">
        {children.map(c => render(c, env, actions))}
      </div>
    </div>
  )
})

// props = {path, label?, addKey?, dict?}
addComponent('Field', ([_tag, props, ...children], env, actions) => {
  const env2 = E.goTo(props.path, env)
  const slot = E.gets('0', env2)
  if (!slot || slot.disabled) return null
  const invalid = slot.touched && slot.invalid
  const xprops = {}
  if (props.addKey) xprops.key = slot.key
  return (
    <div class={`mg-Field ${invalid ? 'mg-invalid' : ''}`} {...xprops}>
      {props.label ? (
        <div class="mg--header"><span class="mg--label">{props.label}</span></div>
      ) : null}
      <div class="mg--body">
        {children.map(c => render(c, env2, actions))}
      </div>
      {invalid ? (
        <span class="mg--message">{applyDict(props.dict, slot.ecode, slot.eparam)}</span>
      ) : null}
    </div>
  )
})

// TODO disabled, invalid, message, etc.
// props = {path, astable?, addKey?}
addComponent('List', ([_tag, props, child], env, actions) => {
  env = E.goTo(props.path, env)
  const slot = E.gets('0', env)
  if (!slot || slot['@value'] === null) return null
  const length = E.length('0', env)
  const astable = props.hasOwnProperty('astable') ? props.astable : false
  const xprops = {}
  if (props.addKey) xprops.key = E.getm('0', 'key', 0, env)
  if (astable) {
    return (
      <tbody class="mg-List mg-astable" {...xprops}>
        {range(0, length).map(i => render(child, E.goTo('0/' + i, env), actions))}
      </tbody>
    )
  } else {
    return (
      <ul class="mg-List mg-aslist" {...xprops}>
        {range(0, length).map(i => render(child, E.goTo('0/' + i, env), actions))}
      </ul>
    )
  }
})

// props = {astable?}
addComponent('ListItem', ([_tag, props, ...children], env, actions) => {
  const key = E.getm('0', 'key', 0, env)
  const astable = props.hasOwnProperty('astable') ? props.astable : false
  if (astable) {
    return (
      <tr class={`mg-ListItem mg-astable`} key={key}>
        {children.map(c => render(c, env, actions))}
      </tr>
    )
  } else {
    return (
      <li class="mg-ListItem mg-aslist" key={key}>
        {children.map(c => render(c, env, actions))}
      </li>
    )
  }
})

// props = {path?, addKey?, dic?, showIf?}
addComponent('Text', ([_tag, props], env) => {
  const path = props.hasOwnProperty('path') ? props.path : '0'
  if (props.hasOwnProperty('showIf')) {
    const shown = evalXpath(props.showIf, env)
  }
  const value0 = E.lookup(path, env)
  const value = props.dic ? props.dic[value0] : value0
  const xprops = {}
  if (props.addKey) xprops.key = E.getm(path, 'key', 0, env)
  return (
    <span class="mg-Text" {...xprops}>{value}</span>
  )
})

// props = {path?, addKey?, dic?, showIf?}
addComponent('Icon', ([_tag, props], env) => {
  const path = props.hasOwnProperty('path') ? props.path : '0'
  if (props.hasOwnProperty('showIf')) {
    const shown = evalXpath(props.showIf, env)
  }
  const value0 = E.lookup(path, env)
  const value = props.dic ? props.dic[value0] : value0
  const xprops = {}
  if (props.addKey) xprops.key = E.getm(path, 'key', 0, env)
  return (
    <span class={`mg-Icon material-icons ${value}`} {...xprops}>{value}</span>
  )
})

// TODO disabledにしたいときにどうするか
// props = {label, path?, hook, prepare?}
addComponent('Button', ([_tag, props], env, actions) => {
  const path = props.hasOwnProperty('path') ? props.path : '0'
  return (
    <button type="button" class={`mg-Button`} onclick={actions.onButtonClick} data-path={E.makePath(path, env)} data-hook={props.hook} data-effect={props.effect || ''}>{props.label}</button>
  )
})

// props = {path}
addComponent('Modal', ([_tag, props, ...children], env, actions) => {
  env = E.goTo(props.path, env)
  const slot = E.gets('0', env)
  if (!slot || slot['@value'] === null) return null
  return (
    <div class={`mg-Modal`} key={slot.key}>
      <div class="mg--frame">
        {children.map(c => render(c, env, actions))}
      </div>
    </div>
  )
})

window.unmagical = start


export const render = (view, env, actions, state) => {
  console.log('render', view)
  if (Array.isArray(view)) {
    let props = view[1]
    if (view[1].hasOwnProperty('showIf')) {
      const shown = evalXpath(view[1].showIf, env)
      console.log('showIf', view[1].showIf, shown)
      if (! shown) return null
      props = {...view[1]}
      delete props.showIf
    }
    if (view)
    return {
      nodeName: view[0], 
      attributes: props, 
      children: view.slice(2).map(v => render(v, env, actions, state)), 
      key: props.addKey ? E.getm(path, 'key', 0, env) : null
    }
  } else {
    return view
  }
}