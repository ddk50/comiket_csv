const importCSVFile = './import.csv';
const exportCSVFile = './orderSheet.csv';
const orderName = 'みみん';
const checkColor = [9];

const fs = require('fs');
const iconv = require("iconv-lite");

const main = () => {
	readFile();
};
const readFile = () => {
	// ファイル読み込んで改行記号を\nに変換
	const inputCSV = fs.readFileSync(importCSVFile, 'utf-8').replace(/\n\r/g, '\n').replace(/\r/g, '');
	// コメント中にある改行/カンマを置換しておく
	const lineBrakeReplaced = inputCSV.split('"').map(str => str.replace(/(.)\n/g, '<BRAKE>').replace(/,^$/g, '<COMMA>')).join('"');
	conpst splittedLines = lineBrakeReplaced.split('\n').map(line => {
		return line.split(',').map(str => str.replace(/^"|"$/g, ''));
	});
	const checkData = arrayToCheckData(splittedLines);
	// もし色によって除外するならここで処理
	const orderData = checkData.map(circle => {
		return (checkColor.indexOf(parseInt(circle.color)) ==! -1) ? circle : null;
	}).filter(line => line);
	console.log(orderData)
	const preparedData = formatData(orderData);
	writeFile(preparedData);
};
const writeFile = (preparedData) => {
	const writeData = preparedData.join('\n').replace('<BRAKE>', '\n').replace('<COMMA>', ',');
	fs.writeFileSync(exportCSVFile, iconv.encode(writeData, 'Shift_JIS'));
};
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
			orderName,
			`"${circle.memo}"`,
		].join()
	);
};

main();

