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

const colors = ["#008800", "#0000FF", "#BB0000"];

const myTriangleMarker = (lat_lng, weight) => {
	const color = gradient(weight, ...colors);
	return L.triangleMarker(lat_lng, {
		renderer: myRenderer, // your canvas renderer (default: L.canvas())
		rotation: 180, // triangle rotation in degrees (default: 0)
		width: 16, // width of the base of triangle (default: 24)
		height: 12, // height of triangle (default: 24)
		color: color,
		fillOpacity: 0.45,
		weight: 2,
		opacity: 0.6,
		// stroke: false,
	});
};

const myCircleMarker = (lat_lng, weight) => {
	const color = gradient(weight, ...colors);
	return L.circleMarker(lat_lng, {
		renderer: myRenderer,
		color: color,
		fillOpacity: 0.75,
		stroke: false,
	});
};

function plotMap(data) {
	let bounds = L.latLngBounds();
	L.tileLayer(tile2, {
		maxZoom: 18,
		attribution:
			'&copy; <a href="http://openstreetmap' +
			'.org">OpenStreetMap</a> contributors',
	}).addTo(myMap);
	const minPrice = Math.min(...data.map((num) => num.precio));
	const maxPrice = Math.max(...data.map((num) => num.precio));
	for (let d of data) {
		let lat_lng = [d.latitud, d.longitud];
		// let marker = L.marker(lat_lng, { icon: markerIcon })
		let weight = (d.precio - minPrice) / (maxPrice - minPrice);
		let marker = myTriangleMarker(lat_lng, weight);

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
		const data = removeOutliers(
			filterDataWithGeoJSON(filteredData),
			"precio",
			0.9,
			100
		);
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

//how to get a color from a gradient based on a value?
function pickHex(color1, color2, weight) {
	var w1 = weight;
	var w2 = 1 - w1;
	var rgb = [
		Math.round(color1[0] * w1 + color2[0] * w2),
		Math.round(color1[1] * w1 + color2[1] * w2),
		Math.round(color1[2] * w1 + color2[2] * w2),
	];
	return rgb;
}

// t in ragne 0..1, start-middle-end are colors in hex e.g. #FF00FF
function gradient(t, start, middle, end) {
	return t >= 0.5
		? linear(middle, end, (t - 0.5) * 2)
		: linear(start, middle, t * 2);
}

function linear(s, e, x) {
	let r = byteLinear(s[1] + s[2], e[1] + e[2], x);
	let g = byteLinear(s[3] + s[4], e[3] + e[4], x);
	let b = byteLinear(s[5] + s[6], e[5] + e[6], x);
	return "#" + r + g + b;
}

// a,b are hex values from 00 to FF; x is real number in range 0..1
function byteLinear(a, b, x) {
	let y = (("0x" + a) * (1 - x) + ("0x" + b) * x) | 0;
	return y.toString(16).padStart(2, "0"); // hex output
}

const removeOutliers = function (arr, prop, percentageDecimal, min, max) {
	let temp;
	return _.flatten(
		_.values(
			_.chain(arr)
				.groupBy(prop)
				.filter(function (value, key) {
					key = parseInt(key) || key;
					return (min ? key >= min : true) && (max ? key <= max : true);
				})
				.tap(function (items) {
					temp = items;
				})
				.value()
		)
			.sort(function (a, b) {
				return a.length < b.length;
			})
			.slice(0, Math.ceil(temp.length * percentageDecimal))
	);
};
