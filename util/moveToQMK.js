const fs = require('fs');
const path = require('path');
const CONFIG = require('../config');


function copyFilesSync(source, destination) {
  // Remove the destination directory if it exists
  if (fs.existsSync(destination)) {
    fs.rmdirSync(destination, { recursive: true });
  }

  // Ensure the destination directory exists, if not create it
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  // Read all files in the source directory
  const files = fs.readdirSync(source);

  // Copy each file to the destination directory
  files.forEach(file => {
    const srcFile = path.join(source, file);
    const destFile = path.join(destination, file);
    fs.copyFileSync(srcFile, destFile);
  });

  console.log('Files copied successfully');
}

// Execute the copy operation
function copyFiles() {
  copyFilesSync(CONFIG.modifiedSourceFolderPath, CONFIG.qmkKeymapPath);
}

module.exports = copyFiles;
