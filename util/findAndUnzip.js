const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');
const CONFIG = require('../config');

async function extractZip() {
  try {
    // Read the directory synchronously
    const files = fs.readdirSync(CONFIG.downloads);
    const tmpDir = CONFIG.tmpFolderPath;

    // Filter and sort files synchronously
    const zipFiles = files.filter(file => CONFIG.firmwarePattern.test(file)).map(file => ({
      name: file,
      time: fs.statSync(path.join(CONFIG.downloads, file)).mtime.getTime(),
    })).sort((a, b) => b.time - a.time);

    if (zipFiles.length === 0) {
      console.error('No matching zip files found');
      return;
    }

    const mostRecentFile = zipFiles[0].name;
    console.log('Found most recent firmware file:', mostRecentFile);

    // print how long ago this file was modified in seconds, minutes, or hours
    const timeDiff = Date.now() - zipFiles[0].time;
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (minutes < 1) {
      console.log('File was modified', seconds, 'seconds ago\n');
    }
    else if (hours < 1) {
      console.log('File was modified', minutes, 'minutes ago\n');
    }
    else {
      console.log('File was modified', hours, 'hours ago\n');
    }



    // Delete the tmp directory if it exists
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true });
    }

    // Create the tmp directory
    fs.mkdirSync(tmpDir);

    // Extract the zip file to the tmp directory
    await extract(path.join(CONFIG.downloads, mostRecentFile), { dir: tmpDir })
    console.log('Extraction complete')
  } catch (err) {
    console.error('Error in extractZipSync:', err);
    throw err
  }
}


module.exports = extractZip;
