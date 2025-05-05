//条码解析
export function GetBarcode(code) {
	let codelist = code.split('.')
	let resstr = codelist[1]
	return resstr
}
//解析包含 分录id条码
export function GetBarcodeforFenlu(code) {
	let codelist = code.split('.')
	let resstr = []
	if (codelist[2].length > 1) {
		resstr.push(codelist[1], codelist[2])
	} else {
		resstr.push(codelist[1])
	}
	return resstr
}