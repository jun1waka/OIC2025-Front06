document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('weather-table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  let originalData = []; // フィルタリングされていない元のデータを保持
  let headerTexts = [];
  let currentSort = {
    columnIndex: 0,
    direction: 'asc'
  };

  // データを取得してテーブルを初期化
  fetch('https://rimgate.net/kisyou.php')
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

  /**
   * テーブルヘッダー（ソート用とフィルター用）を描画する
   */
  function renderHeader() {
    const sortRow = document.createElement('tr');
    const filterRow = document.createElement('tr');

    headerTexts.forEach((headerText, index) => {
      // ソート用のヘッダーセル
      const th = document.createElement('th');
      th.textContent = headerText;
      th.classList.add('sortable');
      th.dataset.columnIndex = index;
      th.addEventListener('click', () => handleSort(th));
      sortRow.appendChild(th);

      // フィルター用のヘッダーセル
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
    
    // 初期ソート状態をUIに反映
    updateSortUI();
  }

  /**
   * フィルターとソートを適用してテーブルを再描画する
   */
  function applyFiltersAndSort() {
    // 1. フィルターを適用
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

    // 2. ソートを適用
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

    // 3. テーブルボディを再描画
    renderTableBody(filteredData);
  }

  /**
   * テーブルのボディを描画する
   * @param {Array<Array<string>>} data - 表示するデータ
   */
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

  /**
   * ソートのクリックイベントを処理する
   * @param {HTMLElement} clickedTh - クリックされたth要素
   */
  function handleSort(clickedTh) {
    const newColumnIndex = parseInt(clickedTh.dataset.columnIndex, 10);

    if (currentSort.columnIndex === newColumnIndex) {
      // 同じ列がクリックされた場合は、方向を逆にする
      currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // 違う列がクリックされた場合は、昇順でソート
      currentSort.columnIndex = newColumnIndex;
      currentSort.direction = 'asc';
    }
    
    updateSortUI();
    applyFiltersAndSort();
  }
  
  /**
   * ヘッダーのソート状態（矢印）を更新する
   */
  function updateSortUI() {
    thead.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (parseInt(th.dataset.columnIndex, 10) === currentSort.columnIndex) {
            th.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    });
  }
});
