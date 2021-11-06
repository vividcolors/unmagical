
import {h, API, start, Textbox, Textarea, Listbox, Radio, Checkbox, UpdateButton, SettleButton, Field, Dialog, Notification, Progress} from '../../src/bindings/bulma'
import {playReorderable, playUpdateButton, prepareToDestroy} from '../../src/core/components'

const ClickableText = playUpdateButton("p", {onclick:'onclick'})

const contactProps = {
  id: {type:'integer'}, 
  created: {type:'string'}, 
  name: {type:'string', minLength:1}, 
  email: {type:'string', minLength:1}, 
  content: {type:'string'}
}

const schema = {
  type: 'object', 
  properties: {
    contacts: {
      type: 'object', 
      properties: {
        baseUrl: {}, 
        query: {
          type: 'object', 
          properties: {
            name_like: {type:'string'}, 
            email_like: {type:'string'}, 
            created_gte: {type:'string'}, 
            created_lte: {type:'string'}, 
            _page: {type:'integer'}
          }
        }, 
        totalCount: {type:'integer'}, 
        items: {
          type: 'array', 
          items: {
            type: 'object', 
            properties: contactProps
          }
        }
      }
    }, 
    form: {
      type: 'object?', 
      properties: {
        action: {type:'string'}, 
        data: {
          type: 'object', 
          properties: contactProps
        }
      }
    }
  }
}

const data = {
  contacts: {
    baseUrl: 'http://localhost:3000/contacts', 
    query: {
      name_like: '', 
      email_like: '', 
      created_gte: '0', 
      created_lte: '9', 
      _page: 1, 
      _limit: 10
    }, 
    totalCount: 0, 
    items: []
  }, 
  form: null
}

const showError = ({name, message}) => `エラーが発生しました（${name}: ${message}）`

const Modal = ({env}) => {
  const form = API.extract('/form', env)
  if (! form) return
  return (
    <div class="modal is-active">
      <div class="modal-background"></div>
      <div class="modal-card">
        <div class="modal-card-head">
          <p class="modal-card-title">
            コンタクト
          </p>
        </div>
        <div class="modal-card-body">
          <Notification mg-name="failure2" title="エラー" createMessage={showError} />
          <Field path="/form/data/id" env={env}>
            <label class="label">ID</label>
            <div class="control">{form.data.id > 0 ? form.data.id : '（新規追加）'}</div>
          </Field>
          <Field path="/form/data/created" env={env}>
            <label class="created">日時</label>
            <div class="control"><Textbox class="input" type="datetime-local" mg-path="/form/data/created" /></div>
          </Field>
          <Field path="/form/data/name" env={env}>
            <label class="label">名前</label>
            <div class="control"><Textbox class="input" mg-path="/form/data/name" /></div>
          </Field>
          <Field path="/form/data/email" env={env}>
            <label class="label">メールアドレス</label>
            <div class="control"><Textbox class="input" mg-path="/form/data/email" /></div>
          </Field>
          <Field path="/form/data/content" env={env}>
            <label class="label">本文</label>
            <div class="control"><Textarea class="textarea" mg-path="/form/data/content" /></div>
          </Field>
        </div>
        <div class="modal-card-foot">
          <UpdateButton mg-name="loading2" class="button is-primary" mg-update="commitItem" mg-context={['/form', '/contacts', {commitMethod:form.data.id > 0 ? 'PUT' : 'POST', totalCountHeader:'X-Total-Count', failureName:'failure2', loadingName:'loading2'}]}>確定</UpdateButton>
          <UpdateButton class="button" mg-update="discardItem" mg-context={['/form']}>キャンセル</UpdateButton>
        </div>
      </div>
    </div>
  )
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
      <Notification mg-name="success" message="成功しました。" duration={5000} />
      <Notification mg-name="failure" title="エラー" createMessage={showError} />
      <UpdateButton class="button is-primary" mg-update="createItem" mg-context={[{id:0, created:'', name:'', email:'', content:''}, 'http://localhost:3000/contacts', '/form']}>新規追加</UpdateButton>
      <p>Total: {API.extract('/contacts/totalCount', env)}</p>
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
          {contacts.items.map((c, i) => {
            const url = 'http://localhost:3000/contacts/' + c.id
            return (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.created}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.content.replace('\n', '').slice(0, 10)}</td>
                <td>
                  <UpdateButton class="button is-info is-inverted mx-1" mg-update="editItem" mg-context={['/contacts/items/' + i, url, '/form']}><span class="icon"><span class="material-icons">edit</span></span></UpdateButton>
                  <UpdateButton class="button is-danger is-inverted mx-1" mg-update="deleteItem" mg-context={[url, '/contacts', {totalCountHeader:'X-Total-Count'}]}><span class="icon"><span class="material-icons">delete</span></span></UpdateButton>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <Dialog mg-name="confirm" title="確認" message="削除しますよ？" />
      <Modal env={env} />
    </div>
  )
}

const containerEl = document.getElementById('app')
const {onUpdate} = start({data, schema, view, containerEl})

onUpdate({update:'loadItems', context:['/contacts', {totalCountHeader:'X-Total-Count'}]})