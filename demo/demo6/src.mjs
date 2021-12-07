// launch by: 
//   $ node demo/demo6/src.mjs
import U from '../../index.js'
const {once, API} = U

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
  type: 'object', 
  properties: {
    detail: {
      type: 'object', 
      properties: {
        frame: {type:'string', notEmpty:true}, 
        os: {type:'string', notEmpty:true}, 
        cpu: {type:'string', notEmpty:true}, 
        memory: {type:'string', notEmpty:true}, 
        accessories: {
          type: 'object', 
          properties: master.accessory.reduce((cur, a, i) => {
            return {...cur, [`a${i}`]:{type:'boolean'}}
          }, {})
        }, 
        bonus: {type:'string', notEmpty:true}
      }
    }, 
    flags: {
      type: 'object', 
      properties: {
        isPro: {type:'boolean'}, 
        bigDeal: {type:'boolean'}
      }
    }, 
    quotation: {
      type: 'object', 
      properties: {
        lines: {
          type: 'array', 
          items: {
            type: 'object', 
            properties: {
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
    "frame": "SC130-T",
    "os": "Pro",
    "cpu": "i5",
    "memory": "16G",
    "accessories": {
      "a0": false,
      "a1": false,
      "a2": true,
      "a3": false
    },
    "bonus": "Touchauth Component"
  }, 
  flags: {
    isPro: false, 
    bigDeal: false
  }, 
  quotation: {
    lines: [], 
    subtotal: 0, 
    tax: 0, 
    total: 0
  }
}

const findByProp = (name, value, lis) => {
  for (let i = 0; i < lis.length; i++) {
    if (lis[i][name] == value) return lis[i]
  }
  return undefined
}
const evolve = (store, _path, _prevStore) => {
  const addLine = (category, x, store) => {
    const line = {category, description:x.name, unitPrice:x.price, quantity:1, amount:x.price}
    return API.add('/quotation/lines/-', line, store)
  }
  let subtotal = 0
  let isPro = false
  let detail = API.extract('/detail', store)
  if (detail.frame) {
    const frame = findByProp('name', detail.frame, master.frame)
    store = addLine('筐体', frame, store)
    subtotal += frame.price
  }
  if (detail.os) {
    const os = findByProp('name', detail.os, master.os)
    store = addLine('OS', os, store)
    subtotal += os.price
    if (os.name == 'Pro') isPro = true
  }
  if (detail.cpu) {
    const cpu = findByProp('name', detail.cpu, master.cpu)
    store = addLine('CPU', cpu, store)
    subtotal += cpu.price
  }
  store = API.add('/flags/isPro', isPro, store)
  if (! isPro && detail.memory && detail.memory == '32G') {
    store = API.add('/detail/memory', '', store)
    detail = API.extract('/detail', store)  // we modified `/detail' so load again.
  }
  if (detail.memory) {
    const memory = findByProp('name', detail.memory, master.memory)
    store = addLine('メモリ', memory, store)
    subtotal += memory.price
  }
  master.accessory.forEach((a, i) => {
    if (detail.accessories[`a${i}`]) {
      store = addLine('アクセサリ', a, store)
      subtotal += a.price
    }
  })
  const bigDeal = subtotal >= 70000
  store = API.add('/flags/bigDeal', bigDeal, store)
  if (! bigDeal) {
    store = API.remove('/detail/bonus', store)
    detail = API.extract('/detail', store)  // we modified `/detail' so load again.
  }
  if (detail.bonus) {
    const bonus = findByProp('name', detail.bonus, master.bonus)
    store = addLine('ボーナス', bonus, store)
    subtotal += bonus.price
  }
  store = API.add('/quotation/subtotal', subtotal, store)
  store = API.add('/quotation/tax', subtotal / 10, store)
  store = API.add('/quotation/total', subtotal + subtotal / 10, store)
  return store
}

let store = once({schema, data, evolve})
store = API.touchAll("", store)
store = API.validate("", store)
const numErrors = API.countValidationErrors("", store)
if (numErrors) {
  console.error('ERROR: some validation errors occurred', store.tree)
} else {
  const result = API.extract("", store)
  console.log("SUCCESS", result)
}