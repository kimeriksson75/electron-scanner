const { app, BrowserWindow, shell, ipcMain, ipcRenderer } = require('electron')
const path = require('path')
const { APP_BASE_URL } = require('./config');
const { updateConfigJSON } = require('./utils/update-config');
const contextBridge = require('electron').contextBridge;
const { connectScanner,  } = require('./scanner/connect');
const { verifyScanner } = require('./scanner/verify');
const { authenticateScanner } = require('./scanner/authenticate');
const { verifyTag } = require('./tag/verify');
const { connectTag } = require('./tag/connect');
const { authenticateTag } = require('./tag/authenticate');
const ejse = require('ejs-electron')

let window;

const createWindow = () => {
    window = new BrowserWindow({
        width: 1280,
        height: 960,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    });
    ejse.data({ step: '1', value: '0' })
    window.webContents.loadFile('./src/views/setup.ejs')
    // window.webContents.openDevTools()

}
const closeApp = async () => {
    console.log('closeApp')
    ejse.data({ title: "Please scan RFID tag", message: `Let's hope for the best...`, error: null })
    window.webContents.loadFile(`./src/views/success.ejs`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    onScan({
        tag: 'test-tag-3',
        userId: '',
        scannerId: scannerData.scannerId
    })
}
const launchApp = async (accessToken, serviceId, residenceId) => {
    const appURL = `${APP_BASE_URL}/user/authenticate/${accessToken}/${serviceId}/${residenceId}`
    console.log('appURL', appURL);
    window.loadURL(appURL);
    const contents = window.webContents
    contents.on("did-start-navigation", (event, target) => {
        console.log(target);
        if (target.includes(`${APP_BASE_URL}/user/login`)) {
            closeApp();
        }
    });
}
const onScan = async (data) => {
    console.log('onScan', data);
    ejse.data({ title: "RFID detected", message: `making sure all is good..`, error: null })
    window.webContents.loadFile(`./src/views/success.ejs`)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = await verifyTag(data);
    const { tag = null, user: existingUser = null } = result;
    if(!tag || !existingUser) {
        // if not verified, connect tag
        const connectedTag = await connectTag({
            ...result,
            tag: data.tag,
            scannerId: data.scannerId
        },
        window);
       
    };

    // authenticate scanner
    authResult = await authenticateTag(data.tag);
    const { user, service, refreshToken, accessToken } = authResult;
    const { _id } = service;
    ejse.data({ title: "Tag successfully authenticated", message: `Tag successfully authenticated as ${user?.username}`, error: null })
    window.webContents.loadFile(`./src/views/success.ejs`)
    await new Promise(resolve => setTimeout(resolve, 1000));
    // open app
    launchApp(accessToken, _id, user.residence)
}

const setupScanner = async () => { 
    console.info('Setting up scanner');

    const data = {
        scanner: 'test-scanner'
    };
    
    // verify scanner
    //TODO: display setup progress in view
    ejse.data({ step: '1', value: '0' })
    window.webContents.loadFile('./src/views/setup.ejs')
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await verifyScanner(data);
    
    const { scanner = null } = result;
	let authResult;
    if (!scanner) {
        // if not verified, connect scanner
        ejse.data({ step: '2', value: '25' })
        window.webContents.loadFile('./src/views/setup.ejs')
        await new Promise(resolve => setTimeout(resolve, 100));

        const connectedScanner = await connectScanner({
            ...result,
            scanner: data.scanner,
        },
            window
        );
    }
    // authenticate scanner
    ejse.data({ step: '3', value: '50' })
    window.webContents.loadFile('./src/views/setup.ejs')
    await new Promise(resolve => setTimeout(resolve, 100));
    authResult = await authenticateScanner(data.scanner);
    
    // save authenticated scanner data to config.json
    ejse.data({ step: '4', value: '75' })
    window.webContents.loadFile('./src/views/setup.ejs')

    await new Promise(resolve => setTimeout(resolve, 100));
	const resultData = await updateConfigJSON(authResult);
    scannerData = resultData;
    
    // set API_AUTH_TOKEN
    process.env.API_AUTH_TOKEN = resultData.token;

    console.log(process.env.API_AUTH_TOKEN)

    //success view
    ejse.data({ step: '5', value: '100' })
    window.webContents.loadFile('./src/views/setup.ejs')
    await new Promise(resolve => setTimeout(resolve, 100));
    
    ejse.data({ title: "Please scan RFID tag", message: `Let's hope for the best...`, error: null })
    window.webContents.loadFile(`./src/views/success.ejs`)

    await new Promise(resolve => setTimeout(resolve, 5000));
    
    onScan({
        tag: 'test-tag-3',
        userId: '',
        scannerId: scannerData.scannerId
    })
}
app.whenReady().then(async () => {
    createWindow()
    await new Promise(resolve => setTimeout(resolve, 1000));

    setupScanner();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});