// 表示対象のテーブル要素をあらかじめ取得しておく
const table = document.getElementById('weather-table');

console.log('--- Fetchのまえ ---');
fetch('https://rimgate.net/kisyou.php')
  .then(response => {
    console.log('--- 取得したresponse生データ ---');
    console.log(response); 
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
    //平均計算用
    let avgSum = [];
    let avgCount = [];
    
    // データを改行で分割して配列にする
    const lines = data.split('\r\n').filter(line => line.trim() !== '');
    console.log('--- 改行で分割した配列 ---');
    console.log(lines);
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

    const tbody = document.createElement('tbody');
    // 2行目以降のデータをループ
    let cellCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const rowData = lines[i].split(',');
      const tr = document.createElement('tr');
      // 各行のセルデータをループ
      cellCount = 0;
      rowData.forEach(cellData => {
        const td = document.createElement('td');
        td.textContent = cellData;
        if(!Number.isNaN(parseFloat(cellData))){
            if(Number.isNaN(parseFloat(avgSum[cellCount]))){
            	avgSum[cellCount] = 0.0;
            }
            if(Number.isNaN(parseFloat(avgCount[cellCount]))){
            	avgCount[cellCount] = 0;
            }
        	avgSum[cellCount] += parseFloat(cellData);
        	avgCount[cellCount]++;
        } 
        cellCount++;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
    console.log(avgSum);
    console.log(avgCount);
    
    const avgtr = document.createElement('tr');
    for (let i = 0; i < cellCount; i++) {
        const td = document.createElement('td');
        if(avgCount[i] > 0){
          td.textContent = (avgSum[i]/avgCount[i]);
        }
        avgtr.appendChild(td);
    }
    tbody.appendChild(avgtr);


    table.appendChild(tbody);

  })
  .catch(error => {
    // 失敗した場合の処理
    console.error('データの取得に失敗しました:', error);
  });
console.log('--- Fetchのあと ---');

