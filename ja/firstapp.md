
# Writing Your First App

**書き途中です。**

この記事では、実際にUnmagicalでアプリケーションを作ります。<br>
最低限のことから始めて、少しずつ発展させていきます。

## HTMLファイル

まずはHTMLファイルを準備しましょう。<br>
jsxをブラウザ上でjavascriptにコンパイルするために、Babelを使います。<br>
以下のコードをindex.htmlとして保存します。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
  </head>
  <body>
    <div id="app"></div>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src=".../unmagical-bulma.js"></script>
    <script type="text/babel" src="src.jsx" data-presets="env-unmagical"></script>
  </body>
</html>
```

- 6行目：bulmaのCSSを読み込みます。
- 9行目：アプリケーションのコンテナ要素です。この中にアプリケーションが描画されます。
- 10行目：Babelを読み込みます。
- 11行目：Unmagical（bulmaバインディング）を読み込みます。
- 12行目：アプリケーションのソースファイル（jsx）を読み込みます。

10行目から12行目は、それぞれ依存関係がありますので、この順番を守ってください。

## アプリケーションの雛形

```jsx
```