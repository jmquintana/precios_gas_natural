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

L.tileLayer(tile2, {
	maxZoom: 18,
	attribution:
		'&copy; <a href="http://openstreetmap' +
		'.org">OpenStreetMap</a> contributors',
}).addTo(myMap);
// L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(myMap);

let myRenderer = L.canvas({ padding: 0.5 });
const markerIcon = L.icon.glyph({ prefix: "bi", glyph: "bi-fuel-pump" });

function plotMap(data) {
	let bounds = L.latLngBounds();
	for (let d of data) {
		let lat_lng = [d.latitud, d.longitud];
		let marker = L.marker(lat_lng, { icon: markerIcon }).addTo(myMap);
		// let marker = L.circleMarker(lat_lng, {
		// 	renderer: myRenderer,
		// }).addTo(myMap);

		markers.push(marker);
		marker.bindPopup(
			`
			<div class="popupHeader" style="text-align:center"><b>${d.empresabandera}</b></div>
                <table>
                    <tr>
                        <td style="text-align:left">Precio (ars/ltr):</td>
                        <td style="text-align:right"><b>${d.precio}</b></td>
                    </tr>
                    <tr>
                        <td style="text-align:left">Vigencia:</td>
                        <td style="text-align:right"><b>${d.indice_tiempo}</b></td>
                    </tr>
					<tr>
						<td style="text-align:left">Localidad:</td>
						<td style="text-align:right"><b>${d.localidad}</b></td>
					</tr>
                    <tr>
                        <td style="text-align:left">Región:</td>
                        <td style="text-align:right"><b>${d.region}</b></td>
                    </tr>
                </table>
			`
		);
		bounds.extend(lat_lng);
	}
	myMap.fitBounds(bounds);
}

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
