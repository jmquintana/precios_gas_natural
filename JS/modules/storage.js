console.log("script storage.js");

function save(data, id = "data") {
	if (data.length) {
		console.log("Saving data to localStorage!");
		localStorage.setItem(id, JSON.stringify(data));
	} else {
		console.error("There is no data!");
	}
}

function get(id = "data") {
	const data = localStorage.getItem(id);
	if (data && data.length) {
		console.log("Getting data from localStorage!");
		return JSON.parse(data);
	} else {
		return false;
		console.error("Fail getting data from localStorage!");
	}
}

const Storage = {
	save: save,
	get: get,
};
