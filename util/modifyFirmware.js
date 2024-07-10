const fs = require('fs');
const path = require('path');
const CONFIG = require('../config');

const configSnippet = require('../snippets/config.h.snippet');
const rulesSnippet = require('../snippets/rules.mk.snippet');
const keymapSnippet = require('../snippets/keymap.c.snippet');


// Function to copy files recursively
function copyFilesRecursively(source, destination) {
  // Ensure the destination directory exists
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  // Read all items (files and directories) in the source directory
  const items = fs.readdirSync(source, { withFileTypes: true });

  items.forEach(item => {
    const sourcePath = path.join(source, item.name);
    const destinationPath = path.join(destination, item.name);

    if (item.isDirectory()) {
      // If item is a directory, recursively copy its contents
      copyFilesRecursively(sourcePath, destinationPath);
    } else {
      // If item is a file, copy it to the destination directory
      fs.copyFileSync(sourcePath, destinationPath);
    }
  });
}

function modifyFirmware() {
  // copy all the files in tmp/voyager_alex_source to tmp/voyager_alex_source_modified
  copyFilesRecursively(CONFIG.sourceFolderPath, CONFIG.modifiedSourceFolderPath);

  // update the tmp/voyager_alex_source_modified/rules.mk file and add the rulesBottom to the bottom
  const rulesPath = path.join(CONFIG.modifiedSourceFolderPath, 'rules.mk');
  fs.appendFileSync(rulesPath, rulesSnippet.bottom);

  // update the tmp/voyager_alex_source_modified/config.h file and add the configBottom to the bottom
  const configPath = path.join(CONFIG.modifiedSourceFolderPath, 'config.h');
  fs.appendFileSync(configPath, configSnippet.bottom);

  // update the tmp/voyager_alex_source_modified/keymap.c file and add the keymapBottom to the bottom
  const kemapPath = path.join(CONFIG.modifiedSourceFolderPath, 'keymap.c');
  fs.appendFileSync(kemapPath, keymapSnippet.bottom);

  // update the tmp/voyager_alex_source_modified/keymap.c file and add the keymapTop to the top of the file
  // read the contents of the keymap.c
  const keymapContent = fs.readFileSync(kemapPath, 'utf8');
  // prepend the keymapTop to the keymapContent
  const newKeymapContent = keymapSnippet.top + keymapContent
  const lines = newKeymapContent.split('\n');
  const newLines = [];
  for (const line of lines) {
    newLines.push(line);
    if (line.includes('bool process_record_user(')) {
      newLines.push(keymapSnippet.processRecordUser);
    }
  }
  const newKeymapContentWithProcessRecord = newLines.join('\n');

  // replace all the TT entries with MO
  const newKeymapContentWithMO = newKeymapContentWithProcessRecord.replace(/TT\(/g, 'MO(');

  // replace all the SS_DELAY(100) with SS_DELAY(MACRO_SPEED)
  const newKeymapContentWithSpeed = newKeymapContentWithMO.replace(/SS_DELAY\(100\)/g, 'SS_DELAY(MACRO_SPEED)');

  // write the newKeymapContent to the keymap.c file
  fs.writeFileSync(kemapPath, newKeymapContentWithSpeed);
}

module.exports = modifyFirmware;
