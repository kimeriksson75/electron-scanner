const { ipcMain } = require('electron')
const { API_BASE_URL, API_VERSION, API_SCANNERS_ENDPOINT, API_AUTH_TOKEN } = require('../config');

const ejse = require('ejs-electron')
const connectScanner = async ({scanner, residences}, window) => {
    ejse.data({ 'id': scanner, 'residences': residences, message: null, error: null })
    window.webContents.loadFile(`./src/views/connect-scanner.ejs`)
    
    await new Promise(  (resolve, reject) => {
        ipcMain.on('post-scanner-form-data', async (event, { residence, type }) => {
            console.log('post-scanner-form-data', residence, type);

            // verify form data
            if (!residence || !type) {
                event.sender.send('post-scanner-form-data-response', { error: "Please select a residence and type" });
                return;
            }

            // post form data
            const body = {
                scanner,
                residence,
                type,
            };

            const result = await postFormData(body);
            
            // console.log('result', result);

            // verify response
            if (!result) {
                event.sender.send('post-scanner-form-data-response', { error: "Scanner not found"});
            }
            resolve(result);
        });
        ipcMain.on('cancel-scanner-form', async (event) => {
            // event.sender.send('cancel-tag-form-response', { message: "Tag form cancelled" });
            reject({ message: "Tag form cancelled" });
        });
     });
};

const postFormData = async (body) => {
    const { scanner, residence, type } = body;
    try {

        const response = await fetch(`${API_BASE_URL}/${API_VERSION}/${API_SCANNERS_ENDPOINT}/${scanner}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_AUTH_TOKEN}`,
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
    connectScanner,
};