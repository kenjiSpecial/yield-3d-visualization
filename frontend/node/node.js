const axios = require('axios');

const LOCAL_URL = 'http://localhost:8000/';
const jsonfile = require('jsonfile');
const file = './node/data.json';

axios
	.get(LOCAL_URL)
	.then(function (response) {
		// console.log(response);
		// store.dispatch(loadedHandler(response.data));
		jsonfile.writeFile(file, { data: response.data, country: 'usa' });
	})
	.catch(function (error) {
		console.log(error);
	})
	.finally(function () {
		// always executed
	});
