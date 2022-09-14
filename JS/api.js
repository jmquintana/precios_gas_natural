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
	if (isEmpty(filters)) {
		return "";
	} else {
		let string = JSON.stringify(filters);
		return `&filters=${string}#`;
	}
}

async function getData(endpoint) {
	let filterString = urlFilters(filters);
	let fullUrl = `http://datos.energia.gob.ar${endpoint}${filterString}`;
	try {
		const api = await fetch(fullUrl);
		const apiJson = await api.json();
		// console.log(apiJson.result);
		return apiJson.result;
	} catch (e) {
		console.error(e);
	}
}

function saveFile(json) {
	fs.writeFile("./data/data.json", JSON.stringify(json), (err) => {
		if (err) {
			throw new Error("Something went wrong.");
		}
		console.log("JSON written to file. Contents:");
		console.log(fs.readFileSync("data.json", "utf-8"));
	});
}

async function gData(endpoint, _data = [], page = 1) {
	try {
		let newData = await getData(endpoint);
		if ((page - 1) * 100 <= newData.total) {
			_data = _data.concat(newData.records);
			let newEndpoint = newData._links.next;
			page++;
			gData(newEndpoint, _data, page);
			// saveFile(_data);
		} else {
			// console.log(_data);
			return _data;
		}
	} catch (e) {
		console.error(e);
	}
}

async function fetchMetaData() {
	let allData = [];
	let morePagesAvailable = true;
	let currentPage = 0;
	let filterString = urlFilters(filters);
	let endpoint = `${current}${filterString}`;

	while (morePagesAvailable) {
		currentPage++;
		const response = await fetch(`https://datos.energia.gob.ar${endpoint}`);
		const results = await response.json();
		let { records, total, _links } = results.result;
		records.forEach((e) => allData.unshift(e));
		endpoint = _links.next;
		morePagesAvailable = currentPage * 100 < total;
	}
	return allData;
}
