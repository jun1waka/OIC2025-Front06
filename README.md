# OIC2025-Front06
# 気象庁データ表示プログラム 仕様書兼開発手順書

## 1. はじめに
このドキュメントは、JavaScriptを使って外部APIから気象データを取得し、Webページ上のテーブルに表示するプログラムの開発手順を学ぶためのものです。
完成形として、気象庁のデータをCSV形式で取得し、HTMLのテーブルに整形して表示するWebアプリケーションを作成します。

### 1.1. 完成形のイメージ
- Webページには「気象庁データ」という見出しと、データが表示されるテーブルがあります。
- データは外部サイトから動的に取得され、テーブル形式で表示されます。
- テーブルの各列には、データの項目名（ヘッダー）が表示されます。
- テーブルの最終行には、各列のデータの平均値が計算されて表示されます。

### 1.2. 学習の目的
- HTML、CSS、JavaScriptの基本的な連携を理解する。
- `fetch` API を使った非同期通信によるデータ取得方法を学ぶ。
- 取得したデータをJavaScriptで加工し、DOM操作によってWebページに動的に表示する技術を習得する。
- 少し複雑なデータ処理（二次元配列の操作、平均値の計算）に挑戦する。

---

## 2. 開発手順

### Step 1: HTMLでページの骨格を作成しよう
まずは、データを表示するための基本的なHTMLファイルを作成します。

- **課題**
  - ページのタイトルを「気象庁データ表示」に設定してください。
  - `h1` タグを使って「気象庁データ」という見出しを表示してください。
  - データを表示するための `table` 要素を、`id="weather-table"` というIDで作成してください。
  - `css/style.css` と `js/app.js` を読み込むように設定してください。

- **考え方のヒント**
  - HTMLの基本的な構造 (`<!DOCTYPE html>`, `html`, `head`, `body`) を思い出してみましょう。
  - CSSを読み込むには `<link>` タグ、JavaScriptを読み込むには `<script>` タグを使います。ファイルのパスに注意してください。

- **解法 (`index.html`)**
  ```html
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>気象庁データ表示</title>
    <link rel="stylesheet" href="css/style.css">
  </head>
  <body>
    <h1>気象庁データ</h1>
    <table id="weather-table"></table>
    <script src="js/app.js"></script>
  </body>
  </html>
  ```

### Step 2: CSSで見た目を整えよう
次に、作成したHTML要素をCSSで見やすくスタイリングします。

- **課題**
  - テーブルのボーダー（枠線）を分かりやすく表示してください。
  - テーブルのヘッダー部分の背景色を変えて、データ部分と見分けがつくようにしてください。
  - 全体の横幅いっぱいにテーブルが表示されるようにしてください。

- **考え方のヒント**
  - `border-collapse: collapse;` を使うと、テーブルのセルの枠線を1本にまとめることができます。
  - `width: 100%;` で要素の幅を親要素いっぱいに広げられます。
  - ヘッダーは `th` タグ、データは `td` タグです。それぞれのスタイルを設定しましょう。

- **解法 (`css/style.css`)**
  ```css
  body {
    font-family: Arial, sans-serif;
  }
  
  h1 {
    text-align: center;
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
  }
  
  table, th, td {
    border: 1px solid black;
    padding: 8px;
  }
  
  th {
    background-color: #f2f2f2;
  }
  ```

### Step 3: JavaScriptで外部からデータを取得しよう
いよいよJavaScriptを使い、外部APIからデータを取得します。ここがこのプログラムの核となる部分です。

- **課題**
  - `https://rimgate.net/kisyou.php` というURLから`fetch` APIを使ってデータを取得してください。
  - 取得に成功したら、コンソールに **取得した生のテキストデータ** を表示して、どのようなデータか確認してください。
  - 取得に失敗した場合は、コンソールにエラーメッセージを表示してください。

