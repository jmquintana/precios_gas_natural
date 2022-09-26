console.log("script map.js");

const tile = `https://tile.openstreetmap.org/{z}/{x}/{y}.png`;
const tile2 = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";
const markers = [];
// const myCoord = [-38.011083, -57.541015];
const myCoord = [-34.56595456587895, -58.451184908837234];

const myMap = new L.Map("myMap", {
	fullscreenControl: {
		pseudoFullscreen: false, // if true, fullscreen to page width and height
	},
});

// myMap.setView(myCoord, 13);

L.tileLayer(tile, {
	maxZoom: 18,
	attribution:
		'&copy; <a href="http://openstreetmap' +
		'.org">OpenStreetMap</a> contributors',
}).addTo(myMap);

$("#mapModal").on("show.bs.modal", function () {
	setTimeout(function () {
		myMap.invalidateSize();
		var table = $("#data-table").DataTable();
		const data = Array.from(table.rows({ search: "applied" }).data());
		console.log(data);
		plotMap(data);
	}, 300);
});

$("#mapModal").on("hidden.bs.modal", function () {
	markers.forEach((marker) => myMap.removeLayer(marker));
	// markers.forEach((marker) => marker.remove());
});

let markerIcon = L.icon.glyph({ prefix: "bi", glyph: "bi-fuel-pump" });

function plotMap(data) {
	let arr = [...data];
	let bounds = L.latLngBounds();
	for (let d of arr) {
		let lat_lng = [d.latitud, d.longitud];
		let marker = L.marker(lat_lng, { icon: markerIcon }).addTo(myMap);
		markers.push(marker);
		marker.bindPopup(
			`<b>${d.empresabandera}</b><br>Precio:${d.precio}<br />Fecha: ${d.indice_tiempo}`
		);
		bounds.extend(lat_lng);
	}
	console.log(bounds);
	myMap.fitBounds(bounds);
}
