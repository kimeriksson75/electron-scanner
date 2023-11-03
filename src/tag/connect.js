const { ipcMain } = require('electron')
const { API_BASE_URL, API_VERSION, API_TAGS_ENDPOINT, API_AUTH_TOKEN } = require('../config');

const ejse = require('ejs-electron')

const connectTag = async ({ tag, scannerId, users, services }, window) => {
    ejse.data({ id: tag, scannerId: scannerId, users: users, services: services, message: null, error: null })
    window.webContents.loadFile(`./src/views/connect-tag.ejs`)
    
    await new Promise(  (resolve, reject) => {
        ipcMain.on('post-tag-form-data', async (event, { user, service }) => {
            // verify form data
            if (!user) {
                event.sender.send('post-tag-form-data-response', { error: "Please select a user" });
                return;
            }
            if (!service) {
                event.sender.send('post-tag-form-data-response', { error: "Please select a service" });
                return;
            }

            // post form data
            const body = {
                tag,
                scannerId,
                username: user,
                servicename: service
            };

            const result = await postFormData(body);
            
            console.log('result', result);

            // verify response
            if (!result) {
                event.sender.send('post-tag-form-data-response', { error: "Tag not found"});
            }
            resolve(result);
            
        });
     });
};

const postFormData = async (body) => {
    try {

        const response = await fetch(`${API_BASE_URL}/${API_VERSION}/${API_TAGS_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_AUTH_TOKEN}`,
            },
            body: JSON.stringify(body),
        });
        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error);
        return null;
    }
};

module.exports = {
    connectTag,
};