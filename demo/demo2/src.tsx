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
      <Input path="/name" label="Name" messageProps={messageProps}>
        <sl-icon name="house" slot="prefix"></sl-icon>
        <div slot="help-text">Your Name.</div>
      </Input>
      <Textarea path="/content" label="Message" messageProps={messageProps}>
        <div slot="help-text">Please write whatever you like.</div>
      </Textarea>
      <Range path="/hours" label="Sleep time" messageProps={messageProps} min="4" max="12" step="1">
        <div slot="help-text">Sleeping twice is not good.</div>
      </Range>
      <Rating path="/rating" key="rating" />
      <Select path="/position" label="Options" messageProps={messageProps}>
        <sl-menu-item value="option-1">Option 1</sl-menu-item>
        <sl-menu-item value="option-2">Option 2</sl-menu-item>
        <sl-menu-item value="option-3">Invalid Option 3</sl-menu-item>
        <div slot="help-text">Please select!</div>
      </Select>
      <sl-radio-group label="Sex">
        <Radio path="/sex" value="male">Male</Radio>
        <Radio path="/sex" value="female">Female</Radio>
        <Radio path="/sex" value="other">Not sure</Radio>
      </sl-radio-group>
      <div><Checkbox path="/agree">I agree with our statement.</Checkbox></div>
      <div><Switch path="/home">Display the home button</Switch></div>
      <div><ColorPicker path="/bgcolor" /></div>
      <div>
        <UpdateButton name="loading" update="failureSubmit" params={["add", {path:"/dummy", errorSelector:":invalid", method:"POST"}]}>Submit (will fail)</UpdateButton>
        <UpdateIconButton name="x-circle" update="reset" params={[data, {}]} />
        <UpdateButton update="toggleSwitch" params={["drawer"]}>Open Drawer</UpdateButton>
        <UpdateButton update="openProgress" params={['spinner', null]}>Show Progress</UpdateButton>
        <UpdateButton update="closeProgress" params={['spinner']}>Hide Progress</UpdateButton>
      </div>
      <Dialog key="confirm" name="confirm" label="Confirmation" message="Reset the form. Are you sure?" />
      <Alert key="success" name="success" type="success" message="We did it!" closable sl-duration={5000} onUpdate={callOnUpdate} />
      <Alert key="failure" name="failure" type="danger" message="Error occurred: {message}" closable onUpdate={callOnUpdate} />
      <Drawer key="drawer" name="drawer" onUpdate={callOnUpdate}>
        Hi, here a drawer is.
      </Drawer>
      <Spinner key="spinner" name="spinner" />
    </sl-form>
  )
}

console.log(updates)
const containerEl = document.getElementById('app')
const {onUpdate} = start({schema, data, render, containerEl, updates})