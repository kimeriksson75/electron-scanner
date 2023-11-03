const { API_BASE_URL, API_VERSION, API_USERS_ENDPOINT } = require('../config');
const authenticateUser = async user => {
    bcrypt.
	console.info('Authenticate user', user);
	let response;
	
	try {
		response = await fetch(`${API_BASE_URL}/${API_VERSION}/${API_USERS_ENDPOINT}/authenticate/${tag}`, {
			method: 'GET',
			headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_AUTH_TOKEN}`,

			},
		});
		const result = await response.json();
		return result;
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
    authenticateUser,
};