
import {h} from 'hyperapp'
import * as E from '/env'
import {start, render, addComponent} from './framework'

// props = {path?}
addComponent('TextInput', ([_tag, props], env, actions) => {
  const path = props.hasOwnProperty('path') ? props.path : '0'
  return (
    <input type="text" oninput={actions.onTextInput} onblur={actions.onTextBlur} data-path={E.makePath(path, env)} value={E.getm(path, 'input', '', env)} />
  )
})

// props = {path?, name, value, label}
addComponent('Radio', ([_tag, props], env, actions) => {
  const path = props.hasOwnProperty('path') ? props.path : '0'
  return (
    <label>
      <input type="radio" name={props.name} onchange={actions.onSelectionChange} value={props.value} checked={E.getm(path, 'input', '', env) == props.value} data-path={E.makePath(path, env)} />
      <span>{props.label}</span>
    </label>
  )
})

// props = {path?, label}
addComponent('Checkbox', ([_tag, props], env, actions) => {
  const path = props.hasOwnProperty('path') ? props.path : '0'
  return (
    <label>
      <input type="checkbox" onchange={actions.onToggleChange} checked={E.lookup(path, env)} data-path={E.makePath(path, env)} />
      <span>{props.label}</span>
    </label>
  )
})

// props = {path, label?}
addComponent('Field', ([_tag, props, ...children], env, actions) => {
  const env2 = E.goTo(props.path, env)
  const slot = E.gets('0', env2)
  if (slot.disabled) {
    return null
  }
  return (
    <div class="qp-Field">
      {props.label ? (
        <label>{props.label}</label>
      ) : null}
      <div class="qp--body">
        {children.map(c => render(c, env2, actions))}
      </div>
      {slot.touched && slot.invalid ? (
        <span class="qp--message">{slot.message}</span>
      ) : null}
    </div>
  )
})

// props = {path}
addComponent('List', ([_tag, props, child], env, actions) => {
  env = E.goTo(props.path, env)
  const length = E.length('0', env)
  return (
    <ul class="qp-List">
      {Array(length).fill(null).map((_x, i) => render(child, E.goTo('0/' + i, env), actions))}
    </ul>
  )
})

// props = {label, actions}
//   actions = [action, ...]
//   action = {name, [paramName]:paramValue, ...}
addComponent('ActionButton', ([_tag, props], env, actions) => {
  const dataProps = {'data-actionlength':props.actions.length}
  for (let i = 0; i < props.actions.length; i++) {
    const spec = props.actions[i]
    for (let p in spec) {
      if (p == 'path') {
        console.log('ActionButton/path', env.path, spec[p], E.makePath(spec[p], env))
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

const schema = {
  type: 'list', 
  items: {
    type: 'record', 
    fields: {
      done: {type:'boolean'}, 
      subject: {type:'string', minLength:1}
    }
  }
}

const data = {
  initial: [], 
  todo: {done:false, subject:''}
}

const view = 
['div', {}, 
  ['List', {path:""}, 
    ['li', {}, 
      ['Checkbox', {path:'0/done'}], 
      ['Field', {path:'0/subject'}, 
        ['TextInput', {}]
      ], 
      ['ActionButton', {label:'削除', actions:[{name:'RemoveItem', path:'0'}]}]
    ]
  ], 
  ['ActionButton', {label:'追加', actions:[{name:'AddItem', path:'/-', data:'todo'}]}]
]

const evolve = (env) => {
  return env
}

start(data, schema, evolve, view, document.getElementById('app'))