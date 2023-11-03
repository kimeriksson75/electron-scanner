const dotenv = require("dotenv");
require('dotenv').config({ override: true })
dotenv.config();

module.exports = {
    API_AUTH_TOKEN: process.env.AUTH_TOKEN,
    API_BASE_URL: process.env.API_BASE_URL,
    API_VERSION: process.env.API_VERSION,
    API_TAGS_ENDPOINT: process.env.API_TAGS_ENDPOINT,
    API_SCANNERS_ENDPOINT: process.env.API_SCANNERS_ENDPOINT,
    API_USERS_ENDPOINT: process.env.API_USERS_ENDPOINT,
    APP_BASE_URL: process.env.APP_BASE_URL,
};