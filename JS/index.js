console.log("hola mundo");

const alertList = document.querySelectorAll(".alert");
const alerts = [...alertList].map((element) => new bootstrap.Alert(element));

const url1 =
	"http://datos.minem.gob.ar/api/3/action/datastore_search?offset=000&resource_id=d87ca6ab-2979-474b-994a-e4ba259bb217#";
const url2 =
	"http://datos.energia.gob.ar/api/3/action/datastore_search?resource_id=80ac25de-a44a-4445-9215-090cf55cfda5";

async function getData(url) {
	const api = await fetch(url);
	const apiJson = await api.json();

	return console.log(apiJson.result.records);
}

getData(url1);
