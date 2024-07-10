const extractZip = require('./util/findAndUnzip');
const moveToQMK = require('./util/moveToQMK');
const modifyFirmware = require('./util/modifyFirmware');
const flashKeyboard = require('./util/flash')


async function run() {
  // Extract the zip file
  await extractZip();

  // Modify the firmware
  modifyFirmware();

  // Move the extracted files to the QMK firmware directory
  moveToQMK();

  // Flash the keyboard
  flashKeyboard();
}

run();
