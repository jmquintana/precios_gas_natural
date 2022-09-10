console.log("hola mundo");

const alertList = document.querySelectorAll(".alert");
const alerts = [...alertList].map((element) => new bootstrap.Alert(element));

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

$(document).ready(async () => {
	// Promise.all([]).then(() => {});
	let myData = [];
	let data = [];
	const filters = {
		anio: 2022,
		contrato: "TOTAL",
	};
	try {
		myData = await getData(url1, filters);
		data = await myData.records.map((el) => Object.values(el));
	} catch (e) {
		console.error(e);
	}
	$("#data-table").DataTable({
		// initComplete: function () {
		// 	this.api()
		// 		.columns()
		// 		.every(function () {
		// 			var column = this;
		// 			var select = $('<select><option value=""></option></select>')
		// 				.appendTo($(column.footer()).empty())
		// 				.on("change", function () {
		// 					var val = $.fn.dataTable.util.escapeRegex($(this).val());

		// 					column.search(val ? "^" + val + "$" : "", true, false).draw();
		// 				});

		// 			column
		// 				.data()
		// 				.unique()
		// 				.sort()
		// 				.each(function (d, j) {
		// 					select.append('<option value="' + d + '">' + d + "</option>");
		// 				});
		// 		});
		// },
		// ajax: url1,
		// data: "result",
		data: data,
		dom: "Bfrtip",
		// buttons: ["colvis", "excel", "print"],
		columns: columns,
		language: {
			decimal: ".",
			thousands: ",",
		},
	});
});
