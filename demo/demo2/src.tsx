import {h, API, start, Input, Textarea, Range, Rating, Select, Radio, Checkbox, Switch, ColorPicker, UpdateButton, UpdateIconButton, SettleButton, Dialog, Alert, Drawer, Spinner} from './shoelace'
import {makeRestRepository} from '../../src/core/rest'
import {submit, reset} from '../../src/core/updates'
import {StartParameter} from '../../src/core/framework'

const schema = {
  type: 'object', 
  properties: {
    name: {type: 'string', notEmpty:true}, 
    content: {type: 'string', notEmpty:true}, 
    hours: {type: 'integer'}, 
    rating: {type: 'number'}, 
    position: {type: 'string', notEmpty:true, enum:['option-1', 'option-2']}, 
    sex: {type: 'string', notEmpty:true, enum:['male', 'female']}, 
    agree: {type: 'boolean'}, 
    home: {type: 'boolean'}, 
    bgcolor: {type: 'string', notEmpty:true}, 
    dummy: {type:'object', properties:{i:{type:'integer'} }} 
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
  dummy: {i:1}
}

const updates = {
  failureSubmit: submit(makeRestRepository('https://www.vividcolors.co.jp/false')), 
  reset
}

// TODO: Menu

const messageProps = {style:{color:"#FF0000"}}
const callOnUpdate = (x) => onUpdate(x)
const render = (store) => {
  return (
    <sl-form novalidate>
      <Input path="/name" label="お名前" messageProps={messageProps}>
        <sl-icon name="house" slot="prefix"></sl-icon>
        <div slot="help-text">Your Name.</div>
      </Input>
      <Textarea path="/content" label="通信欄" messageProps={messageProps}>
        <div slot="help-text">何でもどうぞ。</div>
      </Textarea>
      <Range path="/hours" label="睡眠時間" messageProps={messageProps} min="4" max="12" step="1">
        <div slot="help-text">二度寝はナシで。</div>
      </Range>
      <Rating path="/rating" key="rating" />
      <Select path="/position" label="オプション" messageProps={messageProps}>
        <sl-menu-item value="option-1">Option 1</sl-menu-item>
        <sl-menu-item value="option-2">Option 2</sl-menu-item>
        <sl-menu-item value="option-3">Invalid Option 3</sl-menu-item>
        <div slot="help-text">選んでよ！</div>
      </Select>
      <sl-radio-group label="生別">
        <Radio path="/sex" value="male">男</Radio>
        <Radio path="/sex" value="female">女</Radio>
        <Radio path="/sex" value="other">どちらとも言えない</Radio>
      </sl-radio-group>
      <div><Checkbox path="/agree">私たちの声明に同意する</Checkbox></div>
      <div><Switch path="/home">ホームボタンを表示する</Switch></div>
      <div><ColorPicker path="/bgcolor" /></div>
      <div>
        <UpdateButton name="loading" update="failureSubmit" params={["add", {path:"/dummy", errorSelector:":invalid", method:"POST"}]}>送信(失敗)</UpdateButton>
        <UpdateIconButton name="x-circle" update="reset" params={[data, {}]} />
        <UpdateButton update="toggleSwitch" params={["drawer"]}>Open Drawer</UpdateButton>
        <UpdateButton update="openProgress" params={['spinner', null]}>Show Progress</UpdateButton>
        <UpdateButton update="closeProgress" params={['spinner']}>Hide Progress</UpdateButton>
      </div>
      <Dialog key="confirm" name="confirm" label="確認" message="リセットします。いいですか？" />
      <Alert key="success" name="success" type="success" message="やりました！" closable sl-duration={5000} onUpdate={callOnUpdate} />
      <Alert key="failure" name="failure" type="danger" message="エラーが発生しました（{message}）" closable onUpdate={callOnUpdate} />
      <Drawer key="drawer" name="drawer" onUpdate={callOnUpdate}>
        ドロワーです。
      </Drawer>
      <Spinner key="spinner" name="spinner" />
    </sl-form>
  )
}

console.log(updates)
const containerEl = document.getElementById('app')
const {onUpdate} = start({schema, data, render, containerEl, updates})