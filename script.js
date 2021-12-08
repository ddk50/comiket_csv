let orderName = '';
let checkColor = [];

const elements = {};

const main = () => {
	const inputCSV = elements.input.value;
	checkColor = [].map.call(elements.checkbox, (cb) => (cb.checked === true) ? cb.value : false).filter(value => value);
	orderName = elements.orderName.value;
	elements.output.value = '';
	readFile(inputCSV);
};
const readFile = (inputCSV) => {
	// 改行記号を\nに変換
	inputCSV = inputCSV.replace(/\n\r/g, '\n').replace(/\r/g, '');
	// コメント中にある改行/カンマを置換しておく
	const lineBrakeReplaced = inputCSV.split('"').map(str => str.replace(/(.)\n/g, '<BRAKE>').replace(/,^$/g, '<COMMA>')).join('"');
	const splittedLines = lineBrakeReplaced.split('\n').map(line => {
		return line.split(',').map(str => str.replace(/^"|"$/g, ''));
	});
	const checkData = arrayToCheckData(splittedLines);
	// もし色によって除外するならここで処理
	const orderData = checkData.map(circle => {
		return (checkColor.indexOf(circle.color) !== -1) ? circle : null;
	}).filter(line => line);
	const preparedData = formatData(orderData);
	writeFile(preparedData);
};
const writeFile = (preparedData) => {
	const writeData = preparedData.join('\n').replace('<BRAKE>', '\n').replace('<COMMA>', ',');
	elements.output.value = writeData;
	const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
	const blob = new Blob([ bom, writeData ], { "type" : "text/csv" });

    if (window.navigator.msSaveBlob) { 
        window.navigator.msSaveBlob(blob, "list.csv"); 
    } else {
        elements.downloadLink.download = "list.csv";
        elements.downloadLink.href = window.URL.createObjectURL(blob);
        elements.downloadLink.style.display = '';
    }};
const arrayToCheckData = (csvArr) => {
	// 整形してサークルデータでない行を抜いて返す
	return csvArr.map(line => {
		if (line[0] !== 'Circle') return null;
		// 抽選漏れを除外
		if (line[5] === '×') return null;
		return {
			color  : line[2],
			wDay   : line[5],
			area   : line[6],
			prefix : line[7],
			spaceNo: line[8],
			suffix : (line[21] === '0') ? 'a' : 'b',
			nameC  : line[10],
			namePN : line[12],
			memo   : line[17],
		};
	}).filter(line => line);
};
const formatData = (checkData) => {
	return checkData.map(circle =>
		[
			circle.wDay,
			circle.area,
			circle.prefix,
			circle.spaceNo + circle.suffix,
			`"${circle.nameC}"`,
			'"新刊"',
			'',
			1,
			`"${orderName}"`,
			`"${circle.memo}"`,
		].join()
	);
};

document.addEventListener('DOMContentLoaded', () => {
	elements.orderName = document.getElementById('orderName');
	elements.checkbox = document.querySelectorAll('input[type="checkbox"]');
	elements.input = document.getElementById('inputFile');
	elements.output = document.getElementById('orderFile');
	elements.execute = document.getElementById('btnExecute');
	elements.downloadLink = document.getElementById('downloadLink');

	elements.execute.addEventListener('click', main);
});
