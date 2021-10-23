import {h, API, start, Textbox, Listbox, Radio, Checkbox, UpdateButton, SettleButton, Field, Dialog, Notification} from '../../bindings/tailwind'

const master = {
  sex: ['男', '女'], 
  job: ['給与所得者', '会社経営', '個人事業主', '主婦', '学生']
}

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
        zip: {type:'string', pattern:'^[0-9]{3}-?[0-9]{4}$'}, 
        pref: {type:'string', minLength:1}, 
        city: {type:'string', minLength:1}, 
        street: {type:'string', minLength:1}, 
        bld: {type:'string'}
      }
    }, 
    job: {type:'string', enum:master.job}
  }
}

const data = {
  name: {firstName:'', lastName:''}, 
  email: {firstTime:'', secondTime:''}, 
  sex: '', 
  address: {zip:'', pref:'', city:'', street:'', bld:''}, 
  job:''
}

const view = (env) => {
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
        <Textbox mg-path="/address/zip" />
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
    </div>
  )
}

const containerEl = document.getElementById('app')
start({data, schema, view, containerEl})