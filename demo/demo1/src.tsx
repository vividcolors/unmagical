
import {h, API, start, Input, Select, Radio, Checkbox, UpdateButton, SettleButton, Field, Dialog, Notification, Progress} from '../../src/bindings/bulma'
import {createRestRepository} from '../../src/core/rest'
import {makeEntityUpdates} from '../../src/core/updates'
import {StartParameter} from '../../src/core/framework'
import {Env} from '../../src/core/env'

const master = {
  frame: [
    {name:'SC130-T', price:32000}
  ], 
  os: [
    {name:'Windows10 Home', price:8000}, 
    {name:'Windows10 Pro', price:13000}
  ], 
  cpu: [
    {name:'Intel i7', price:24000}, 
    {name:'Intel i5', price:16000}, 
    {name:'Intel i3', price:10000}
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

type Data = {
  detail: {
    frame: string, 
    os: string, 
    cpu: string, 
    memory: string, 
    accessories: Record<string,boolean>, 
    bonus: string
  }, 
  flags: {
    isPro: boolean, 
    bigDeal: boolean
  }, 
  quotation: {
    lines: Array<{
      category: string, 
      description: string, 
      unitPrice: number, 
      quantity: number, 
      amount: number
    }>, 
    subtotal: number, 
    tax: number, 
    total: number
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

const updates = makeEntityUpdates(createRestRepository('http://localhost:3000/btopcs', {}))

const view = (env:Env) => {
  const flags = API.extract('/flags', env) as Data["flags"]
  const quotation = API.extract('/quotation', env) as Data["quotation"]
  return (
    <div id="rootMarker" class="container">
      <Notification name="success" message="送信に成功しました。" duration={5000} />
      <Notification name="failure" title="エラー" message="エラーが発生しました（{message}）" />
      <Field path="/detail/os" label="OS">
        <div class="control">
          {master.os.map(x => <Radio path="/detail/os" name="os" value={x.name}>{`${x.name} ${x.price}円`}</Radio>)}
        </div>
      </Field>
      <Field path="/detail/cpu" label="CPU">
        <div class="control">
          {master.cpu.map(x => <Radio path="/detail/cpu" name="cpu" value={x.name}>{`${x.name} ${x.price}円`}</Radio>)}
        </div>
      </Field>
      <Field path="/detail/memory" label="メモリ">
        <div class="control">
          {master.memory.map(x => <Radio path="/detail/memory" name="memory" value={x.name} disabled={x.name == '32G' && !flags.isPro}>{`${x.name} ${x.price}円`}</Radio>)}
        </div>
      </Field>
      <Field path="/detail/accessories" label="アクセサリー">
        <div class="control">
          {master.accessory.map((x,i) => <Checkbox path={`/detail/accessories/a${i}`}>{`${x.name} ${x.price}円`}</Checkbox>)}
        </div>
      </Field>
      <Field path="/detail/bonus" label="ボーナス">
        <div class="control">
          {master.bonus.map(x => <Radio path="/detail/bonus" name="bonus" value={x.name}>{x.name}</Radio>)}
        </div>
      </Field>
      <hr />
      <table class="table is-striped">
        <thead>
          <th>カテゴリー</th>
          <th>名前</th>
          <th>単価</th>
          <th>数量</th>
          <th>金額</th>
        </thead>
        <tbody>
          {quotation.lines.map(line => (
            <tr key={`${line.category}-${line.description}-${line.unitPrice}-${line.quantity}`}>
              <td>{line.category}</td>
              <td>{line.description}</td>
              <td>{line.unitPrice}</td>
              <td>{line.quantity}</td>
              <td>{line.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table class="table">
        <tr>
          <th>小計</th>
          <td>{quotation.subtotal}</td>
        </tr>
        <tr>
          <th>税</th>
          <td>{quotation.tax}</td>
        </tr>
        <tr>
          <th>合計</th>
          <td>{quotation.total}</td>
        </tr>
      </table>
      <hr />
      <UpdateButton type="button" class="is-primary" name="loading" update="submit" context={["add", {path:"/detail", errorSelector:".is-danger", method:"POST"}]}>確定</UpdateButton>
    </div>
  )
}

const findByProp = <V, T>(name:string, value:V, lis:T[]):T|undefined => {
  for (let i = 0; i < lis.length; i++) {
    if (lis[i][name] == value) return lis[i]
  }
  return undefined
}
const evolve = (env:Env, path:string, prevEnv:Env):Env => {
  const addLine = (category:string, x:{name:string,price:number}, env:Env):Env => {
    const line = {category, description:x.name, unitPrice:x.price, quantity:1, amount:x.price}
    return API.add('/quotation/lines/-', line, env)
  }
  let subtotal = 0
  let isPro = false
  let detail = API.extract('/detail', env) as Data["detail"]
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
  env = API.add('/flags/isPro', isPro, env)
  if (! isPro && detail.memory && detail.memory == '32G') {
    env = API.add('/detail/memory', '', env)
    detail = API.extract('/detail', env) as Data["detail"]  // we modified `/detail' so load again.
  }
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
  const bigDeal = subtotal >= 70000
  env = API.add('/flags/bigDeal', bigDeal, env)
  if (! bigDeal) {
    env = API.remove('/detail/bonus', env)
    detail = API.extract('/detail', env) as Data["detail"]  // we modified `/detail' so load again.
  }
  if (detail.bonus) {
    const bonus = findByProp('name', detail.bonus, master.bonus)
    env = addLine('ボーナス', bonus, env)
    subtotal += bonus.price
  }
  env = API.add('/quotation/subtotal', subtotal, env)
  env = API.add('/quotation/tax', subtotal / 10, env)
  env = API.add('/quotation/total', subtotal + subtotal / 10, env)
  return env
}

const containerEl = document.getElementById('app')

start({data, schema, view:view as StartParameter["view"], containerEl, updates, evolve})

