const path = require('path')

const qmkPath = path.join(process.env.HOME,'/development/qmk_firmware');
const keymapName = 'voyager_alex_source';
const oryxFirmwareFolderName = 'voyager_alex_source';
const tmpFolderPath = path.join(__dirname, 'tmp');

const CONFIG = {
  qmkPath,
  qmkKeymapPath: path.join(qmkPath, 'keyboards', 'voyager', 'keymaps', keymapName),
  downloads: path.join(process.env.HOME,'/Downloads'),

  firmwarePattern: /^voyager_alex_.*\.zip$/,

  tmpFolderPath,
  sourceFolderPath: path.join(tmpFolderPath, oryxFirmwareFolderName),
  modifiedSourceFolderPath: path.join(tmpFolderPath, `${oryxFirmwareFolderName}_modified`),
}


module.exports = CONFIG;
