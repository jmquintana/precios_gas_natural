console.log("script map.js");

const tile = `https://tile.openstreetmap.org/{z}/{x}/{y}.png`;
const tile2 = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";

let markers = [];
// const myCoord = [-38.011083, -57.541015];
const myCoord = [-34.56595456587895, -58.451184908837234];

const myMap = new L.Map("myMap", {
	fullscreenControl: {
		pseudoFullscreen: false, // if true, fullscreen to page width and height
	},
});

// myMap.setView(myCoord, 13);

let myRenderer = L.canvas({ padding: 0.5 });
const markerIcon = L.icon.glyph({ prefix: "bi", glyph: "bi-fuel-pump" });

// const myTriangleMarker = L.triangleMarker(latLng, {
// 	renderer: renderer, // your canvas renderer (default: L.canvas())
// 	rotation: 45, // triangle rotation in degrees (default: 0)
// 	width: 12, // width of the base of triangle (default: 24)
// 	height: 8, // height of triangle (default: 24)
// });

function plotMap(data) {
	let bounds = L.latLngBounds();

	L.tileLayer(tile2, {
		maxZoom: 18,
		attribution:
			'&copy; <a href="http://openstreetmap' +
			'.org">OpenStreetMap</a> contributors',
	}).addTo(myMap);
	for (let d of data) {
		let lat_lng = [d.latitud, d.longitud];
		// let marker = L.marker(lat_lng, { icon: markerIcon })
		let marker = L.circleMarker(lat_lng, {
			renderer: myRenderer,
		});

		marker.addTo(myMap);
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
	let markersLength = markers.length;
	console.log({ markers, markersLength });
	myMap.fitBounds(bounds);
}

$("#mapModal").on("show.bs.modal", function () {
	setTimeout(function () {
		myMap.invalidateSize();
		const filteredData = getFilteredDataInDataTable();
		const data = filterDataWithGeoJSON(filteredData);
		console.log(data);
		plotMap(data);
	}, 300);
});

function getFilteredDataInDataTable() {
	var table = $("#data-table").DataTable();
	const data = Array.from(table.rows({ search: "applied" }).data());
	return data;
}

function filterDataWithGeoJSON(data) {
	return data.filter((element) => !!element.latitud);
}

$("#mapModal").on("hidden.bs.modal", function () {
	markers = [];
	myMap.eachLayer((layer) => {
		myMap.removeLayer(layer);
	});
});
