const FIRST =
	"/api/3/action/datastore_search?resource_id=d87ca6ab-2979-474b-994a-e4ba259bb217";
let next;
let previous;
let current = FIRST;

function isEmpty(obj) {
	for (var prop in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, prop)) {
			return false;
		}
	}

	return JSON.stringify(obj) === JSON.stringify({});
}

let filters = {
	// anio: 2022,
	// cuenca: "Noroeste",
	// contrato: "TOTAL",
};

function urlFilters(filters) {
	let string = "";
	if (isEmpty(filters)) {
		return string;
	} else {
		string += `&filters={`;
		Object.keys(filters).forEach((key) => {
			string += `%22${key}%22:[%22${filters[key]}%22],`;
		});
		string = string.slice(0, -1) + `}#`;
	}
	console.log(string);
	return string;
}

async function getData(endpoint, filters = {}) {
	let filterString = urlFilters(filters);
	let fullUrl = `http://datos.energia.gob.ar${endpoint}${filterString}`;
	console.log(fullUrl);
	try {
		const api = await fetch(fullUrl);
		const apiJson = await api.json();
		// console.log(apiJson.result);
		return apiJson.result;
	} catch (e) {
		console.error(e);
	}
}

// async function getData(endpoint) {
// 	const fullUrl = `http://datos.energia.gob.ar${endpoint}`;
// 	fetch(fullUrl)
// 		.then((api) => api.json())
// 		.then((apiJson) => {
// 			console.log(apiJson.result);
// 			return apiJson.result;
// 		})
// 		.catch((e) => console.log(e));
// }

async function gData(url, _data = [], page = 0) {
	try {
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
	} catch (e) {
		console.error(e);
	}
}

// Promise.all([gData(current)]).then((res) => {
// 	console.log(res);
// });

// gData([], current);
