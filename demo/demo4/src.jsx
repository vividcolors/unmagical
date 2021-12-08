
const {h, API, start, Input, Textarea, Select, Radio, Checkbox, Field, UpdateButton, DeleteButton, Clickable, SettleButton, Dialog, Notification, Progress, Modal, Pagination, DatePicker, ColorPicker, ReorderableList, ListItem, makeRestRepository, makeStorageRepository, makeEntityListUpdates, makeEntityUpdates, validate, defaultRules, defaultCatalog, normalizeError} = unmagical

const todoSchema = {
  type: 'object', 
  properties: {
    id: {type:'integer'}, 
    done: {type:'boolean'}, 
    subject: {type:'string', notEmpty:true}, 
    context: {type:'string', notEmpty:true, enum:['home', 'work']}
  }
}

const schema = {
  type: 'object', 
  properties: {
    todos: {
      type: 'array', 
      items: todoSchema
    }, 
    form: {
      type: 'object?', 
      properties: {
        method: {type: 'string'}, 
        action: {type: 'string'}, 
        data: todoSchema
      }
    }, 
    nextId: {type: 'integer'}
  }
}

const initialData = {
  todos: [
    {id:1, done:false, subject:'牛乳を買う', context:'home'}, 
    {id:2, done:false, subject:'お金をおろす', context:'work'}
  ], 
  form: null, 
  nextId: 3
}

const updates = {
  ...makeEntityUpdates(makeStorageRepository(localStorage, 'todos'))
}

const TodoItem = (({path, editing, store, ...props}) => {
  const id = API.get(path + '/id', store)
  const handleStyle = editing ? {pointerEvents:'none', opacity:0.26} : {}
  return (
    <ListItem tag="div" class="list-item" key={'item-'+id} id={id} {...props}>
      <div class="list-item-image">
        <div class="columns is-gapless is-vcentered is-mobile">
          <div class="column">
            <span class={`icon is-medium my-1 ${editing ? '' : 'handle'}`}><span class="material-icons" style={handleStyle}>drag_handle</span></span>
          </div>
          <div class="column">
            <Checkbox class="px-2 py-1" path={path + '/done'} />
          </div>
        </div>
      </div>
      <div class="list-item-content">
        <p class="py-2 is-fullwidth">
          <Clickable style={{cursor:'pointer'}} update="editPart" params={[path, '/form']}>{API.get(path + '/subject', store)} @{API.get(path + '/context', store)}</Clickable>
        </p>
      </div>
      <div class="list-item-controls">
        <UpdateButton class="is-info is-inverted mx-1" update="copyPart" params={[path, '/nextId', {}]}><span class="icon"><span class="material-icons">content_copy</span></span></UpdateButton>
        <UpdateButton class="is-danger is-inverted mx-1" update="removePart" params={[path, {}]}><span class="icon"><span class="material-icons">delete</span></span></UpdateButton>
      </div>
    </ListItem>
  )
})

const TodoForm = ({store}) => {
  const id = API.get('/form/data/id', store)
  return (
    <ListItem tag="div" class="list-item" key={`item-${id}`} id={id}>
      <div class="list-item-image">
        <div class="columns is-gapless is-vcentered is-mobile">
          <div class="column">
            <span class="icon is-medium my-1"><span class="material-icons" style={{pointerEvents:'none', opacity:0.26}}>drag_handle</span></span>
          </div>
          <div class="column">
            <Checkbox class="px-2 py-1" path="/form/data/done" />
          </div>
        </div>
      </div>
      <div class="list-item-content">
        <div class="columns">
          <div class="column">
            <Field path="/form/data/subject">
              <Input path="/form/data/subject" class="input" type="text" />
            </Field>
          </div>
          <div class="column">
            <Field path="/form/data/context">
              <Select path="/form/data/context">
                <option value="" disabled></option>
                <option value="home">home</option>
                <option value="work">work</option>
              </Select>
            </Field>
          </div>
        </div>
      </div>
      <div class="list-item-controls">
        <UpdateButton class="is-primary is-inverted mx-1" update="commitPart" params={['/form', '/nextId', {}]}><span class="icon"><span class="material-icons">check</span></span></UpdateButton>
        <UpdateButton class="is-danger is-inverted mx-1" update="discardPart" params={['/form']}><span class="icon"><span class="material-icons">clear</span></span></UpdateButton>
      </div>
    </ListItem>
  )
}

const TodoButton = () => {
  return (
    <div class="media" key="add">
      <div class="media-content">
        <UpdateButton class="is-primary" update="makePart" params={['/todos/-', {id:0, done:false, subject:'', context:''}, '/form']}>追加</UpdateButton>
      </div>
    </div>
  )
}

const render = (store) => {
  const form = API.get('/form', store)
  return (
    <div class="container my-3">
      <Notification name="success" message="保存しました。" duration={5000} />
      <Notification name="failure" title="エラー" message="エラーが発生しました（{message}）" />
      <UpdateButton type="button" update="submit" params={["replace", {path:""}]} name="loading">ローカルに保存</UpdateButton>
      <ReorderableList tag="div" class="list has-visible-pointer-controls" name="todos" path="/todos" options={{group:'todos', handle:'.handle'}}>
        {API.get('/todos', store).map((item, i) => {
          const path = '/todos/' + i
          return (form && form.action == path) ? <TodoForm store={store} /> : <TodoItem path={path} editing={!!form} store={store} />
        })}
      </ReorderableList>
      {(form && form.action.endsWith('-')) ? <TodoForm store={store} /> : <TodoButton />}
      <Dialog name="confirm" title="確認" message="このTODOを削除します。よろしいですか？" hideCancelButton={false} />
    </div>
  )
}

const getData = () => {
  const savedData = localStorage.getItem('todos')
  const data = savedData ? JSON.parse(savedData) : initialData
  return data
}

const containerEl = document.getElementById('app')
const {onUpdate} = start({data:getData(), schema, render, containerEl, updates})
