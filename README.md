
# Unmagical

Unmagical is a web front-end framework that aims to build applications of up to medium size at high speed.
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

## Documentation

I'll write about it someday.  
For now, take a look at some of the demos in the repository.

## License

[MIT](LICENSE)