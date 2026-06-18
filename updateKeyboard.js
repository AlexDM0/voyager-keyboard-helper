const extractZip = require('./util/findAndUnzip');
const moveToQMK = require('./util/moveToQMK');
const modifyFirmware = require('./util/modifyFirmware');
const patchQmkCore = require('./util/patchQmkCore');
const flashKeyboard = require('./util/flash')


async function run() {
  // Extract the zip file
  await extractZip();

  // Modify the firmware
  modifyFirmware();

  // Move the extracted files to the QMK firmware directory
  moveToQMK();

  // Patch QMK core (idempotent) so hold-on-other-key-press sees the next key
  patchQmkCore();

  // Flash the keyboard
  flashKeyboard();
}

run();
