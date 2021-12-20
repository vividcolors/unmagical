
# Unmagical

UnmagicalはWebフロントエンドのフレームワークです。<br>
中規模までのアプリケーションを、高速に構築することを目的にしています。<br>
Unmagicalには下記のような特徴があります：

- TypeScriptで書かれています。あなたはJavaScriptかTypeScriptでアプリケーションを作れます
- reduxやElmに似たアーキテクチャを持っています
- JSON SchemaとJSON Schame Validationをお手本にしたスキーマとバリデーションがあります
- hyperapp v1（React.jsに似たビューライブラリ）をベースにしていて、あなたは画面をJSXで作れます
- アップデート処理（アプリケーション状態の更新）がプロミスに対応しています。あなたはドメインデータの更新・UIの更新・外部通信が混在するアップデート処理を関数1つで記述できます
- 任意のCSSフレームワークと組み合わせられます。参考実装として、[bulma](https://bulma.io/)に結合させたコンポーネントセットを提供しています
- 組み込みのバリデーションルール・アップデート処理・外部通信処理を備えていて、簡単なアプリケーションならそれらを組み合わせるだけで完成します
- 全面的に関数型スタイルで記述されていて、その恩恵を受けられます
- ドメインロジックを単一の関数として切り出せ、これをNode.jsで実行することもできます


## アーキテクチャ

![概念図](../asset/architecture.png)

**Store**はアプリケーションのデータで、ドメインデータやUIの状態を保持しています。<br>
このStoreを更新すればアプリケーションを別の状態に遷移させられます。<br>
reduxとは違って、Unmagicalではアプリケーションの状態とStoreを区別しません。「アプリケーションの状態を表現するオブジェクトがStoreである」と考えてもいいでしょう。

ドメインデータとは、そのアプリケーションで取り扱いたいデータそのもの、アプリケーションとして成立させるために追加された補足的なデータを除外したものです。<br>
たとえば、TODOリストのアプリケーションでは、ドメインデータはTODOリストそのものになります。対して、補足的なデータには、ダイアログの表示内容、ローディングかどうか、バリデーションエラーの内容、などがあります。

Unmagicalでは、ドメインデータはJSONデータです。

**View**はアプリケーションの画面です。JSXで記述され、実行時にはVDOM（仮想DOM）で表現されます。

**update**はユーザー入力等にもとづいてStoreを別の状態に変換します。<br>
アップデートとひとまとめに呼んでいますが実際は関数の集合体で、それら個々の関数を**アップデート関数**と呼びます。<br>
Unmagicalには組み込みのアップデート関数が用意されていて、ダイアログを表示するopenDialog()からドメインデータをサブミットするsubmit()までたくさんあります。<br>
アプリケーション独自のアップデート関数を定義することもできます。

簡単なアップデート関数の例：
```javascript
const updateNum = (sign, store) => {  // signは-1か1
    const difference = API.get('/difference', store)
    const num = API.get('/num', store)
    const updatedStore = API.replace('/num', num + sign * difference, store)
    return updatedStore
}
```
上記のようにアップデート関数は、他の引数と同時にストアを受け取り、更新されたストアを返します。

{% hint style='tip' %}
Unmagicalは関数型スタイルで作られているので、Storeはイミュータブル（不変）です。<br>
Storeの更新は「新しいStoreを作って、関数の結果として返却すること」で表現されます。
{% endhint %}

**render**はStoreからViewを構築する処理です。アプリケーションには常にrender関数が1つあります。<br>
この関数は、Storeが変わるたびに、Viewをそれに追従させるために呼ばれます。

render関数の中では通常（React.jsで使うような）コンポーネントを使います。<br>
Unmagicalの組み込みのコンポーネントセット（bulmaバインディング）を使って書くと、render関数は次のようになります。
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
bulma以外のコンポーネントセットを使いたい場合は、Unmagicalから提供されているplay関数群を使って好みのコンポーネントセットを作れます。各play関数は、HTMLのタグに特定の役割を与える効果を持っています。bulmaコンポーネントセットも、play関数を使って作られています。
{% endhint %}

ユーザー入力やupdate処理から入ってきたドメインデータは**バリデーション**の対象になります。<br>
ドメインデータのスキーマ（データの形を定義したもの）をUnmagicalに提供してください。UnmagicalのスキーマはJSON Schemaをお手本に作られています。たとえば、次のようなものです。
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
ドメインデータのバリデーションはupdate関数の実行直後に行われ、その結果もストアの中に保存されます。保存されたバリデーション結果をビューに表示することもできます。

**evolve**はStoreを拡張する関数です。<br>
もしあるアプリケーションに出来ることが、ユーザーの入力を受け付け、UIを更新し、データを再構成し、外部と通信することだけだったら、そのアプリケーションの価値は乏しいかもしれません。なぜなら、結局のところそれはデータの出し入れしかしていないからです。<br>
そうでなく、アプリケーションが手持ちのデータを駆使してまったく別の出力をしたら、それには独自の価値があります。

evolveは、手持ちのドメインデータから新しいドメインデータを計算する場所です。アプリケーションに何か独自の計算をさせたい場合は、それをevolve関数に記述してUnmagicalに渡してください。<br>
Unmagicalは必要なタイミングでevolve関数を呼び出すようになります。

簡単なevolve関数の例：
```javascript
// テストの点数の平均値を計算します。非常に価値がある:)
const evolve = (store) => {
    const scores = API.get('/scores', store)  // ドメインデータからscoresを取得
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length  // 平均値を計算
    const evolvedStore = API.add('/average', averate)  // 平均値をドメインデータに追加
    return evolvedStore
}
```

{% hint style='tip' %}
実際のところ、evolveはUnmagicalの中でrenderの前処理のように扱われます。<br>
renderはStoreが更新される度に呼ばれて、似たような画面の描画を何度も何度も行います。それと同じように、evolveもStoreが更新される度に呼ばれて、似たような計算を何度も何度も行います。
{% endhint %}

{% hint style='info' %}
システムの管理画面を作るときにはevolveは不要になることが多いでしょう。<br>
また、お問い合わせフォームのようなコミュニケーションツールでもevolveが不要なケースが多いです。
{% endhint %}

## 他の選択肢との違い

React.jsやVueのような、他の選択肢との違いについて触れます。

React.jsやVueとは違って、Unmagicalはバリデーションルール群やアップデート関数群が付属しています。<br>
Unmagicalはフレームワークであり、見ようによってはローコードツールでもあり、アプリケーション開発に必要なものをワンストップに近い形で提供しようとしています。<br>
簡単なアプリケーションは、スキーマ、初期データと画面描画（render関数）の3つを定義するだけで作れます。

また、React.jsやVueがコンポーネント指向なのに対して、Unmagicalはアプリケーション指向である点も違います。<br>
React.jsやVueでは、あなたはコンポーネントを構成単位として作り、それらを組み合わせることでアプリケーションを作り上げます。対してUnmagicalでは、あなたが作るのはモノリシックなアプリケーションだけで、何か部品のようなものを組み合わせることは想定していません。

{% hint style='tip' %}
「Unmagicalでは、あなたは部品を作らない」と聞いて不安になった方もいるかもしれません。<br>
「では、複雑なUIや、Unmagicalが対応してない部品が使いたくなったらどうすればいいのか」と。

まず、UnmagicalはHTML5標準には無いがよく使われる部品をいくつか組み込みで持っています。具体的には、カレンダーとカラーピッカーとリストアイテムの並べ替えです。

また、UnmagicalでWebコンポーネントを使うこともできます。[Shoelace](https://shoelace.style/)のWebコンポーネントの半分近くは動作確認済みです。<br>
ブラウザのWebコンポーネントへの対応が進むにつれ、今後はWebコンポーネントの利用も増えていきます。そのときのWebアプリケーション開発では、モノリシックなアプリケーション指向という手法も有力になるでしょう。
{% endhint %}

## インストール

ローカルにインストールする場合。

```
npm install unmagical
```

または

```
yarn add unmagical
```

CDNでブラウザに直接読み込ませる場合。

```
<script src="//cdn.jsdelivr.net/npm/..."></script>
```
