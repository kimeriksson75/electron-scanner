const fs = require('fs')

const updateConfigJSON = async ({ scanner, token }) => {
	console.info('Updating config.json');
	// populate scanner data
	scannerData = {
		scannerId: scanner.scannerId,
        residenceId: scanner.residenceId,
        serviceId: scanner.serviceId,
		types: scanner.types,
		token
	};
	const content = JSON.stringify(scannerData, null, 4)
    return new Promise((resolve, reject) => {
        fs.writeFile('./config.json', content, 'utf8', function (err) {
            if (err) {
                console.error("An error occured while writing JSON Object to File.");
                reject()
            }
            console.info("JSON file has been saved.");
            resolve(scannerData);
        });
    });
}

const getConfigJSON = async () => new Promise((resolve, reject) => {
    fs.readFile('./config.json', 'utf8', function (err, data) {
        if (err) {
            console.error("An error occured while writing JSON Object to File.");
            reject()
        }
        const scannerData = JSON.parse(data);
        console.info("JSON data", scannerData);
        resolve(scannerData);
    });
})

module.exports = {
    updateConfigJSON,
    getConfigJSON,
};