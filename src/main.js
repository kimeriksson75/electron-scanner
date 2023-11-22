const { app, BrowserWindow, shell, ipcMain, ipcRenderer } = require('electron')
const path = require('path')
const { APP_BASE_URL } = require('./config');
const { updateConfigJSON, getConfigJSON } = require('./utils/config');
const contextBridge = require('electron').contextBridge;
const { connectScanner,  } = require('./scanner/connect');
const { verifyScanner } = require('./scanner/verify');
const { authenticateScanner } = require('./scanner/authenticate');
const { verifyTag } = require('./tag/verify');
const { connectTag } = require('./tag/connect');
const { authenticateTag } = require('./tag/authenticate');
const ejse = require('ejs-electron')
const { awaitScan } = require('./utils/python-shell');
const { dayBookings } = require('./utils/day-bookings');

let window;

const createWindow = () => {
    window = new BrowserWindow({
        titleBarStyle: 'hidden',
        width: 1280,
        height: 960,
        backgroundColor: '#252422',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    });
    // ejse.data({ step: '1', value: '0' })
    // window.webContents.loadFile('./src/views/setup.ejs')
    window.setKiosk(true)
    // window.webContents.openDevTools()
}

const closeApp = async (contents) => {
    console.log('closeApp')
    await new Promise(resolve => setTimeout(resolve, 2000));
    ejse.data({ title: "Hej", message: `Skanna din RFID-tagg`, error: null })
    window.webContents.loadFile('./src/views/success.ejs');

    initiateScan();
}

const didFinishLoad = () => {
    window.webContents.insertCSS('html, body { background-color: #f00; cursor: none; }')
    window.webContents.removeListener('did-finish-load', didFinishLoad)
}
const didStartNavigation = (event, target) => {
    if (target.includes(`${APP_BASE_URL}/user/logout`)) {
        window.webContents.removeListener('did-start-navigation', didStartNavigation)
        closeApp();
    }
}

const launchApp = async (accessToken, serviceId, residenceId) => {
    const appURL = `${APP_BASE_URL}/user/authenticate/${accessToken}/${serviceId}/${residenceId}`
    console.log('appURL', appURL);
    window.webContents.loadURL(appURL);

    window.webContents.on('did-finish-load', didFinishLoad);
    window.webContents.on("did-start-navigation", didStartNavigation);
}
const onScan = async (data) => {
    console.log('onScan', data);
    ejse.data({ title: "Toppen,", message: `ett ögonblick...`, error: null })
    window.webContents.loadFile('./src/views/success.ejs');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await verifyTag(data);
    const { tag = null, user: existingUser = null } = result;
    if(!tag || !existingUser) {
        // if not verified, connect tag
        try {

            const connectedTag = await connectTag({
                ...result,
                tag: data.tag,
                scannerId: data.scannerId
            },
            window);
        } catch (err) {
            console.error(err);
            initiateScan();
        }
       
    };

    // authenticate scanner
    authResult = await authenticateTag(data.tag);
    const { user, service, refreshToken, accessToken } = authResult;
    const { _id } = service;
    ejse.data({ title: `Välkommen ${user?.firstname}`, message: "", error: null })
    window.webContents.loadFile('./src/views/success.ejs');
    await new Promise(resolve => setTimeout(resolve, 2000));
    // open app
    launchApp(refreshToken, _id, user.residence)
}
const initiateScan = async () => {
    //scan view
    const { serviceId, token } = await getConfigJSON();
    const dayBookingsRequestData = {
        serviceId,
        token
    }
    const { timeslots, date} = await dayBookings(dayBookingsRequestData)

    ejse.data({ title: "Hej där!", message: `Skanna din RFID-tagg.`, timeslots, date, error: null })
    window.webContents.loadFile('./src/views/await-scan.ejs');
    
    let tag;
    try {
        tag = await awaitScan();
    } catch (err) {
        console.error(err);
    }
    onScan({
        tag,
        userId: '',
        scannerId: scannerData.scannerId
    })
}
const setupScanner = async () => { 
    console.info('Setting up scanner');

    const data = {
        scanner: 'test-scanner'
    };
    
    // verify scanner
    //TODO: display setup progress in view
    ejse.data({ title: '🚀', message: '', error: null })
    window.webContents.loadFile('./src/views/success.ejs');
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = await verifyScanner(data);
    
    const { scanner = null } = result;
    let authResult = null;
    let connectResult;
    if (!scanner) {
        // if not verified, connect scanner
        window.webContents.send('progress', '25');
        // window.webContents.loadFile('./src/views/setup.ejs');
        await new Promise(resolve => setTimeout(resolve, 500));
        try {

            connectResult = await connectScanner({
                ...result,
                scanner: data.scanner,
            },
            window
            );
        } catch (err) {
            console.error(err);
            setupScanner();
        }
    }
    console.log('connectResult', connectResult)
    // authenticate scanner
    // ejse.data({ step: '3', value: '50' })
    // window.webContents.send('progress', '50');
    // window.webContents.loadFile('./src/views/setup.ejs');
    await new Promise(resolve => setTimeout(resolve, 500));
    authResult = await authenticateScanner(data.scanner);
    console.log('authResult', authResult)
    
    // save authenticated scanner data to config.json
    // ejse.data({ step: '4', value: '75' })
    // window.webContents.send('progress', '75');

    // window.webContents.loadFile('./src/views/setup.ejs');

    await new Promise(resolve => setTimeout(resolve, 500));
	const resultData = await updateConfigJSON(authResult);
    scannerData = resultData;
    
    // set API_AUTH_TOKEN
    process.env.API_AUTH_TOKEN = resultData.token;

    console.log(process.env.API_AUTH_TOKEN)

    // ejse.data({ step: '5', value: '100' })
    // window.webContents.send('progress', '100');

    // window.webContents.loadFile('./src/views/setup.ejs');
    await new Promise(resolve => setTimeout(resolve, 500));

    initiateScan();
}


app.whenReady().then(async () => {
    createWindow()
    window.maximize();
    window.webContents.on('crashed', (e) => {
        app.relaunch();
        app.quit()
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setupScanner();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});