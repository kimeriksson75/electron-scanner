const { API_AUTH_TOKEN, API_BASE_URL, API_VERSION, API_SCANNERS_ENDPOINT } = require('../config');

const verifyScanner = async data => {
	console.info('Verifying scanner', data.scanner);
	let response;
	const body = {
		scanner: data.scanner,
	}
	try {
		response = await fetch(`${API_BASE_URL}/${API_VERSION}/${API_SCANNERS_ENDPOINT}/verify/${data.scanner}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${API_AUTH_TOKEN}`,
			},
			body: JSON.stringify(body),
		});
		const result = await response.json();
		return result;
	} catch (error) {
		console.error(error);
		return null;
	}
};

module.exports = {
    verifyScanner,
};