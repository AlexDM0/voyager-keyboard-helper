
const { execSync } = require('child_process');
const CONFIG = require('../config');

function flashKeyboard() {
  // Assuming the patch file is located in the downloads folder and named 'qmk_patch.diff'
  try {
    // Navigate to the QMK firmware directory
    process.chdir(CONFIG.qmkPath);

    // Run QMK flash
    console.log('Running QMK flash...');
    execSync('qmk flash', { stdio: 'inherit' }); // Using stdio: 'inherit' to show the output in the console
    console.log('QMK flash completed.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

module.exports = flashKeyboard;
