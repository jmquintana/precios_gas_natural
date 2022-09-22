console.log("script api.js");
const $table = $("#data-table");
const filterSeletors = document.querySelectorAll(".form-select");

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

// async function getData(endpoint) {
// 	let filterString = urlFilters(filters);
// 	let fullUrl = `http://datos.energia.gob.ar${endpoint}${filterString}`;
// 	try {
// 		const api = await fetch(fullUrl);
// 		const apiJson = await api.json();
// 		console.log(apiJson.result);
// 		return apiJson.result;
// 	} catch (e) {
// 		console.error(e);
// 	}
// }

function toggleSpinner() {
	let spinner = document.getElementById("spinner");
	let table = document.getElementById("table-div");
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
			const result = results.result;
			let { records, total, _links } = result;
			console.log({ currentPage, result });
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

function modifyButtons() {
	let excelButton = document.querySelector(".excelButton");
	let copyButton = document.querySelector(".copyButton");
	excelButton.classList.replace("dt-button", "btn-success");
	excelButton.classList.add("btn");
	copyButton.classList.replace("dt-button", "btn-primary");
	copyButton.classList.add("btn");
}

filterSeletors.forEach((filterSelector) => {
	filterSelector.addEventListener("change", () => {
		updateFilters(filterSelector);
		console.log(filters);
		loadTable();
	});
});

function optionExist(option, filterSelector) {
	const options = [...filterSelector.options].map((el) => el.value);
	return options.includes(option);
}

document.getElementById("reset").addEventListener("click", (e) => {
	if (!isEmpty(filters)) {
		e.preventDefault();
		console.log("reset all filters");
		filterSeletors.forEach((filterSelector) => {
			const OPTION_ALL = "all";
			if (optionExist(OPTION_ALL, filterSelector)) {
				filterSelector.value = OPTION_ALL;
			}
			updateFilters(filterSelector);
		});
		console.log(filters);
		loadTable();
	}
});

function loadTable() {
	fetchAllData()
		.then((data) => {
			console.log(data);
			$table ? $table.DataTable().destroy() : false;
			showTable(data);
		})
		.catch((e) => console.error(e));
}

function showTable(data) {
	$table.DataTable({
		data: data,
		dom: "Bfrtip",
		// dom: "Rlfrtip",
		// dom: "lBfrtip",
		columns: columns,
		colReorder: colReorder,
		buttons: [
			{ extend: "copy", className: "copyButton" },
			{
				extend: "excel",
				className: "excelButton",
				excelStyles: excelStyles,
			},
		],
		columnDefs: columnDefs,
	});
	modifyButtons();
}

function updateFilters(filterSelector) {
	if (!(filterSelector.value === "all")) {
		filters[filterSelector.id] =
			Number(filterSelector.value) || filterSelector.value;
	} else {
		delete filters[filterSelector.id];
	}
}

$(document).ready(() => {
	fetchAllData()
		.then((data) => {
			// getData(endpoint);
			console.log(data);
			showTable(data);
		})
		.catch((e) => console.error(e));
});

let tooltipTriggerList = [].slice.call(
	document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
	return new bootstrap.Tooltip(tooltipTriggerEl);
});
