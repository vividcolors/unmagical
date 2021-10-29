import {h, API, start, Textbox, GenericTextbox, Slider, Listbox, Radio, Checkbox, UpdateButton, SettleButton, Field, Dialog, Notification} from '../../bindings/tailwind'

const master = {
  sex: ['男', '女'], 
  job: ['給与所得者', '会社経営', '個人事業主', '主婦', '学生']
}

const zipPattern = '^[0-9]{3}-?[0-9]{4}$'
const schema = {
  type: 'object', 
  properties: {
    name: {
      type: 'object', 
      properties: {
        firstName: {type:'string', minLength:1}, 
        lastName: {type:'string', minLength:1}
      }
    }, 
    email: {
      type: 'object', 
      properties: {
        firstTime: {type:'string', pattern:'^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$'}, 
        secondTime: {type:'string', same:'/email/firstTime'}
      }
    }, 
    sex: {type:'string', enum:master.sex}, 
    address: {
      type: 'object', 
      properties: {
        zip: {type:'string', pattern:zipPattern}, 
        pref: {type:'string', minLength:1}, 
        city: {type:'string', minLength:1}, 
        street: {type:'string', minLength:1}, 
        bld: {type:'string'}
      }
    }, 
    job: {type:'string', enum:master.job}, 
    password: {
      type: 'object', 
      properties: {
        firstTime: {type:'string', minLength:1}, 
        secondTime: {type:'string', same:'1/firstTime'}
      }
    }, 
    color: {type:'string', pattern:'^#[0-9a-fA-F]{6}$'}, 
    date: {type:'string', minLength:1}, 
    age: {type:'integer', minimum:15, maximum:45}
  }
}

const data = {
  name: {firstName:'', lastName:''}, 
  email: {firstTime:'', secondTime:''}, 
  sex: '', 
  address: {zip:'', pref:'', city:'', street:'', bld:''}, 
  job:'', 
  password: {firstTime:'', secondTime:''}, 
  color: '', 
  date: '', 
  age: 15
}

const updates = {
  complementAddress: (env) => {
    const zipSlot = API.getSlot('/address/zip', env)
    return API.withEnv(null, 
      new Promise((fulfill, reject) => {
        new YubinBango.Core(zipSlot.input.replace('-', ''), fulfill)
      }).then(API.wrap(([result, env]) => {
        const bld = API.extract('/address/bld', env)
        const address = {zip:zipSlot.input, pref:result.region, city:result.locality, street:result.street, bld}
        return API.add('/address', address, env)
      }))
    )
  }
}

const onZipCreated = (el) => {
  el.addEventListener('input', maybeComplementAddress)
}
const maybeComplementAddress = (ev) => {
  const zip = ev.currentTarget.value
  if (zip.match(new RegExp(zipPattern))) {
    onUpdate({
      update:'complementAddress', 
      context: []
    })
  }
}

const view = (env) => {
  const zipSlot = API.getSlot('/address/zip', env)
  return (
    <div>
      <Field title="名前" path="/name" env={env} foldValidity>
        <Textbox mg-path="/name/firstName" />
        <Textbox mg-path="/name/lastName" />
      </Field>
      <Field title="メールアドレス" path="/email" env={env} foldValidity>
        <Textbox mg-path="/email/firstTime" />
        <Textbox mg-path="/email/secondTime" />
      </Field>
      <Field title="生別" path="/sex" env={env}>
        {master.sex.map(s => (
          <Radio mg-path="/sex" name="sex" value={s} label={s} />
        ))}
      </Field>
      <Field title="住所" path="/address" env={env} foldValidity>
        <Textbox mg-path="/address/zip" oncreate={onZipCreated} />
        <Textbox mg-path="/address/pref" />
        <Textbox mg-path="/address/city" />
        <Textbox mg-path="/address/street" />
        <Textbox mg-path="/address/bld" />
      </Field>
      <Field title="職業" path="/job" env={env}>
        <Listbox mg-path="/job">
          <option disabled value="">選んでください</option>
          {master.job.map(j => (
            <option value={j}>{j}</option>
          ))}
        </Listbox>
      </Field>
      <Field title="パスワード" path="/password" env={env} foldValidity>
        <Textbox type="password" mg-path="/password/firstTime" />
        <Textbox type="password" mg-path="/password/secondTime" />
      </Field>
      <Field title="色" path="/color" env={env}>
        <GenericTextbox type="color" mg-path="/color" />
      </Field>
      <Field title="日付" path="/date" env={env}>
        <Textbox type="date" mg-path="/date" />
      </Field>
      <Field title="年齢" path="/age" env={env}>
        <Slider type="range" mg-path="/age" min={15} max={45} />
      </Field>
    </div>
  )
}

const containerEl = document.getElementById('app')
const {onUpdate} = start({data, schema, view, updates, containerEl})