- **考え方のヒント**
  - `fetch()` は非同期処理です。成功した後の処理は `.then()` でつなぎます。
  - `fetch()` が返す `Response` オブジェクトからテキストデータを取り出すには、`.text()` メソッドを使います。これも非同期処理なので、さらに `.then()` でつなぎます。
  - エラー処理は `.catch()` を使います。

- **解法 (`js/app.js` の第一段階)**
  ```javascript
  // 表示対象のテーブル要素をあらかじめ取得しておく
  const table = document.getElementById('weather-table');
  
  fetch('[https://rimgate.net/kisyou.php](https://rimgate.net/kisyou.php)')
    .then(response => {
      // 通信が成功したかチェック
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text(); // レスポンスをテキストとして解析
    })
    .then(data => {
      // 成功した場合の処理
      console.log('--- 取得した生データ ---');
      console.log(data); 
    })
    .catch(error => {
      // 失敗した場合の処理
      console.error('データの取得に失敗しました:', error);
    });
  ```

### Step 4: 取得したテキストデータをプログラムで扱える形に変換しよう
取得したデータは、ただの長い文字列（CSV形式）です。これを1行ごと、さらに1セルごとに分割して、プログラムで扱いやすい「二次元配列」に変換します。

- **課題**
  - 取得したテキストデータを改行文字 (`\n`) で分割し、行ごとの配列を作成してください。
  - 作成した行ごとの配列をコンソールに表示して確認してください。
  - (発展) 配列の最後に空の要素が残る場合があります。`filter` メソッドを使って、空の行を取り除いてみましょう。

- **考え方のヒント**
  - 文字列を特定の文字で分割するには `split()` メソッドが便利です。
  - `console.log()` をこまめに使って、データが今どんな形になっているかを確認しながら進めるのが、プログラミング上達のコツです。

- **解法 (`js/app.js` の `then` ブロック内)**
  ```javascript
  // ... .then(data => { の中身
  
  // データを改行で分割して配列にする
  const lines = data.split('\n');
  console.log('--- 改行で分割した配列 ---');
  console.log(lines);
  
  // (発展) 空の行を除外する
  const filteredLines = lines.filter(line => line.trim() !== '');
  console.log('--- 空行を除外した配列 ---');
  console.log(filteredLines);
  ```

### Step 5: データからテーブルのヘッダーを作成しよう
二次元配列の1行目は、テーブルのヘッダー（項目名）です。これを使って`<thead>`部分を動的に作成します。

- **課題**
  - 行の配列の最初の要素（`lines[0]`）をカンマ (`,`) で分割し、ヘッダー項目の配列を作成してください。
  - ヘッダー項目の配列をループで処理し、各項目を `<th>` 要素として生成し、テーブルの `<thead>` に追加してください。

- **考え方のヒント**
  - `document.createElement()` でHTML要素を生成します。
  - `element.textContent` で要素内のテキストを設定します。
  - `parentElement.appendChild(childElement)` でHTMLの親子関係を構築します。
  - `<thead>` -> `<tr>` -> `<th>` という階層構造になるように組み立てます。

- **解法 (`js/app.js` の `then` ブロック内)**
  ```javascript
  // ... .then(data => { の中身
  const lines = data.split('\n').filter(line => line.trim() !== '');
  
  // 1行目(ヘッダー)をカンマで分割
  const headerRowData = lines[0].split(',');
  
  // theadとtr要素を作成
  const thead = document.createElement('thead');
  const headerTr = document.createElement('tr');
  
  // ヘッダーの各項目に対してth要素を作成
  headerRowData.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerTr.appendChild(th);
  });
  
  // 組み立てた要素をDOMに追加
  thead.appendChild(headerTr);
  table.appendChild(thead);
  ```

### Step 6: データからテーブルの本体を作成しよう
二次元配列の2行目以降が、実際のデータです。これを使って`<tbody>`部分を作成します。

- **課題**
  - 行の配列の2行目以降（`lines[1]`から最後まで）をループで処理してください。
  - 各行をさらにカンマ (`,`) で分割し、`<td>` 要素を生成してください。
  - 生成した `<td>` を `<tr>` にまとめ、テーブルの `<tbody>` に追加してください。

