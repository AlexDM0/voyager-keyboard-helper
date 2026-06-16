const path = require('path')

const qmkPath = path.join(process.env.HOME,'/development/qmk_firmware');
const keymapName = 'zsa_voyager_alexdm0_source';
const oryxFirmwareFolderName = 'zsa_voyager_alexdm0_source';
const tmpFolderPath = path.join(__dirname, 'tmp');

const CONFIG = {
  qmkPath,
  qmkKeymapPath: path.join(qmkPath, 'keyboards', 'zsa', 'voyager', 'keymaps', keymapName),
  downloads: path.join(process.env.HOME,'/Downloads'),

  firmwarePattern: /^zsa_voyager_.*_alexdm0_.*\.zip$/,

  tmpFolderPath,
  sourceFolderPath: path.join(tmpFolderPath, oryxFirmwareFolderName),
  modifiedSourceFolderPath: path.join(tmpFolderPath, `${oryxFirmwareFolderName}_modified`),
}


module.exports = CONFIG;
