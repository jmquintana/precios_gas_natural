const FIRST =
	"/api/3/action/datastore_search?resource_id=d87ca6ab-2979-474b-994a-e4ba259bb217";
let next;
let previous;
let current = FIRST;

async function getData(url) {
	const fullUrl = `http://datos.energia.gob.ar${url}`;
	const api = await fetch(fullUrl);
	const apiJson = await api.json();
	// console.log(apiJson.result);
	return apiJson.result;
}

async function gData(url, _data = [], page = 0) {
	let newData = await getData(url);
	let data;
	if (page * 100 >= newData.total) {
		console.log(_data);
		return _data;
	}
	while (page * 100 < newData.total) {
		data = _data.concat(newData.records);
		// console.log(data);
		page = page + 1;
		gData(newData._links.next, data, page);
		return data;
	}
}

let res = gData([], current);

console.log(res);

// gData([], current);
