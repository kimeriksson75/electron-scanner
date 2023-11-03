const { API_BASE_URL, API_VERSION, API_TAGS_ENDPOINT } = require('../config');

const authenticateTag = async tag => {
	let response;
	
	try {
		response = await fetch(`${API_BASE_URL}/${API_VERSION}/${API_TAGS_ENDPOINT}/authenticate/${tag}`, {
			method: 'GET',
			headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_AUTH_TOKEN}`,

			},
		});
		const result = await response.json();
		return result;
	} catch (error) {
		console.error(error);
	}
};

module.exports = {
    authenticateTag,
};