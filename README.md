# OIC2025-Front06
# 応用プログラム仕様書兼開発手順書（フィルター＆ソート機能）

## 1. はじめに
このドキュメントは、基本的なデータ表示プログラムを拡張し、「絞り込みフィルター機能」と「並び替え（ソート）機能」の両方を実装する手順を学ぶためのものです。
Webアプリケーションで頻繁に利用されるこれらの高度な機能を実装することで、より実践的なデータ操作技術の習得を目指します。

### 1.1. 完成形のイメージ
- テーブルの各列ヘッダーに、テキスト入力欄（フィルター）が設置される。
- フィルターに入力すると、リアルタイムでテーブルの行が絞り込まれる。
- テーブルの項目名（ヘッダー）をクリックすると、その列のデータを基準に昇順・降順で並び替え（ソート）ができる。
- フィルターとソートは同時に機能する。

### 1.2. 学習の目的
- 複数のユーザー操作（入力、クリック）に応じて動的に表示を更新するロジックを理解する。
- JavaScriptにおけるデータ管理の重要性（元のデータ、表示用のデータ）を学ぶ。
- `filter`メソッドによる柔軟なデータ絞り込み方法を習得する。
- `sort`メソッドと比較関数を使った高度な並び替え技術を習得する。
- CSSと連携して、現在のソート状態をユーザーに分かりやすく提示する方法を学ぶ。

---

## 2. 開発手順

### Step 1: HTMLとCSSの準備
まず、機能追加の土台となるHTMLと、ソート状態を視覚的に表現するためのCSSを準備します。

- **課題**
  - HTMLには、JavaScriptでヘッダーとボディを生成するための `<thead>` と `<tbody>` を持つテーブルを配置します。
  - CSSには、ソート可能なヘッダーを示すカーソルスタイルと、ソート方向（昇順/降順）を示す矢印アイコンのスタイルを追加します。

- **考え方のヒント**
  - CSSの疑似要素 `::after` を使うと、HTML要素の直後にテキストや記号を追加できます。これを利用してソートの矢印を表示します。
  - `cursor: pointer;` は、その要素がクリック可能であることをユーザーに示唆します。

- **解法 (`index.html`)**
  ```html
  <!DOCTYPE html>
  <html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>気象庁データ表示（フィルター＆ソート機能付き）</title>
    <link rel="stylesheet" href="css/style.css">
  </head>
  <body>
    <h1>気象庁データ表示</h1>
    <p>ヘッダーの入力欄で絞り込み、項目名クリックで並び替えができます。</p>
    <table id="weather-table">
      <thead></thead>
      <tbody></tbody>
    </table>
    <script src="js/app.js"></script>
  </body>
  </html>
  ```

- **解法 (`css/style.css`)**
  ```css
  /* 基本スタイルは省略 */
  body { font-family: Arial, sans-serif; padding: 1em; }
  h1, p { text-align: center; }
  table { border-collapse: collapse; width: 100%; margin-top: 1em; }
  table, th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
  thead { background-color: #f2f2f2; position: sticky; top: 0; }

  /* --- ここからが追加/変更箇所 --- */
  .filter-input {
    width: 100%;
    box-sizing: border-box;
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  th.sortable {
    cursor: pointer;
    user-select: none; /* テキスト選択を無効化 */
  }
  
  th.sortable::after {
    content: ' \2195'; /* 上下矢印 */
    color: #ccc;
    font-weight: normal;
    float: right;
  }
  
  th.sort-asc::after {
    content: ' \25B2'; /* ▲ */
    color: #333;
  }
  
  th.sort-desc::after {
    content: ' \25BC'; /* ▼ */
    color: #333;
  }
  ```

### Step 2: JavaScriptの設計とデータ保持
フィルターやソートを適用する際、元のデータを失わないように管理することが非常に重要です。

- **課題**
  - 外部APIから取得したオリジナルのデータを、加工せずに保持しておくための変数 (`originalData`) を用意してください。
  - 現在のソート状態（どの列を、どの方向で）を管理するためのオブジェクト (`currentSort`) を用意してください。

- **考え方のヒント**
  - ユーザーがフィルターの文字を消したり、ソートを解除したりしたときに、いつでも元の状態に戻せるように、大元のデータは常に別に保管しておきます。
  - 画面に表示するデータは、この `originalData` に対して、その都度フィルターやソートを適用して生成します。

- **解法 (`js/app.js` の初期設定)**
  ```javascript
  document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('weather-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
  
    let originalData = []; // フィルタリングされていない元のデータを保持
    let headerTexts = [];
    
    // 現在のソート状態を管理するオブジェクト
    let currentSort = {
      columnIndex: 0,   // 初期ソートは0番目の列
      direction: 'asc'  // 初期ソートは昇順
    };
  
    // ... データ取得処理が続く
  });
  ```

### Step 3: 動的な二段ヘッダーの生成
ソート機能とフィルター機能を両立させるため、`<thead>`内に2行のヘッダーを動的に生成します。

