document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('weather-table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  // データを取得してテーブルを構築する
  fetch('https://rimgate.net/kisyou.php')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(data => {
      const lines = data.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) return;

      // ヘッダー行を生成
      const headerCells = lines[0].split(',');
      const headerRow = document.createElement('tr');
      const filterRow = document.createElement('tr'); // 絞り込み入力用の行

      headerCells.forEach((headerText, index) => {
        // ヘッダーテキスト用のセル
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);

        // 絞り込み入力用のセル
        const filterTh = document.createElement('th');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `${headerText}で絞り込み...`;
        input.classList.add('filter-input');
        input.dataset.columnIndex = index; // 列のインデックスを保持
        filterTh.appendChild(input);
        filterRow.appendChild(filterTh);
      });

      thead.appendChild(headerRow);
      thead.appendChild(filterRow);

      // データ行を生成
      for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(',');
        const tr = document.createElement('tr');
        rowData.forEach(cellData => {
          const td = document.createElement('td');
          td.textContent = cellData;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      }
      
      // 絞り込みイベントリスナーを設定
      setupFiltering();
    })
    .catch(error => {
      console.error('データの取得または処理中にエラーが発生しました:', error);
      tbody.innerHTML = `<tr><td colspan="100%">データの読み込みに失敗しました。</td></tr>`;
    });

  // 絞り込み機能をセットアップする関数
  function setupFiltering() {
    const filterInputs = thead.querySelectorAll('.filter-input');
    
    filterInputs.forEach(input => {
      input.addEventListener('input', () => {
        const filters = Array.from(filterInputs).map(i => ({
          columnIndex: i.dataset.columnIndex,
          value: i.value.toLowerCase()
        }));

        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          let isVisible = true;

          filters.forEach(filter => {
            const cellText = cells[filter.columnIndex]?.textContent.toLowerCase() || '';
            if (cellText.indexOf(filter.value) === -1) {
              isVisible = false;
            }
          });

          row.style.display = isVisible ? '' : 'none';
        });
      });
    });
  }
});
