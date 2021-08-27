

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
        frame: {type:'string', minLength:1}, 
        os: {type:'string', minLength:1}, 
        cpu: {type:'string', minLength:1}, 
        memory: {type:'string', minLength:1}, 
        accessories: {
          type: 'record', 
          fields: master.accessory.reduce((cur, a, i) => {
            return {...cur, [`a${i}`]:{type:'boolean'}}
          }, {})
        }, 
        bonus: {type:'string', minLength:1}
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
    ['List', {path:'/quotation/lines', astable:true}, 
      ['ListItem', {astable:true}, 
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
  ], 
  ["hr", {}], 
  ["Button", {label:"確定", hook:"prepare", effect:'submit'}]
]

const findByProp = (name, value, lis) => {
  for (let i = 0; i < lis.length; i++) {
    if (lis[i][name] == value) return lis[i]
  }
  return undefined
}
const evolve = (env, API) => {
  const addLine = (category, x, env) => {
    const line = {category, description:x.name, unitPrice:x.price, quantity:1, amount:x.price}
    return API.add('/quotation/lines/-', line, API.validate, env)
  }
  let subtotal = 0
  let isPro = false
  const detail = API.lookup('/detail', env)
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
      env = API.add('/detail/memory', initialMemory, API.validate, env)
      detail.memory = initialMemory
    }
  }
  env = API.setm('/detail/memory', 'options', memoryOptions, env)
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
    env = API.setm('/detail/bonus', 'disabled', true, env)
  }
  env = API.add('/quotation/subtotal', subtotal, API.validate, env)
  env = API.add('/quotation/tax', subtotal / 10, API.validate, env)
  env = API.add('/quotation/total', subtotal + subtotal / 10, API.validate, env)
  return env
}

const prepare = (env, _path, API) => {
  return API.touchAll('/detail', env)
}

const submit = (env, _path, API) => {
  const numErrors = API.countValidationErrors('/detail', env)
  console.log('submit/1', numErrors)
  if (numErrors) {
    window.setTimeout(() => {
      const targetEl = container.querySelector('.mg-invalid')
      targetEl.scrollIntoView()
    }, 100)
  } else {
    window.setTimeout(() => {window.alert('サブミットしました。')}, 100)
  }
  return env
}

const container = document.getElementById('app')

window.unmagical(data, schema, {evolve, submit, prepare}, view, container)