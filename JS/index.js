let table = $("#data-table");

const url1 =
	"/api/3/action/datastore_search?resource_id=d87ca6ab-2979-474b-994a-e4ba259bb217";
const url2 =
	"/api/3/action/datastore_search?resource_id=80ac25de-a44a-4445-9215-090cf55cfda5";

const columns = [
	// { title: "ID", data: "id_pub" },
	{ title: "Año", data: "anio" },
	{ title: "Mes", data: "mes" },
	{ title: "Contrato", data: "contrato" },
	{ title: "Cuenca", data: "cuenca" },
	{ title: "Distcos", data: "precio_distribuidora" },
	{ title: "GNC", data: "precio_gnc" },
	{ title: "Usinas", data: "precio_usina" },
	{ title: "Industrias", data: "precio_industria" },
	{ title: "Otros", data: "precio_otros" },
	{ title: "PPP", data: "precio_ppp" },
	{ title: "Expo", data: "precio_expo" },
];

async function loadData() {
	let myData = [];
	let data = [];
	try {
		myData = await getData(url1, filters);
		console.log(myData);
		console.log(myData.records);
		console.log(columns2);
		data = await myData.records.map((el) => Object.values(el));
		let d = { data: myData.records };
		console.log(d);
		return d;
		// return data;
	} catch (e) {
		console.error(e);
		return;
	}
}

async function showTable() {
	let endpoint = `${url1}`;
	// let filterString = urlFilters(filters);
	// let fullUrl = `http://datos.energia.gob.ar${endpoint}${filterString}`;
	let data = await getData(endpoint);
	// console.log(data);
	table.DataTable({
		// ajax: {
		// 	url: fullUrl,
		// 	dataSrc: "result.records",
		// 	cache: true,
		// },
		data: data.records,
		dom: "Bfrtip",
		// dom: "Rlfrtip",
		// dom: "lBfrtip",
		columns: columns,
		colReorder: { order: [5, 3, 2, 1, 0] },
		buttons: [
			{ extend: "copy", className: "copyButton" },
			{
				extend: "excel",
				className: "excelButton",
				excelStyles: [
					{
						cells: "F",
						style: {
							numFmt: "#,##0.0000;(#,##0.0000)",
						},
					},
				],
			},
		],
		columnDefs: [
			{
				width: "10%",
				className: "dt-center",
				render: $.fn.dataTable.render.number(",", ".", 2, ""),
				targets: [4, 5, 6, 7, 8, 9, 10],
			},
			{
				width: "3%",
				className: "dt-body-center",
				orderData: [0, 1, 2],
				targets: [0, 1],
			},
		],
	});

	modifyButtons();
}

function modifyButtons() {
	let excelButton = document.querySelector(".excelButton");
	let copyButton = document.querySelector(".copyButton");
	excelButton.classList.replace("dt-button", "btn-success");
	excelButton.classList.add("btn");
	copyButton.classList.replace("dt-button", "btn-primary");
	copyButton.classList.add("btn");
}

function destroyTable() {
	table.DataTable().destroy();
}

const anioSelector = document.getElementById("anio");

const filterSeletors = document.querySelectorAll(".form-select");

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
		destroyTable();
		await showTable();
		table.show();
		// recalcTable();
	});
});

$(document).ready(showTable);
