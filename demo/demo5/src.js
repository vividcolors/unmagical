
import {h, API, start, Textbox, Listbox, Radio, Checkbox, UpdateButton, SettleButton, Field, Dialog, Notification, Progress} from '../../src/bindings/bulma'
import {playReorderable, playUpdateButton, prepareToDestroy} from '../../src/core/components'

const ClickableText = playUpdateButton("p", {onclick:'onclick'})

const contactSchema = {
  type: 'object', 
  properties: {
    id: {type:'integer'}, 
    created: {type:'string'}, 
    name: {type:'string', minLength:1}, 
    email: {type:'string', minLength:1}, 
    content: {type:'string'}
  }
}

const schema = {
  type: 'object', 
  properties: {
    contacts: {
      type: 'array', 
      items: contactSchema
    }, 
    query: {
      name_like: {type:'string'}, 
      email_like: {type:'string'}, 
      created_gte: {type:'string'}, 
      created_lte: {type:'string'}, 
      _page: {type:'integer'}
    }, 
    nav: {
      total: {type:'integer'}, 
      from: {type:'integer'}, 
      to: {type:'integer'}
    }
  }
}

const data = {
  contacts: [], 
  query: {
    name_like: '', 
    email_like: '', 
    created_gte: '', 
    created_lte: '', 
    _page: 0
  }, 
  nav: {
    total: 0, 

  }
}

const Pager = ({nav, _page, length}) => {
  const limit = 10
  const firstPage = 1
  const lastPage = Math.ceil(total / limit)
  const from = _page * limit + 1
  const to = from + length - 1
  return (
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <p>{nav.total} 件中 {from}～{to}</p>
        </div>
        <div class="level-item">
          <div class="field has-addons">
            <div class="control">
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const view = (env) => {
  const contacts = API.extract('/contacts', env)
  return (
    <div class="container my-3">
      <p>Total: {API.extract('/nav/total', env)}</p>
      <table class="table is-hoverable">
        <thead>
          <th>ID</th>
          <th>日時</th>
          <th>名前</th>
          <th>メールアドレス</th>
          <th>内容</th>
          <th> </th>
        </thead>
        <tbody>
          {contacts.map((c) => {
            return (
              <tr>
                <td>{c.id}</td>
                <td>{c.created}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.content.replace('\n', '').slice(0, 10)}</td>
                <td>
                  <UpdateButton class="button is-danger is-inverted mx-1" mg-update="deleteItem" mg-context={null}><span class="icon"><span class="material-icons">delete</span></span></UpdateButton>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <Dialog mg-name="alert" title="エラー" message="エラーが発生しました（{name}: {message}）" hideCancelButton={true} />
    </div>
  )
}

const containerEl = document.getElementById('app')
const {onUpdate} = start({data, schema, view, containerEl})

onUpdate({update:'load', context:['http://localhost:3000/contactss?_limit=10', '/contacts', {totalPath:'/nav/total', totalHeader:'X-Total-Count'}]})