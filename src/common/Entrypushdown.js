//数据处理
export function Listprocess(items) {
	// 使用 Object 来进行分类  
	let groupedList = items.reduce((acc, item) => {
		// 如果该分类已经存在于关联数组中，则将该对象元素添加到对应数组中  
		if (acc[item[19]]) {
			acc[item[19]].push(item);
		}
		// 否则，创建一个新的数组，并将该对象元素添加到其中  
		else {
			acc[item[19]] = [item];
		}
		return acc;
	}, {});
	return groupedList;
	//console.log(Object.keys(groupedList));//拿到分录ids
}