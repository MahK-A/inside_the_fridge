const funcButton = document.getElementById("func"); //addItemボタン
const clearButton = document.getElementById("clear"); //clearボタン
const livewords = document.getElementById("live");
const resultList = document.getElementById("resultList"); //リストが入るエリア

// data配列を更新しながらデータを管理する
let data = restoreFromLocalstorage(); // localstorageから復元
renderItem(); // 初回の描画

let isRecording = false;
let recognition;

funcButton.addEventListener("mousedown", startRec); //ボタンを押した時にstartRec
funcButton.addEventListener("mouseup", stopRec); //ボタンを離した時にstopRec
clearButton.addEventListener("click", clear); //ボタンを押してデータをクリア

// APIが使えるかどうかの判定（ここそんなに頑張らなくてもいいと思うので）
if (window.webkitSpeechRecognition) {
  recognition = new window.webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.onresult = ev => handleSpeechRecognition(ev); //record完了イベントを定義
} else {
  // 対応してなかったら強制的に飛ばす
  alert("このブラウザは非対応です。\n 最新のChromeでお試しください。");
  window.location.href = "https://www.google.com/chrome/";
}

// localstorageから復元する処理
function restoreFromLocalstorage() {
  if (localStorage) {
    // jsonで保存しているのでｊｓのオブジェクトにパースする
    // なかったら空の配列を返す（そうしないとnullが返ってエラーになる）
    const json = localStorage.getItem("itf-data"); //keyがitf-dataのものをlocal storageからjsonに入れる
    const parsedData = JSON.parse(json) || []; //parseでjsonをオブジェクトに変換する
    console.log(parsedData);
    return parsedData; //返り値を指定
  } else {
    // 存在しない場合は空の配列を返す
    return [];
  }
}

// localstorageに保存する処理
function saveToLocalstorage() {
  if (localStorage) {
    const json = JSON.stringify(data); //dataをjsonに変換する
    localStorage.setItem("itf-data", json);
  } else {
    console.error("保存に失敗しました");
  }
}

// 録音の開始処理
function startRec() {
  console.log("recording start!");
  isRecording = true;
  recognition.start();
}

// 録音の停止処理
function stopRec() {
  console.log("recording stop!");
  isRecording = false;
  recognition.stop();
}

// 音声認識が完了した時の処理
function handleSpeechRecognition(ev) {
  const result = ev.results[0][0].transcript; //resultに認識した結果を返す
  console.log({ result });
  // この更新はイミュータブル
  data = [
    ...data, //スプレッド演算子で更新、pushと同じようなこと
    {
      id: new Date().getTime(), // 本来はuuidを生成するべき
      text: result
    }
  ];
  // localstorageにjsonとして保存する
  saveToLocalstorage();
  // dataを更新したので再描画する
  renderItem();
}

// dataを描画する処理
function renderItem() {
  resultList.innerHTML = null;
  data.forEach((item, index) => {
    // リスト要素
    const resultItem = document.createElement("li");
    resultItem.id = item.id; //idはunix時間
    resultItem.innerText = item.text;
    resultList.appendChild(resultItem);
    // 削除ボタン要素
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "✕";
    deleteButton.className = "xbutton";
    deleteButton.addEventListener("click", deleteListItem); //xbuttonをクリックした時の関数
    deleteButton.targetId = item.id; // このバツボタンで削除するアイテムのidを指定する
    resultItem.appendChild(deleteButton);
  });
}

// リストのアイテムを削除する処理
function deleteListItem(ev) {
  // renderItem関数で指定したプロパティから削除対象のidを取得する
  const { targetId } = ev.target;
  // flatMapを使って配列の要素を削除
  data = data.flatMap(item => {
    //mapは個々の配列に働きかけ、配列の中身を変える(dataを新しいdataに置き換える)
    if (item.id === targetId) {
      return []; //空の配列を返し、flatすることで[]を消す
    } else {
      return item; //Targrt以外は変えない
    }
  });
  // localstorageに保存
  saveToLocalstorage();
  // dataを更新したので再描画する
  renderItem();
}

// リストをすべて削除する処理
function clear() {
  data = [];
  localStorage.clear();
  // 再描画
  renderItem();
}
