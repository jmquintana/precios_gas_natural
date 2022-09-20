console.log("script api.js");

function isEmpty(obj) {
	for (var prop in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, prop)) {
			return false;
		}
	}
	return JSON.stringify(obj) === JSON.stringify({});
}

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
		console.log(apiJson.result);
		return apiJson.result;
	} catch (e) {
		console.error(e);
	}
}

function toggleSpinner() {
	let spinner = document.getElementById("spinner");
	let table = document.getElementById("table-div");
	console.log("toggle spinner");
	spinner.classList.toggle("hide");
	table.classList.toggle("hide");
}

async function fetchAllData() {
	try {
		toggleSpinner();
		let allData = [];
		let morePagesAvailable = true;
		let currentPage = 0;
		let filterString = urlFilters(filters);
		let fullUrl = `${endpoint}${filterString}`;

		while (morePagesAvailable) {
			currentPage++;
			const response = await fetch(`http://datos.energia.gob.ar${fullUrl}`);
			const results = await response.json();
			let { records, total, _links } = results.result;
			console.log(
				parseFloat((100 * (currentPage * 100)) / total).toFixed(0) + "%"
			);
			records.forEach((e) => allData.unshift(e));
			fullUrl = _links.next;
			morePagesAvailable = currentPage * 100 < total;
		}
		toggleSpinner();
		return allData;
	} catch (e) {
		console.log(e);
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

function modifyButtons() {
	let excelButton = document.querySelector(".excelButton");
	let copyButton = document.querySelector(".copyButton");
	excelButton.classList.replace("dt-button", "btn-success");
	excelButton.classList.add("btn");
	copyButton.classList.replace("dt-button", "btn-primary");
	copyButton.classList.add("btn");
}

filterSeletors.forEach((filterSelector) => {
	filterSelector.addEventListener("change", async () => {
		if (
			!(filterSelector.value === "Todos") &&
			!(filterSelector.value === "Todas")
		) {
			filters[filterSelector.id] =
				parseInt(filterSelector.value) || filterSelector.value;
		} else {
			delete filters[filterSelector.id];
		}
		console.log(filters);
		table.hide();

		fetchAllData()
			.then((data) => {
				console.log(data);
				table ? table.DataTable().destroy() : false;
				showTable(data);
			})
			.catch((e) => console.error(e));
		table.show();
	});
});
