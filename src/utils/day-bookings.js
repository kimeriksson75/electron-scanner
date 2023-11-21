const { API_BASE_URL, API_VERSION, API_BOOKINGS_ENDPOINT, API_AUTH_TOKEN } = require('../config');
const moment = require('moment');
const dayBookings = async ({ serviceId, token }) => {
    try {
        const date = moment().format();
        const isWeekDay = moment(date).isoWeekday() < 6;
        const url = `${API_BASE_URL}/${API_VERSION}/${API_BOOKINGS_ENDPOINT}/service/${serviceId}/date/${date}`;
        console.log(url);
        const response = await fetch(`${API_BASE_URL}/${API_VERSION}/${API_BOOKINGS_ENDPOINT}/service/${serviceId}/date/${date}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        const json = await response.json();
        const { timeslots = null, alternateTimeslots = null } = json;

        return {
            timeslots: isWeekDay ? timeslots : alternateTimeslots,
            date: moment(date).format('MMM D'),
        };

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    dayBookings,
};