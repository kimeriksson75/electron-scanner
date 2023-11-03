const { API_BASE_URL, API_VERSION, API_TAGS_ENDPOINT } = require('../config');

const verifyTag = async ({tag, userId}) => {
	let response;
	const body = {
        tag,
        userId
	}
	try {
		response = await fetch(`${API_BASE_URL}/${API_VERSION}/${API_TAGS_ENDPOINT}/verify/${tag}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.API_AUTH_TOKEN}`,
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
    verifyTag,
};