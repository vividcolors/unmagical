import {h, API, start, Input, Textarea, Range, Rating, Select, Radio, Checkbox, Switch, ColorPicker, UpdateButton, UpdateIconButton, SettleButton, Dialog, Alert, Drawer, Spinner} from '../../src/bindings/shoelace'

const schema = {
  type: 'object', 
  properties: {
    name: {type: 'string', minLength:1}, 
    content: {type: 'string', minLength:1}, 
    hours: {type: 'integer'}, 
    rating: {type: 'number'}, 
    position: {type: 'string', enum:['option-1', 'option-2']}, 
    sex: {type: 'string', enum:['male', 'female']}, 
    agree: {type: 'boolean'}, 
    home: {type: 'boolean'}, 
    bgcolor: {type: 'string', minLength:1}, 
    dummy: {type:'integer'}
  }
}

const data = {
  name: '', 
  content: '', 
  hours: null, 
  rating: null, 
  position: '', 
  sex: '', 
  agree: false, 
  home: false, 
  bgcolor: '', 
  dummy: 1
}

// TODO: Menu

const messageProps = {style:{color:"#FF0000"}}
const view = (env) => {
  console.log('view', env)
  return (
    <sl-form novalidate>
      <Input mg-path="/name" label="お名前" messageProps={messageProps}>
        <sl-icon name="house" slot="prefix"></sl-icon>
        <div slot="help-text">Your Name.</div>
      </Input>
      <Textarea mg-path="/content" label="通信欄" messageProps={messageProps}>
        <div slot="help-text">何でもどうぞ。</div>
      </Textarea>
      <Range mg-path="/hours" label="睡眠時間" messageProps={messageProps} min="4" max="12" step="1">
        <div slot="help-text">二度寝はナシで。</div>
      </Range>
      <Rating mg-path="/rating" key="rating" />
      <Select mg-path="/position" label="オプション" messageProps={messageProps}>
        <sl-menu-item value="option-1">Option 1</sl-menu-item>
        <sl-menu-item value="option-2">Option 2</sl-menu-item>
        <sl-menu-item value="option-3">Invalid Option 3</sl-menu-item>
        <div slot="help-text">選んでよ！</div>
      </Select>
      <sl-radio-group label="生別">
        <Radio mg-path="/sex" value="male">男</Radio>
        <Radio mg-path="/sex" value="female">女</Radio>
        <Radio mg-path="/sex" value="other">どちらとも言えない</Radio>
      </sl-radio-group>
      <div><Checkbox mg-path="/agree">私たちの声明に同意する</Checkbox></div>
      <div><Switch mg-path="/home">ホームボタンを表示する</Switch></div>
      <div><ColorPicker mg-path="/bgcolor" /></div>
      <div>
        <UpdateButton mg-name="loading" mg-update="submit" mg-context={["http://localhost:3000/", {path:"/dummy", errorSelector:":invalid", method:"POST"}]}>送信</UpdateButton>
        <UpdateIconButton name="x-circle" mg-update="reset" mg-context={[data]} />
        <UpdateButton mg-update="toggleSwitch" mg-context={["drawer"]}>Open Drawer</UpdateButton>
        <UpdateButton mg-update="openProgress" mg-context={['spinner', null]}>Show Progress</UpdateButton>
        <UpdateButton mg-update="closeProgress" mg-context={['spinner']}>Hide Progress</UpdateButton>
      </div>
      <Dialog key="confirm" mg-name="confirm" label="確認" message="リセットします。いいですか？" />
      <Alert key="success" mg-name="success" type="success" message="やりました！" closable duration="5000" />
      <Alert key="failure" mg-name="failure" type="danger" message="エラーが発生しました（{name}: {message}）" closable />
      <Drawer key="drawer" mg-name="drawer" onUpdate={onUpdate}>
        ドロワーです。
      </Drawer>
      <Spinner key="spinner" mg-name="spinner" />
    </sl-form>
  )
}

const containerEl = document.getElementById('app')
const {onUpdate} = start({schema, data, view, containerEl})