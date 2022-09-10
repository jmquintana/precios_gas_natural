console.log("hola mundo");

let table = $("#data-table");

const url1 =
	"/api/3/action/datastore_search?resource_id=d87ca6ab-2979-474b-994a-e4ba259bb217";
const url2 =
	"/api/3/action/datastore_search?resource_id=80ac25de-a44a-4445-9215-090cf55cfda5";

const columns = [
	{
		title: "ID",
	},
	{
		title: "Otros",
	},
	{
		title: "Distribuidora",
	},
	{
		title: "Año",
	},
	{
		title: "Usina",
	},
	{
		title: "Exportación",
	},
	{
		title: "GNC",
	},
	{
		title: "Industria",
	},
	{
		title: "PPP",
	},
	{
		title: "Año-Mes",
	},
	{
		title: "Contrato",
	},
	{
		title: "Mes",
	},
	{
		title: "Cuenca",
	},
];

async function loadData() {
	let myData = [];
	let data = [];
	try {
		myData = await getData(url1, filters);
		data = await myData.records.map((el) => Object.values(el));
		return data;
	} catch (e) {
		console.error(e);
		return;
	}
}

async function showTable() {
	table.DataTable({
		data: await loadData(),
		dom: "Bfrtip",
		columns: columns,
	});
}

function destroyTable() {
	table.DataTable().destroy();
}

function recalcTable() {
	table.responsive.recalc();
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