- **考え方のヒント**
  - `for` ループや `forEach` を使って配列を処理します。今回は入れ子（ネスト）構造になります。
  - 外側のループで `<tr>` を作り、内側のループで `<td>` を作って `<tr>` に追加していくイメージです。

- **解法 (`js/app.js` の `then` ブロック内)**
  ```javascript
  // ... Step 5 の続き
  const tbody = document.createElement('tbody');
  
  // 2行目以降のデータをループ
  for (let i = 1; i < lines.length; i++) {
    const rowData = lines[i].split(',');
    const tr = document.createElement('tr');
  
    // 各行のセルデータをループ
    rowData.forEach(cellData => {
      const td = document.createElement('td');
      td.textContent = cellData;
      tr.appendChild(td);
    });
  
    tbody.appendChild(tr);
  }
  
  table.appendChild(tbody);
  ```

### Step 7: (発展) 各列の平均値を計算して表示しよう
最後に、各データ列の平均値を計算し、テーブルの最終行に追加します。

- **課題**
  - 各列（地点ごと）の数値データの平均値を計算してください。
  - 計算した平均値を、テーブルの最終行として追加表示してください。

- **考え方のヒント**
  - この処理は少し複雑です。データは現在「行ごと」にまとまっていますが、計算は「列ごと」に行う必要があります。
  - **行と列の入れ替え（転置）**: データを扱いやすくするために、行と列を入れ替えた新しい二次元配列を作成すると便利です。提供されたコードの `transpose` 関数が利用できます。
  - 転置後の配列をループし、各配列（元の列データ）の合計を計算し、要素数で割って平均を求めます。
  - `parseFloat()` を使って、文字列を数値に変換することを忘れないようにしましょう。数値に変換できないデータは計算から除外する必要があります (`isNaN()` でチェック)。

- **解法 (完成版 `js/app.js`)**
  ```javascript
  const table = document.getElementById('weather-table');
  
  // 配列の行と列を入れ替える（転置）関数
  const transpose = a => a[0].map((_, c) => a.map(r => r[c]));
  
  fetch('[https://rimgate.net/kisyou.php](https://rimgate.net/kisyou.php)')
    .then(response => response.text())
    .then(data => {
      const lines = data.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) return; // データが少なすぎる場合は終了
  
      // === Step 5 & 6 の内容をここに記述 ===
      const headerRow = lines[0].split(',');
      const thead = document.createElement('thead');
      const headerTr = document.createElement('tr');
      headerRow.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        headerTr.appendChild(th);
      });
      thead.appendChild(headerTr);
      table.appendChild(thead);
  
      const tbody = document.createElement('tbody');
      const dataRows = []; // データ部分だけを格納する配列
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        dataRows.push(row); // データ配列に追加
        const tr = document.createElement('tr');
        row.forEach(cell => {
          const td = document.createElement('td');
          td.textContent = cell;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      }
  
      // === ここから平均値計算処理 ===
      if(dataRows.length > 0) {
        const transposedRows = transpose(dataRows);
        const averageRow = document.createElement('tr');
  
        const firstCell = document.createElement('td');
        firstCell.textContent = "平均";
        firstCell.style.fontWeight = "bold";
        averageRow.appendChild(firstCell);
  
        // 2列目以降の平均を計算
        for (let i = 1; i < transposedRows.length; i++) {
          const column = transposedRows[i];
          let sum = 0.0;
          let count = 0;
          for (const ele of column) {
            const num = parseFloat(ele);
            if (!isNaN(num)) {
              sum += num;
              count++;
            }
          }
          const average = count > 0 ? (sum / count).toFixed(2) : 'N/A';
          const td = document.createElement('td');
          td.textContent = average;
          td.style.fontWeight = "bold";
          averageRow.appendChild(td);
        }
        tbody.appendChild(averageRow);
      }
  
      table.appendChild(tbody);
    })
    .catch(error => console.error('エラー:', error));
  ```
