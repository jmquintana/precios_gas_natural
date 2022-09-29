console.log("script api.js");
const $table = $("#data-table");
const filterSelectors = document.querySelectorAll(".form-select");
const OPTION_ALL = "all";
const progressBar = document.querySelector(".progress-bar");
let globalData = [];

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

function toggleSpinner() {
	let spinner = document.getElementById("spinner");
	let table = document.getElementById("table-div");
	spinner.classList.toggle("hide");
	table.classList.toggle("hide");
	filterSelectors.forEach((filterSelector) =>
		filterSelector.toggleAttribute("disabled")
	);
	document.getElementById("reset").classList.toggle("disabled");
}

async function fetchAllData() {
	try {
		toggleSpinner();
		let allData = [];
		let morePagesAvailable = true;
		let currentPage = 0;
		let filterString = urlFilters(filters);
		let fullUrl = `${endpoint}${filterString}`;
		// const s = location.protocol === "https:" ? "s" : "";
		const s = "";

		while (morePagesAvailable) {
			currentPage++;
			const response = await fetch(
				`https://cors-anywhere.herokuapp.com/http${s}://datos.energia.gob.ar${fullUrl}`
			);
			const results = await response.json();
			const result = results.result;
			let { records, total, _links } = result;
			let progress =
				parseInt((100 * ((currentPage - 1) * 100 + records.length)) / total) +
				"%";
			progressBar.style.display = "block";
			progressBar.style.width = progress;
			console.log({ progress, currentPage, result });
			records.forEach((e) => allData.unshift(e));
			fullUrl = _links.next;
			morePagesAvailable = currentPage * 100 < total;
		}
		toggleSpinner();
		globalData = allData;
		return allData;
	} catch (e) {
		console.log(e);
	}
}

function modifyButtons() {
	const excelButton = document.querySelector(".excelButton");
	const copyButton = document.querySelector(".copyButton");
	const mapButton = document.querySelector(".mapButton");

	if (excelButton) {
		excelButton.classList.replace("dt-button", "btn-success");
		excelButton.classList.add("btn");
	}
	if (copyButton) {
		copyButton.classList.replace("dt-button", "btn-primary");
		copyButton.classList.add("btn");
	}
	if (mapButton) {
		mapButton.classList.replace("dt-button", "btn-secondary");
		mapButton.classList.add("btn");
		mapButton.setAttribute("data-bs-toggle", "modal");
		mapButton.setAttribute("data-bs-target", "#mapModal");
	}
}

filterSelectors.forEach((filterSelector) => {
	filterSelector.addEventListener("change", () => {
		if (filterSelector.id === "provincia") {
			resetSelector("localidad");
		}
		updateFilters();
		loadTable().then(() => {
			if (filterSelector.id === "provincia")
				populateSelector("localidad", globalData);
		});
	});
});

function resetSelector(selectorId) {
	document.getElementById(`${selectorId}`).value = OPTION_ALL;
	console.log(document.getElementById(`${selectorId}`).value);
}

function optionExist(option, filterSelector) {
	const options = [...filterSelector.options].map((el) => el.value);
	return options.includes(option);
}

document.getElementById("reset").addEventListener("click", (e) => {
	if (!isEmpty(filters)) {
		e.preventDefault();
		console.log("reset all filters");
		let selectionHasChanged = false;
		filterSelectors.forEach((filterSelector) => {
			if (
				filterSelector.value != OPTION_ALL &&
				optionExist(OPTION_ALL, filterSelector)
			) {
				filterSelector.value = OPTION_ALL;
				selectionHasChanged = true;
			}
			updateFilters();
		});
		if (selectionHasChanged) loadTable();
	}
});

async function loadTable() {
	await fetchAllData()
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
		buttons: buttons,
		columnDefs: columnDefs,
	});
	setTimeout(() => (progressBar.style.display = "none"), 600);
	modifyButtons();
}

function updateFilters() {
	filterSelectors.forEach((filterSelector) => {
		if (!(filterSelector.value === "all")) {
			filters[filterSelector.id] =
				Number(filterSelector.value) || filterSelector.value;
		} else {
			delete filters[filterSelector.id];
		}
	});
	console.log(filters);
}

function filtersToSelectors() {
	filterSelectors.forEach((filterSelector) => {
		if (filters[filterSelector.id]) {
			filterSelector.value = filters[filterSelector.id];
		}
	});
}
$(document).ready(() => {
	filtersToSelectors();
	fetchAllData()
		.then((data) => {
			// getData(endpoint);
			console.log(data);
			populateSelector("localidad", data);
			showTable(data);
		})
		.catch((e) => console.error(e));
});

function getUniques(key, arr) {
	return [...new Set(arr.map((x) => x[key]))].sort();
}

let tooltipTriggerList = [].slice.call(
	document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
	return new bootstrap.Tooltip(tooltipTriggerEl);
});

function populateSelector(columnName, data) {
	$(`#${columnName}`).empty().append(`<option value="all">Todas</option>`);
	const values = [...new Set(data.map((el) => el[columnName]))].sort();
	values.forEach((value) =>
		$(`#${columnName}`).append(`<option value="${value}">${value}</option>`)
	);
}
