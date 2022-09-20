const table = $("#data-table");
const anioSelector = document.getElementById("anio");
const filterSeletors = document.querySelectorAll(".form-select");

const GAS =
	"/api/3/action/datastore_search?resource_id=d87ca6ab-2979-474b-994a-e4ba259bb217";

let endpoint = GAS;

let filters = {
	// anio: 2022,
	// cuenca: "Noroeste",
	// contrato: "TOTAL",
};

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

$(document).ready(() => {
	fetchAllData()
		.then((data) => {
			getData(GAS);
			console.log(data);
			showTable(data);
		})
		.catch((e) => console.error(e));
});

function showTable(data) {
	table.DataTable({
		data: data,
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
						cells: ["E", "F", "G", "H", "I", "J", "K"],
						style: {
							numFmt: "#,##0.00;-#,##0.00;-",
						},
					},
				],
			},
		],
		columnDefs: [
			{
				width: "10%",
				className: "dt-center",
				render: $.fn.dataTable.render.number(",", ".", 2, "").display,
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
