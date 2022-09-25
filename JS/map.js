console.log("script map.js");

const tile = `https://tile.openstreetmap.org/{z}/{x}/{y}.png`;
const tile2 = `https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png`;
const tile3 = `https://{s}.tile-cyclosm.openstreetmap.fr/[cyclosm|cyclosm-lite]/{z}/{x}/{y}.png`;
const tile4 = `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`;
const tile5 = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";

const myCoord = [-38.011083, -57.541015];
const myMap = L.map("myMap").setView(myCoord, 12);

L.tileLayer(tile, {
	maxZoom: 18,
	attribution:
		'&copy; <a href="http://openstreetmap' +
		'.org">OpenStreetMap</a> contributors',
}).addTo(myMap);

$("#mapModal").on("show.bs.modal", function () {
	setTimeout(function () {
		myMap.invalidateSize();
	}, 300);
});
