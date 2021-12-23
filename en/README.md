
# Unmagical

Unmagical is a web front-end framework that aims to build applications of up to medium size quickly.<br>
Unmagical has the following features: 

- It is written in TypeScript. You can build your application in JavaScript or TypeScript.
- It has an architecture similar to redux or Elm.
- It has a schema and validation modeled after JSON Schema and JSON Schame Validation.
- Based on [hyperapp](https://github.com/jorgebucaran/hyperapp) v1 (a view library similar to React.js), you can create pages in JSX.
- The update process ( updating the application state ) is promise-aware. You can write a single function to handle updates that mix domain data updates, UI updates, and external communication.
- It can be combined with any CSS framework. As a reference implementation, we provide a set of components that are combined with [bulma](https://bulma.io/).
- It has built-in validation rules, update processing, and external communication processing. A simple application can be completed just by combining them.
- It is written entirely in functional style, and you can benefit from it.
- Since the domain logic is cut out as a single function, it can be executed in Node.js.


## Architecture

![Concept diagram](../asset/architecture.png)

**Store** is a state of an application, and holds domain data and UI states.<br>
You can transit the application state by updating the store.<br>
Unlike redux, in Unmagical, we do not distinguish between the application state and the tore. You can think of the Store as an object that represents the application state.

The domain data is the data itself that you want to handle in your application, excluding any supplementary data that was added to make it a viable application.<br>
For example, in a TODO list application, the domain data would be the TODO list itself. In contrast, the supplementary data includes the contents of the dialog display, whether it is loading or not, the contents of validation errors, and so on.

In Unmagical, the domain data is a JSON data.

**View** is a screen of an application. It is described in JSX, and represented by VDOM (Virtual DOM) at an execution time.

**update** converts the store to a different state based on user input, etc.<br>
Although we call it "update" all together, it is actually a collection of functions, and each of these functions is called an **update function**.<br>
Unmagical comes with a number of built-in update functions, ranging from openDialog() to show a dialog to submit() to submit domain data.<br>
You can also define your own update functions for your application.

Example of a simple update function: 
```javascript
const updateNum = (sign, store) => {  // sign is either 1 or -1
    const difference = API.get('/difference', store)
    const num = API.get('/num', store)
    const updatedStore = API.replace('/num', num + sign * difference, store)
    return updatedStore
}
```
As shown above, the update function takes a store as well as other arguments and returns the updated store.

{% hint style='tip' %}
Since Unmagical is built in the functional style, Stores are immutable.<br>
Updating a store is represented by "creating a new Store and returning it as the result of the function"
{% endhint %}

**render** is a process of building a view from a store. Every application has one render function.<br>
This function is called whenever the Store changes, to make the View follow it.

In the render function, we usually use components, in the sense of React.js.<br>
When written using Unmagical's built-in component set, the bulma binding, the render function looks like this.

```javascript
const render = (store) => {
    return (
        <div class="container">
            <p>Num: {API.get('/num', store)}</p>
            <Field path="/difference" label="Difference">
                <Input path="/difference" />
            </Field>
            <UpdateButton update="updateNum" params={[-1]}>-</UpdateButton>
            <UpdateButton update="updateNum" params={[1]}>+</UpdateButton>
        </div>
    )
}
```
{% hint style='info' %}
If you want to use a component set other than bulma, you can use the play functions provided by Unmagical to create the component set of your choice. The bulma component set is also made using the play functions.
{% endhint %}

Domain data coming in from user input or update process will be subject to **validation**.<br>
Please provide Unmagical with a schema, a definition of what the data should look like, for your domain data. Unmagical's schema is modeled after JSON Schema. For example: 
```javascript
const schema = {
    type: 'object', 
    properties: {
        num: {type: 'integer'}, 
        difference: {type: 'integer', minimum: 0}
    }, 
    required: ['num', 'difference']
}
```
The validation of the domain data is done immediately after the update function is executed, and the result is also stored in the store. The stored validation results can also be displayed in the view.

**evolve** is the function to extend the domain data.<br>
If all that an application can do is accept user input, update the UI, restructure data, and communicate with the outside world, then the application may not be worth much. This is because, in the end, all it does is move data in and out.<br>
Instead, if the application uses the data it has to produce a completely different output, then it has its own value.

evolve is where you calculate the new domain data from the domain data you have. If you want your application to do some unique calculation, write it in the evolve function and pass it to Unmagical.<br>
Unmagical will then call the evolve function when it needs to.

Example of a simple evolve function: 
```javascript
// Calculate the average of the test scores. Very valuable.:)
const evolve = (store) => {
    const scores = API.get('/scores', store)  // Get scores from store
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length  // Calculate the average
    const evolvedStore = API.add('/average', average)  // Add the average to store
    return evolvedStore
}
```

{% hint style='tip' %}
As a matter of fact, evolve is treated like a pre-processing step for render in Unmagical.<br>
render is called every time the Store is updated, and it draws a similar screen over and over again. In the same way, evolve is called every time the Store is updated, and performs similar calculations over and over again.
{% endhint %}

{% hint style='info' %}
If you are creating an admin panel for your system, evolve will often not be needed.<br>
Also, in many cases, evolve is not needed for communication tools, such as contact forms.
{% endhint %}


## Differences from other software

We'll touch on how it differs from other choices, such as React.js and Vue.

Unlike React.js and Vue, Unmagical comes with a set of validation rules and a set of update functions.<br>
Unmagical is both a framework and a low-code tool, depending on how you look at it, and it tries to provide a one-stop solution for everything you need for application development.<br>
A simple application can be created by defining only three things: a schema, initial data and screen rendering (render function).

Another difference is that React.js and Vue are component-oriented, while Unmagical is application-oriented.<br>
With React.js and Vue, you create components as building blocks, and then combine them to create an application. In Unmagical, on the other hand, you only create monolithic applications, and you are not expected to combine any components.

{% hint style='tip' %}
Some of you may be worried when you hear, "At Unmagical, you don't make the components".<br>
So, what if I want to use a complex UI or a component that Unmagical doesn't support?

First of all, Unmagical has some built-in components that are not in the HTML5 standard but are often used. Specifically, it has a calendar, a color picker, and a list item sorter.

You can also use web components in Unmagical. half of the web components in [Shoelace](https://shoelace.style/) have been tested and work.<br>
As browsers become more and more compatible with web components, the use of web components will increase in the future. At that time, monolithic application-oriented approach will also become more popular in web application development.
{% endhint %}

## Installation

```console
npm install @vividcolors/unmagical
```
or
```console
yarn add @vividcolors/unmagical
```

You can also load it via CDN.
```html
<script src="https://cdn.jsdelivr.net/npm/@vividcolors/unmagical/asset/unmagical-bulma.js"></script>
```

