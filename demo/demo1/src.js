
import {start, h, API} from '../../src/framework'
import {Radio as CRadio, Checkbox as CCheckbox, Button} from '../../src/components'

const Field = ({path, label, env}, children) => {
  if (! API.test(path, env)) return null
  const slot = API.getSlot(path, env)
  const invalid = slot.touched && slot.invalid
  return (
    <div class={`mg-Field ${invalid ? 'mg-invalid' : ''}`} key={path}>
      {label ? (
        <div class="mg--header"><span class="mg--label">{label}</span></div>
      ) : null}
      <div class="mg--body">
        {children}
      </div>
      {invalid ? (
        <span class="mg--message">{slot.message}</span>
      ) : null}
    </div>
  )
}

const InputGroup = ({class:clazz, ...props}, children) => {
  return (
    <div class={`mg-InputGroup ${clazz || ''}`}>
      <div class="mg--inner">
        {children}
      </div>
    </div>
  )
}

const Radio = ({path, name, value, label, disabled = false}) => {
  return (
    <label>
      <CRadio type="radio" mg-path={path} name={name} value={value} disabled={disabled} />
      <span>{label}</span>
    </label>
  )
}

const Checkbox = ({path, label, disabled = false}) => {
  return (
    <label>
      <CCheckbox type="checkbox" mg-role="checkbox" mg-path={path} disabled={disabled} />
      <span>{label}</span>
    </label>
  )
}

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
  type: 'object', 
  properties: {
    detail: {
      type: 'object', 
      properties: {
        frame: {type:'string', minLength:1}, 
        os: {type:'string', minLength:1}, 
        cpu: {type:'string', minLength:1}, 
        memory: {type:'string', minLength:1}, 
        accessories: {
          type: 'object', 
          properties: master.accessory.reduce((cur, a, i) => {
            return {...cur, [`a${i}`]:{type:'boolean'}}
          }, {})
        }, 
        bonus: {type:'string', minLength:1}
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

const view = (state, actions) => {
  const flags = API.extract('/flags', state.env)
  const quotation = API.extract('/quotation', state.env)
  return (
    <div id="rootMarker">
      <Field path="/detail/os" label="OS" env={state.env}>
        <InputGroup>
          {master.os.map(x => <Radio path="/detail/os" name="os" value={x.name} label={`${x.name} ${x.price}円`} />)}
        </InputGroup>
      </Field>
      <Field path="/detail/cpu" label="CPU" env={state.env}>
        <InputGroup>
          {master.cpu.map(x => <Radio path="/detail/cpu" name="cpu" value={x.name} label={`${x.name} ${x.price}円`} />)}
        </InputGroup>
      </Field>
      <Field path="/detail/memory" label="メモリ" env={state.env}>
        <InputGroup>
          {master.memory.map(x => <Radio path="/detail/memory" name="memory" value={x.name} label={`${x.name} ${x.price}円`} disabled={x.name == '32G' && !flags.isPro} />)}
        </InputGroup>
      </Field>
      <Field path="/detail/accessories" label="アクセサリー" env={state.env}>
        <InputGroup>
          {master.accessory.map((x,i) => <Checkbox path={`/detail/accessories/a${i}`} label={`${x.name} ${x.price}円`} />)}
        </InputGroup>
      </Field>
      <Field path="/detail/bonus" label="ボーナス" env={state.env}>
        <InputGroup>
          {master.bonus.map(x => <Radio path="/detail/bonus" name="bonus" value={x.name} label={x.name} />)}
        </InputGroup>
      </Field>
      <hr />
      <table>
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
      <table>
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
      <Button type="button" mg-role="button" mg-update="submit">確定</Button>
    </div>
  )
}

const findByProp = (name, value, lis) => {
  for (let i = 0; i < lis.length; i++) {
    if (lis[i][name] == value) return lis[i]
  }
  return undefined
}
const evolve = (path, env) => {
  const addLine = (category, x, env) => {
    const line = {category, description:x.name, unitPrice:x.price, quantity:1, amount:x.price}
    return API.add('/quotation/lines/-', line, env)
  }
  let subtotal = 0
  let isPro = false
  let detail = API.extract('/detail', env)
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
    detail = API.extract('/detail', env)  // we modified `/detail' so load again.
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
    detail = API.extract('/detail', env)  // we modified `/detail' so load again.
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

const updates = {
  submit: (_context, callEvolve, env) => {
    env = API.touchAll('/detail', env)
  
    env = callEvolve("", env)
  
    const numErrors = API.countValidationErrors('/detail', env)
    console.log('submit/1', numErrors)
    if (numErrors) {
      window.setTimeout(() => {
        const targetEl = containerEl.querySelector('.mg-invalid')
        targetEl.scrollIntoView()
      }, 100)
    } else {
      window.setTimeout(() => {window.alert('サブミットしました。')}, 100)
    }
  }
}

const containerEl = document.getElementById('app')

start({data, schema, view, updates, containerEl, evolve})
