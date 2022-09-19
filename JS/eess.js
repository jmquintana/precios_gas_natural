const table = $("#data-table");
const anioSelector = document.getElementById("anio");
const filterSeletors = document.querySelectorAll(".form-select");

const SUPER =
	"/api/3/action/datastore_search?resource_id=80ac25de-a44a-4445-9215-090cf55cfda5";

let endpoint = SUPER;

let filters = {
	provincia: "BUENOS AIRES",
	producto: "Nafta (súper) entre 92 y 95 Ron",
	idtipohorario: 2,
};

const columns = [
	{ title: "Año-Mes", data: "indice_tiempo" },
	// { title: "idempresa", data: "idempresa" },
	{ title: "Cuit", data: "cuit" },
	{ title: "Empresa", data: "empresa" },
	// { title: "direccion", data: "direccion" },
	{ title: "Localidad", data: "localidad" },
	{ title: "Provincia", data: "provincia" },
	// { title: "region", data: "region" },
	// { title: "idproducto", data: "idproducto" },
	{ title: "Producto", data: "producto" },
	// { title: "idtipohorario", data: "idtipohorario" },
	// { title: "tipohorario", data: "tipohorario" },
	{ title: "Precio", data: "precio" },
	{ title: "Publicado", data: "fecha_vigencia" },
	// { title: "idempresabandera", data: "idempresabandera" },
	{ title: "Bandera", data: "empresabandera" },
	// { title: "latitud", data: "latitud" },
	// { title: "longitud", data: "longitud" },
	// { title: "geojson", data: "geojson" },
];

$(document).ready(() => {
	fetchAllData(SUPER, filters)
		.then((data) => {
			getData(SUPER);
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
				targets: [6],
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
