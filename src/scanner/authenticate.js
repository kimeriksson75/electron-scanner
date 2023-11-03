const { API_BASE_URL, API_VERSION, API_SCANNERS_ENDPOINT } = require('../config');

const authenticateScanner = async scanner => {
	console.info('Authenticate scanner', scanner);
	let response;
	
	try {
		response = await fetch(`${API_BASE_URL}/${API_VERSION}/${API_SCANNERS_ENDPOINT}/authenticate/${scanner}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const result = await response.json();
		return result;
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
    authenticateScanner,
};