- **課題**
  - 1行目には、クリックしてソートするための項目名 (`<th>`) を配置してください。
  - 2行目には、文字を入力してフィルターするための `<input>` を配置した `<th>` を設置してください。
  - 各ヘッダーや入力欄には、後で処理に使うための `data-` 属性（例: `data-column-index`）を使って、列のインデックス番号を埋め込んでください。

- **考え方のヒント**
  - `document.createElement()` を使って、`tr`, `th`, `input` 要素を生成し、`appendChild` で組み立てていきます。
  - `element.dataset.key = value` のようにして、`data-` 属性を設定できます。

- **解法 (`js/app.js` 内の `renderHeader` 関数)**
  ```javascript
  function renderHeader() {
    const sortRow = document.createElement('tr');
    const filterRow = document.createElement('tr');

    headerTexts.forEach((headerText, index) => {
      // 1行目: ソート用のヘッダーセル
      const th = document.createElement('th');
      th.textContent = headerText;
      th.classList.add('sortable');
      th.dataset.columnIndex = index; // 列番号を保持
      th.addEventListener('click', () => handleSort(th)); // クリックイベントを設定
      sortRow.appendChild(th);

      // 2行目: フィルター用のヘッダーセル
      const filterTh = document.createElement('th');
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = '絞り込み...';
      input.classList.add('filter-input');
      input.dataset.columnIndex = index; // 列番号を保持
      input.addEventListener('input', applyFiltersAndSort); // 入力イベントを設定
      filterTh.appendChild(input);
      filterRow.appendChild(filterTh);
    });

    thead.appendChild(sortRow);
    thead.appendChild(filterRow);
  }
  ```

### Step 4: フィルター処理の実装
入力された内容に基づいて、表示するデータを絞り込むロジックを詳しく見ていきましょう。

- **課題**
  - 全てのフィルター入力欄の値を取得してください。
  - `originalData` を元に、`Array.prototype.filter` メソッドを使って、条件に合う行だけの新しい配列を生成してください。
  - 複数のフィルターが入力された場合、全ての条件（AND条件）を満たす行のみが表示されるようにしてください。

- **考え方のヒント**
  - `Array.prototype.filter` は、配列の各要素に対してテスト関数を実行し、`true` を返した要素だけを集めた新しい配列を作ります。
  - AND条件を実現するには、`Array.prototype.every` が便利です。`every` は、配列の全ての要素がテスト関数で `true` を返す場合にのみ `true` を返します。
  - `string.toLowerCase()` を使って、入力値とセルの値を両方小文字に変換することで、大文字・小文字を区別しない検索が実現できます。

- **解法 (`js/app.js` 内の `applyFiltersAndSort` 関数の一部)**
  ```javascript
  function applyFiltersAndSort() {
    // 1. フィルターの適用
    const filterInputs = Array.from(thead.querySelectorAll('.filter-input'));
    const filters = filterInputs.map(input => ({
      columnIndex: parseInt(input.dataset.columnIndex, 10),
      value: input.value.toLowerCase() // 小文字に変換
    }));

    let filteredData = originalData.filter(row => {
      // everyを使い、全てのフィルター条件を満たすかチェック
      return filters.every(filter => {
        const cellValue = row[filter.columnIndex]?.toLowerCase() || '';
        // includesを使い、部分一致で検索
        return cellValue.includes(filter.value);
      });
    });

    // ... この後、ソート処理と描画処理が続く
  }
  ```

### Step 5: ソート処理の実装
フィルターされたデータに対して、並び替えを行うロジックを詳しく見ていきましょう。

- **課題**
  - `Array.prototype.sort` メソッドと、独自の比較関数を使って、`filteredData` を並び替えてください。
  - 比較関数内では、列が数値データか文字列データかを判断し、適切に比較できるようにしてください。（今回は1列目以外を数値として扱う）
  - `currentSort.direction` の値（`'asc'` または `'desc'`）に応じて、昇順・降順を切り替えられるようにしてください。

- **考え方のヒント**
  - `sort(compareFn)` の `compareFn(a, b)` は、次のような値を返す必要があります。
    - `a` を `b` より前に置く場合: 負の数
    - `b` を `a` より前に置く場合: 正の数
    - 順序を変更しない場合: `0`
  - 文字列のままだと `'10'` < `'2'` のように意図しない順序になるため、数値列は `parseFloat()` などで数値に変換してから比較します。
  - 降順にするには、昇順の場合と返り値（-1 と 1）を逆にすればOKです。

- **解法 (`js/app.js` 内の `applyFiltersAndSort` 関数の一部)**
  ```javascript
  // ... フィルター処理の続き
  
  // 2. ソートの適用
  const { columnIndex, direction } = currentSort;
  filteredData.sort((a, b) => {
    const valA = a[columnIndex];
    const valB = b[columnIndex];
    
    // 1列目以外は数値として比較
    const isNumeric = columnIndex > 0;
    const parsedA = isNumeric ? parseFloat(valA) || 0 : valA;
    const parsedB = isNumeric ? parseFloat(valB) || 0 : valB;

    if (parsedA < parsedB) {
      return direction === 'asc' ? -1 : 1; // 昇順なら-1, 降順なら1
    }
    if (parsedA > parsedB) {
      return direction === 'asc' ? 1 : -1; // 昇順なら1, 降順なら-1
    }
    return 0; // 等しい場合は0
  });
  
  // 3. テーブルボディの再描画
  renderTableBody(filteredData);
  ```

