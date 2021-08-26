
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


// Homeだと32Gはダメ
// 6万円を越えたらオマケが選べる
const master = {
  frame: [
    {name:'SC130-T', price:32000}
  ], 
  os: [
    {name:'Home', price:8000}, 
    {name:'Pro', price:13000}
  ], 
  cpu: [
    {name:'i7', price:24000}, 
    {name:'i5', price:16000}, 
    {name:'i3', price:10000}
  ], 
  memory: [
    {name:'4G', price:10000}, 
    {name:'8G', price:20000}, 
    {name:'16G', price:40000}, 
    {name:'32G', price:80000}
  ], 
  accessory: [
    {name:'Keyboard', price:2000}, 
    {name:'Mouse', price:2000}, 
    {name:'Touch Pad', price:2000}, 
    {name:'Monitor', price:20000}
  ], 
  bonus: [
    {name:'Mobile Wi-Fi Adaptor', price:0}, 
    {name:'Touchauth Component', price:0}
  ]
}

const schema = {
  type: 'record', 
  fields: {
    detail: {
      type: 'record', 
      fields: {
        frame: {type:'string'}, 
        os: {type:'string'}, 
        cpu: {type:'string'}, 
        memory: {type:'string'}, 
        accessories: {
          type: 'record', 
          fields: master.accessory.reduce((cur, a, i) => {
            return {...cur, [`a${i}`]:{type:'boolean'}}
          }, {})
        }, 
        bonus: {type:'string'}
      }
    }, 
    quotation: {
      type: 'record', 
      fields: {
        lines: {
          type: 'list', 
          items: {
            type: 'record', 
            fields: {
              category: {type:'string'}, 
              description: {type:'string'}, 
              unitPrice: {type:'integer'}, 
              quantity: {type:'integer'}, 
              amount: {type:'integer'}
            }
          }
        }, 
        subtotal: {type:'integer'}, 
        tax: {type:'integer'}, 
        total: {type:'integer'}
      }
    }
  }
}

const data = {
  initial: {
    detail: {
      frame: master.frame[0].name, 
      os: '', 
      cpu: '', 
      memory: '', 
      accessories: master.accessory.reduce((cur, a, i) => {
        return {...cur, [`a${i}`]:false}
      }, {}), 
      bonus: ''
    }, 
    quotation: {
      lines: [], 
      subtotal: 0, 
      tax: 0, 
      total: 0
    }
  }
}

const view = 
['div', {}, 
  ['Field', {path:'/detail/os', label:'OS'}].concat(
    master.os.map(x => ['Radio', {name:'os', value:x.name, label:`${x.name} ${x.price}円`}])
  ), 
  ['Field', {path:'/detail/cpu', label:'CPU'}].concat(
    master.cpu.map(x => ['Radio', {name:'cpu', value:x.name, label:`${x.name} ${x.price}円`}])
  ), 
  ['Field', {path:'/detail/memory', label:'メモリ'}].concat(
    master.memory.map(x => ['Radio', {name:'memory', value:x.name, label:`${x.name} ${x.price}円`, testOptions:true}])
  ), 
  ['Field', {path:'/detail/accessories', label:'アクセサリー'}].concat(
    master.accessory.map((x, i) => ['Checkbox', {path:`/detail/accessories/a${i}`, label:`${x.name} ${x.price}円`}])
  ), 
  ['Field', {path:'/detail/bonus', label:'ボーナス'}].concat(
    master.bonus.map(x => ['Radio', {name:'bonus', value:x.name, label:`${x.name}`}])
  ), 
  ['hr', {}], 
  ['table', {}, 
    ['thead', {}, 
      ['th', {}, 'カテゴリー'], 
      ['th', {}, '名前'], 
      ['th', {}, '単価'], 
      ['th', {}, '数量'], 
      ['th', {}, '金額']
    ], 
    ['List', {path:'/quotation/lines', astbody:true}, 
      ['tr', {}, 
        ['td', {}, ['Text', {path:'0/category'}]], 
        ['td', {}, ['Text', {path:'0/description'}]], 
        ['td', {}, ['Text', {path:'0/unitPrice'}]], 
        ['td', {}, ['Text', {path:'0/quantity'}]], 
        ['td', {}, ['Text', {path:'0/amount'}]]
      ]
    ]
  ], 
  ['table', {}, 
    ['tr', {}, 
      ['th', {}, '小計'], 
      ['td', {}, ['Text', {path:'/quotation/subtotal'}]]
    ], 
    ['tr', {}, 
      ['th', {}, '消費税'], 
      ['td', {}, ['Text', {path:'/quotation/tax'}]]
    ], 
    ['tr', {}, 
      ['th', {}, '合計'], 
      ['td', {}, ['Text', {path:'/quotation/total'}]]
    ]
  ]
]

const findByProp = (name, value, lis) => {
  for (let i = 0; i < lis.length; i++) {
    if (lis[i].name === value) return lis[i]
  }
  return undefined
}
const addLine = (category, x, env) => {
  const line = {category, description:x.name, unitPrice:x.price, quantity:1, amount:x.price}
  return E.add('/quotation/lines/-', line, env)
}
const evolve = (env) => {
  let subtotal = 0
  let isPro = false
  const detail = E.lookup('/detail', env)
  if (detail.frame) {
    const frame = findByProp('name', detail.frame, master.frame)
    env = addLine('筐体', frame, env)
    subtotal += frame.price
  }
  if (detail.os) {
    const os = findByProp('name', detail.os, master.os)
    env = addLine('OS', os, env)
    subtotal += os.price
    if (os.name == 'Pro') isPro = true
  }
  if (detail.cpu) {
    const cpu = findByProp('name', detail.cpu, master.cpu)
    env = addLine('CPU', cpu, env)
    subtotal += cpu.price
  }
  let memoryOptions = master.memory.map(m => m.name)
  if (! isPro) {
    memoryOptions = memoryOptions.filter(m => m != '32G')
    if (detail.memory && detail.memory == '32G') {
      const initialMemory = data.initial.detail.memory
      env = E.add('/detail/memory', initialMemory, env)
      detail.memory = initialMemory
    }
  }
  env = E.setm('/detail/memory', 'options', memoryOptions, env)
  if (detail.memory) {
    const memory = findByProp('name', detail.memory, master.memory)
    env = addLine('メモリ', memory, env)
    subtotal += memory.price
  }
  master.accessory.forEach((a, i) => {
    if (detail.accessories[`a${i}`]) {
      env = addLine('アクセサリ', a, env)
      subtotal += a.price
    }
  })
  if (subtotal >= 70000) {
    if (detail.bonus) {
      const bonus = findByProp('name', detail.bonus, master.bonus)
      env = addLine('ボーナス', bonus, env)
      subtotal += bonus.price
    }
  } else {
    env = E.setm('/detail/bonus', 'disabled', true, env)
  }
  env = E.add('/quotation/subtotal', subtotal, env)
  env = E.add('/quotation/tax', subtotal / 10, env)
  env = E.add('/quotation/total', subtotal + subtotal / 10, env)
  return env
}

start(data, schema, evolve, view, document.getElementById('app'))