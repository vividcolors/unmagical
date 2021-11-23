
import {h, API, start, Input, Textarea, Listbox, Radio, Checkbox, UpdateButton, SettleButton, Field, Dialog, Notification, Progress, Pagination, Clickable, Modal} from '../../src/bindings/bulma'
import {createRestRepository} from '../../src/core/repository'
import {makeEntityListUpdates} from '../../src/core/updates'

const contactSchema = {
  type: 'object', 
  properties: {
    id: {type:'integer'}, 
    created: {type:'string'}, 
    name: {type:'string', notEmpty:true}, 
    email: {type:'string', notEmpty:true}, 
    content: {type:'string'}
  }
}

const searchSchema = {
  type: 'object', 
  properties: {
    name_like: {type:'string'}, 
    created_gte: {type:'string'}, 
    created_lte: {type:'string'}, 
    _page: {type:'integer'}, 
    _limit: {type:'integer'}
  }
}

const schema = {
  type: 'object', 
  properties: {
    contacts: {
      type: 'object', 
      properties: {
        query: searchSchema, 
        totalCount: {type:'integer'}, 
        items: {type: 'array', items: contactSchema}
      }
    }, 
    form: {
      type: 'object?', 
      properties: {
        method: {type:'string'}, 
        data: contactSchema
      }
    }, 
    search: searchSchema
  }
}

const data = {
  contacts: {
    query: {
      name_like: '', 
      created_gte: '', 
      created_lte: '', 
      _page: 1, 
      _limit: 6
    }, 
    totalCount: 0, 
    items: []
  }, 
  form: null, 
  search: {
    name_like: '', 
    created_gte: '', 
    created_lte: '', 
    _page: 1, 
    _limit: 6
  }
}

const updates = {
  ...makeEntityListUpdates(createRestRepository('http://localhost:3000/contacts'))
}

const ContactModal = ({env}) => {
  const form = API.extract('/form', env)
  if (! form) return null
  return (
    <Modal shown={true} key="contactModal" id="contactModal">
      <div class="modal-card">
        <div class="modal-card-head">
          <p class="modal-card-title">
            コンタクト
          </p>
        </div>
        <div class="modal-card-body">
          <Notification name="failure2" title="エラー" message="エラーが発生しました（{message}）" />
          <Field path="/form/data/id" env={env} label="ID">
            <div class="control">{form.data.id > 0 ? form.data.id : '（新規追加）'}</div>
          </Field>
          <Field path="/form/data/created" label="日時">
            <div class="control"><Input type="datetime-local" path="/form/data/created" /></div>
          </Field>
          <Field path="/form/data/name" label="名前">
            <div class="control"><Input path="/form/data/name" /></div>
          </Field>
          <Field path="/form/data/email" label="メールアドレス">
            <div class="control"><Input path="/form/data/email" /></div>
          </Field>
          <Field path="/form/data/content" label="本文">
            <div class="control"><Textarea path="/form/data/content" /></div>
          </Field>
        </div>
        <div class="modal-card-foot">
          <UpdateButton name="loading2" class="button is-primary" update="commitItem" context={['/form', '/contacts', {failureName:'failure2', loadingName:'loading2'}]}>確定</UpdateButton>
          <UpdateButton class="button" update="discardItem" context={['/form']}>キャンセル</UpdateButton>
        </div>
      </div>
    </Modal>
  )
}

const view = (env) => {
  const contacts = API.extract('/contacts', env)
  const from = (contacts.query._page - 1) * contacts.query._limit + 1
  const to = from + contacts.items.length - 1
  const tab = API.getPage("tab", env)
  return (
    <div class="container my-3">
      <Notification name="success" message="成功しました。" duration={5000} />
      <Notification name="failure" title="エラー" message="エラーが発生しました（{message}）" />
      <UpdateButton key="updateButton" class="button is-primary" update="createItem" context={[{id:0, created:'', name:'', email:'', content:''}, '/form']}>新規追加</UpdateButton>
      <nav class="level" key="search">
        <div class="level-left">
          <div class="level-item">{contacts.totalCount ? `${contacts.totalCount}件中 ${from}～${to}` : 'コンタクトはありません'}</div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <Input path="/search/name_like" placeholder="名前" />
          </div>
          <div class="level-item">
            <Input path="/search/created_gte" type="date" />～<Input path="/search/created_lte" type="date" />
          </div>
          <div class="level-item">
            <UpdateButton update="searchItems" context={["/search", "/contacts", {}]}>検索</UpdateButton>
          </div>
        </div>
      </nav>
      <Pagination width={1} pageProperty="_page" limitProperty="_limit" listPath="/contacts" loadItemsOptions={{totalCountHeader:'X-Total-Count', pageProperty:'_page'}} />
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
            return (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.created}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.content.replace('\n', '').slice(0, 10)}</td>
                <td>
                  <UpdateButton class="is-info is-inverted mx-1" update="editItem" context={['/contacts/items/' + i, '/form']}><span class="icon"><span class="material-icons">edit</span></span></UpdateButton>
                  <UpdateButton class="is-danger is-inverted mx-1" update="deleteItem" context={['/contacts/items/' + i, '/contacts', {}]}><span class="icon"><span class="material-icons">delete</span></span></UpdateButton>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <Dialog name="confirm" title="確認" message="削除しますよ？" />
      <ContactModal env={env} />
      <div key="tabs">
        <div class="tabs">
          <ul>
            <li class={tab == 0 ? 'is-active' : ''}><Clickable update="setPage" context={["tab", 0]}>概要</Clickable></li>
            <li class={tab == 1 ? 'is-active' : ''}><Clickable update="setPage" context={["tab", 1]}>詳細</Clickable></li>
          </ul>
        </div>
        {tab == 0 ? (
          <div>概要です。</div>
        ) : tab == 1 ? (
          <div>詳細です。</div>
        ) : null}
      </div>
    </div>
  )
}

const containerEl = document.getElementById('app')
const {onUpdate} = start({data, schema, view, containerEl, updates})

onUpdate({update:'loadItems', context:['/contacts', {}]})