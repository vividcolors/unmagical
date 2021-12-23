
import {h, API, start, Input, Select, Textarea, UpdateButton, Field, Dialog, Notification, Pagination, Clickable, Modal, makeRestRepository, makeEntityListUpdates, Store, StartParameter} from '../../src/unmagical-bulma'

const postSchema = {
  type: 'object', 
  properties: {
    id: {type: 'integer'}, 
    userId: {type: 'integer'}, 
    title: {type: 'string', notEmpty:true}, 
    body: {type:'string'}
  }
}

const searchSchema = {
  type: 'object', 
  properties: {
    title_like: {type:'string'}, 
    userId: {type:'integer?'}, 
    _page: {type:'integer'}, 
    _limit: {type:'integer'}
  }
}

const schema = {
  type: 'object', 
  properties: {
    posts: {
      type: 'object', 
      properties: {
        query: searchSchema, 
        totalCount: {type:'integer'}, 
        items: {type: 'array', items: postSchema}
      }
    }, 
    form: {
      type: 'object?', 
      properties: {
        method: {type:'string'}, 
        data: postSchema
      }
    }, 
    search: searchSchema
  }
}

type Post = {
  id: number, 
  userId: number, 
  title: string, 
  body: string
}
type Search = {
  title_like: string, 
  userId: number, 
  _page: number, 
  _limit: number
}
type Data = {
  posts: {
    query: Search, 
    totalCount: number, 
    items: Array<Post>
  }, 
  form: {
    method: string, 
    data: Post
  }, 
  search: Search
}

const data:Data = {
  posts: {
    query: {
      title_like: '', 
      userId: null, 
      _page: 1, 
      _limit: 6
    }, 
    totalCount: 0, 
    items: []
  }, 
  form: null, 
  search: {
    title_like: '', 
    userId: null, 
    _page: 1, 
    _limit: 6
  }
}

const updates = {
  ...makeEntityListUpdates(makeRestRepository('https://jsonplaceholder.typicode.com/posts'))
}

const PostModal = ({store}:{store:Store}) => {
  const form = API.get('/form', store) as Data["form"]
  if (! form) return null
  return (
    <Modal shown={true} key="postModal" id="postModal">
      <div class="modal-card">
        <div class="modal-card-head">
          <p class="modal-card-title">
            Post
          </p>
        </div>
        <div class="modal-card-body">
          <Notification name="failure2" title="Error" message="Error occurred: {message}" />
          <Field path="/form/data/id" store={store} label="ID">
            <div class="control">{form.data.id > 0 ? form.data.id : '(new)'}</div>
          </Field>
          <Field path="/form/data/userId" store={store} label="Author">
            <div class="control">
              <Select path="/form/data/userId">
                {Object.keys(userDb).map(id => (
                  <option value={id}>{userDb[id].name}</option>
                ))}
              </Select>
            </div>
          </Field>
          <Field path="/form/data/title" label="Title">
            <div class="control"><Input path="/form/data/title" /></div>
          </Field>
          <Field path="/form/data/body" label="Body">
            <div class="control"><Textarea path="/form/data/body" /></div>
          </Field>
        </div>
        <div class="modal-card-foot">
          <UpdateButton name="loading2" class="button is-primary" update="commitEntity" params={['/form', '/posts', {failureName:'failure2', loadingName:'loading2'}]}>Commit</UpdateButton>
          <UpdateButton class="button" update="discardEntity" params={['/form']}>Cancel</UpdateButton>
        </div>
      </div>
    </Modal>
  )
}

const generateParams = (listPath:string, page:number):any[] => {
  return [listPath, {totalCountHeader:'X-Total-Count', pageProperty:'_page', page}]
}

const render = (store:Store) => {
  const posts = API.get('/posts', store) as Data["posts"]
  const from = (posts.query._page - 1) * posts.query._limit + 1
  const to = from + posts.items.length - 1
  return (
    <div class="container my-3">
      <Notification name="success" message="Succeeded." duration={5000} />
      <Notification name="failure" title="Error" message="Error occurred: {message}" />
      <UpdateButton key="updateButton" class="button is-primary" update="makeEntity" params={[{id:0, userId:'', title:'', body:''}, '/form']}>Add New</UpdateButton>
      <nav class="level" key="search">
        <div class="level-left">
          <div class="level-item">{posts.totalCount ? `${from} to ${to} of ${posts.totalCount} items` : 'There are no posts.'}</div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <Input path="/search/title_like" placeholder="Title" />
          </div>
          <div class="level-item">
            <Select path="/search/userId">
              <option value="">Not selected</option>
              {Object.keys(userDb).map(id => (
                <option value={id}>{userDb[id].name}</option>
              ))}
            </Select>
          </div>
          <div class="level-item">
            <UpdateButton update="searchEntities" params={["/search", "/posts", {}]}>Search</UpdateButton>
          </div>
        </div>
      </nav>
      <Pagination width={1} pageProperty="_page" limitProperty="_limit" listPath="/posts" generateParams={generateParams} />
      <table class="table is-hoverable">
        <thead>
          <th>ID</th>
          <th>Author</th>
          <th>Title</th>
          <th>Body</th>
          <th> </th>
        </thead>
        <tbody>
          {posts.items.map((c, i) => {
            return (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{userDb[c.userId] ? userDb[c.userId].name : ''}</td>
                <td>{c.title}</td>
                <td>{c.body.replace('\n', '').slice(0, 10)}</td>
                <td>
                  <UpdateButton class="is-info is-inverted mx-1" update="editEntity" params={['/posts/items/' + i, '/form']}><span class="icon"><span class="material-icons">edit</span></span></UpdateButton>
                  <UpdateButton class="is-danger is-inverted mx-1" update="deleteEntity" params={['/posts/items/' + i, '/posts', {}]}><span class="icon"><span class="material-icons">delete</span></span></UpdateButton>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <Dialog name="confirm" title="Confirmation" message="Delete a post. Are you sure?" />
      <PostModal store={store} />
    </div>
  )
}

const containerEl = document.getElementById('app')
const {onUpdate} = start({data, schema, render, containerEl, updates})

let userDb = {}
fetch('https://jsonplaceholder.typicode.com/users')
  .then(response => response.json())
  .then(json => {
    json.map(user => {
      userDb[user.id] = {id:user.id, name:user.name}
    })
  })

onUpdate({update:'loadEntities', params:['/posts', {}]})