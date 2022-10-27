console.log("script api.js");

const $table = $("#data-table");
const filterSelectors = document.querySelectorAll(".form-select");
const OPTION_ALL = "all";
const progressBar = document.querySelector(".progress-bar");
const switchBtn = document.querySelector("#flex-switch");
const ERROR_TEST_MESSAGE = `[Esto es un ejemplo] Uncaught TypeError: Cannot 
							read properties of undefined (reading 'backdrop')
							at Ni._initializeBackDrop (modal.js:158:39)
							at new Ni (modal.js:69:27)
							at triggerErrorModal (api.js:96:21)
							at handleFetchError (api.js:90:2)
							at <anonymous>:1:1`;

function isEmptyObj(obj) {
	for (let prop in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, prop)) {
			return false;
		}
	}
	return JSON.stringify(obj) === JSON.stringify({});
}

function urlFilters(filters) {
	if (isEmptyObj(filters)) {
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

async function fetchLocalData(fileName) {
	try {
		const response = await fetch(`./data/${fileName}`);
		const data = await response.json();
		return data;
	} catch (e) {
		console.log(e);
	}
}

async function getLocalData() {
	toggleSpinner();
	progressBar.style.display = "block";
	const data = await fetchLocalData(LOCAL_FILE_NAME);
	setTimeout(() => (progressBar.style.width = "100%"), 500);
	toggleSpinner();
	addOptionsCount();
	return _.where(data, filters);
}

async function getRemoteData() {
	try {
		toggleSpinner();
		let allData = [];
		let morePagesAvailable = true;
		let currentPage = 0;
		let filterString = urlFilters(filters);
		let fullUrl = `${endpoint}${filterString}`;
		const s = location.protocol === "https:" ? "s" : "";

		while (morePagesAvailable) {
			currentPage++;
			const response = await fetch(`http${s}://datos.energia.gob.ar${fullUrl}`);
			const results = await response.json();
			const result = results.result;
			let { records, total, _links } = result;
			let progress =
				parseInt((100 * ((currentPage - 1) * 100 + records.length)) / total) +
				"%";
			progressBar.style.display = "block";
			progressBar.style.width = progress;
			console.log({ progress, currentPage, result });
			records.forEach((record) => allData.unshift(record));
			fullUrl = _links.next;
			morePagesAvailable = currentPage * 100 < total;
		}
		toggleSpinner();
		addOptionsCount();
		// Storage.save(allData);
		return allData;
	} catch (e) {
		showErrorModal(e);
	}
}

const showErrorModal = (e = ERROR_TEST_MESSAGE) => {
	let myErrorModal = new bootstrap.Modal(document.querySelector("#errorModal"));
	errorMessageElement = document.querySelector(".error-message");
	errorMessageElement.textContent = e;
	myErrorModal.show();
	return;
};

//close modal event
$("#errorModal").on("hidden.bs.modal", function () {
	switchBtn.toggleAttribute("checked");
	console.log([switchBtn.checked]);
	Storage.save([switchBtn.checked], "dataSwitch");
	let errorMessage = document.querySelector(".error-message");
	errorMessage ? errorMessage.remove() : false;
	window.location.reload();
});

const handleSwitchBtn = (e) => {
	Storage.save([e.target.checked], "dataSwitch");
	loadTable().then(() => populateSelector("localidad", Storage.get()));
	hideTooltips();
};

const hideTooltips = () => {
	setTimeout(() => {
		tooltipList.forEach((tooltip) => tooltip.hide());
	}, 1000);
};

switchBtn?.addEventListener("click", handleSwitchBtn);

function modifyButtons() {
	const excelButton = document.querySelector(".excelButton");
	const copyButton = document.querySelector(".copyButton");
	const mapButton = document.querySelector(".mapButton");
	const locButton = document.querySelector(".locButton");

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
			filterSelector.focus();
			if (filterSelector.id === "provincia")
				populateSelector("localidad", Storage.get());
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

document.getElementById("reset")?.addEventListener("click", (e) => {
	console.log(filters);
	if (!isEmptyObj(filters)) {
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
				console.log({ selectionHasChanged });
			}
			updateFilters();
		});

		if (selectionHasChanged)
			loadTable().then(() => {
				let data = Storage.get();
				populateSelector("localidad", data);
			});
	}
	hideTooltips();
});

async function loadTable() {
	const fetchRemoteData = switchBtn.checked;
	console.log({ fetchRemoteData });
	if (fetchRemoteData) {
		await getRemoteData()
			.then((data) => {
				Storage.save(data);
				console.log(data);
				$table ? $table.DataTable().destroy() : false;
				showTable(data);
			})
			.catch((e) => console.error(e));
	} else {
		await getLocalData()
			.then((data) => {
				Storage.save(data);
				console.log(data);
				$table ? $table.DataTable().destroy() : false;
				showTable(data);
			})
			.catch((e) => console.error(e));
	}
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

let tooltipTriggerList = [].slice.call(
	document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
	return new bootstrap.Tooltip(tooltipTriggerEl);
});

function getUniques(key, arr) {
	return [...new Set(arr.map((x) => x[key]))].sort();
}

function populateSelector(columnName, data) {
	const values = getUniques(columnName, data);
	$(`#${columnName}`)
		.empty()
		.append(`<option value="all">Todas (${values.length})</option>`);
	values.forEach((value) =>
		$(`#${columnName}`).append(`<option value="${value}">${value}</option>`)
	);
}

function addOptionsCount() {
	filterSelectors.forEach((filterSelector) => {
		if (filterSelector[0].value === OPTION_ALL) {
			filterSelector[0].innerText = `Todas (${
				parseInt(filterSelector.options.length) - 1
			})`;
		}
	});
}

//download json file and save to disk
function download(content, fileName, contentType) {
	let a = document.createElement("a");
	let file = new Blob([content], { type: contentType });
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
}

const downloadAll = () => {
	let filtersBackup = JSON.parse(JSON.stringify(filters));
	filters = {};
	getRemoteData()
		.then((data) => {
			console.log(data);
			download(JSON.stringify(data), LOCAL_FILE_NAME, "application/json");
		})
		.catch((e) => showErrorModal(e));
	filters = JSON.parse(JSON.stringify(filtersBackup));
};

$(document).ready(() => {
	switchBtn.removeAttribute("checked");
	filtersToSelectors();
	if (switchBtn.checked) {
		getRemoteData()
			.then((data) => {
				console.log(data);
				populateSelector("localidad", data);
				showTable(data);
			})
			.catch((e) => showErrorModal(e));
	} else {
		getLocalData()
			.then((data) => {
				console.log(data);
				populateSelector("localidad", data);
				showTable(data);
			})
			.catch((e) => console.error(e));
	}
});