### Step 6: UIの更新とイベントハンドリング
最後に、ユーザーの操作に応じてこれらの処理を呼び出し、見た目を更新する仕組みを完成させます。

- **課題**
  - ヘッダー (`<th>`) がクリックされたら、`currentSort` オブジェクトを更新し、`applyFiltersAndSort` を呼び出す `handleSort` 関数を作成してください。
  - ソート状態が変わったら、CSSクラス (`sort-asc`, `sort-desc`) を付け替えて矢印の表示を更新する `updateSortUI` 関数を作成してください。
  - フィルター入力欄 (`<input>`) で入力があるたびに `applyFiltersAndSort` を呼び出してください（これはStep 3で実装済み）。

- **考え方のヒント**
  - `handleSort` 関数では、クリックされた列が現在のソート列と同じかどうかをチェックします。同じなら方向を反転させ、違うならその列を新しいソート対象とします。
  - `updateSortUI` 関数では、まず全てのヘッダーからソート用クラスを一旦削除し、その後で現在のソート対象の列にだけ適切なクラスを追加します。

- **解法 (完成版 `js/app.js` 全体)**
  ```javascript
  // 上記で解説した各関数を組み合わせた最終的なコード
  document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('weather-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
  
    let originalData = [];
    let headerTexts = [];
    let currentSort = { columnIndex: 0, direction: 'asc' };
  
    fetch('[https://rimgate.net/kisyou.php](https://rimgate.net/kisyou.php)')
      .then(response => response.ok ? response.text() : Promise.reject('Network error'))
      .then(data => {
        const lines = data.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) return;
  
        headerTexts = lines[0].split(',');
        originalData = lines.slice(1).map(line => line.split(','));
  
        renderHeader();
        applyFiltersAndSort();
      })
      .catch(error => {
        console.error('Error:', error);
        tbody.innerHTML = `<tr><td colspan="${headerTexts.length || 1}">データの読み込みに失敗しました。</td></tr>`;
      });
  
    function renderHeader() {
      const sortRow = document.createElement('tr');
      const filterRow = document.createElement('tr');
      headerTexts.forEach((headerText, index) => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.classList.add('sortable');
        th.dataset.columnIndex = index;
        th.addEventListener('click', () => handleSort(th));
        sortRow.appendChild(th);
        const filterTh = document.createElement('th');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '絞り込み...';
        input.classList.add('filter-input');
        input.dataset.columnIndex = index;
        input.addEventListener('input', applyFiltersAndSort);
        filterTh.appendChild(input);
        filterRow.appendChild(filterTh);
      });
      thead.appendChild(sortRow);
      thead.appendChild(filterRow);
      updateSortUI();
    }
  
    function applyFiltersAndSort() {
      const filterInputs = Array.from(thead.querySelectorAll('.filter-input'));
      const filters = filterInputs.map(input => ({
        columnIndex: parseInt(input.dataset.columnIndex, 10),
        value: input.value.toLowerCase()
      }));
      let filteredData = originalData.filter(row => {
        return filters.every(filter => {
          const cellValue = row[filter.columnIndex]?.toLowerCase() || '';
          return cellValue.includes(filter.value);
        });
      });
      const { columnIndex, direction } = currentSort;
      filteredData.sort((a, b) => {
        const valA = a[columnIndex];
        const valB = b[columnIndex];
        const isNumeric = columnIndex > 0;
        const parsedA = isNumeric ? parseFloat(valA) || 0 : valA;
        const parsedB = isNumeric ? parseFloat(valB) || 0 : valB;
        if (parsedA < parsedB) return direction === 'asc' ? -1 : 1;
        if (parsedA > parsedB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      renderTableBody(filteredData);
    }
  
    function renderTableBody(data) {
      tbody.innerHTML = '';
      if (data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.textContent = '該当するデータがありません。';
        td.colSpan = headerTexts.length;
        td.style.textAlign = 'center';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }
      data.forEach(rowData => {
        const tr = document.createElement('tr');
        rowData.forEach(cellData => {
          const td = document.createElement('td');
          td.textContent = cellData;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }
  
    function handleSort(clickedTh) {
      const newColumnIndex = parseInt(clickedTh.dataset.columnIndex, 10);
      if (currentSort.columnIndex === newColumnIndex) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.columnIndex = newColumnIndex;
        currentSort.direction = 'asc';
      }
      updateSortUI();
      applyFiltersAndSort();
    }
  
    function updateSortUI() {
      thead.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (parseInt(th.dataset.columnIndex, 10) === currentSort.columnIndex) {
          th.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
        }
      });
    }
  });
```
