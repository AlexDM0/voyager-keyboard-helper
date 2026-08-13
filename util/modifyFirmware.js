const fs = require('fs');
const path = require('path');
const CONFIG = require('../config');

const configSnippet = require('../snippets/config.h.snippet');
const rulesSnippet = require('../snippets/rules.mk.snippet');
const keymapSnippet = require('../snippets/keymap.c.snippet');
const macros = require('../snippets/macros');


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

  const keymapPath = path.join(CONFIG.modifiedSourceFolderPath, 'keymap.c');

  // Rename Oryx's callbacks while the file is still the pristine export: the
  // snippet defines the real entry points with these exact signatures, so
  // renaming after the snippet is added could silently hit the snippet's own
  // wrappers (process_record_oryx calling itself -> infinite recursion) instead
  // of throwing when an export stops matching the anchors.
  const oryxKeymapContent = fs.readFileSync(keymapPath, 'utf8');
  const renamedKeymapContent = renameOryxCallbacks(oryxKeymapContent);

  // sandwich the renamed export between the snippet's top and bottom
  const combinedKeymapContent = keymapSnippet.top + renamedKeymapContent + keymapSnippet.bottom;

  // replace all the TT entries with MO
  const keymapContentWithMO = combinedKeymapContent.replace(/TT\(/g, 'MO(');

  const keymapContentWithMacros = insertMacros(keymapContentWithMO);

  // replace all the SS_DELAY(100) with SS_DELAY(MACRO_SPEED)
  const keymapContentWithSpeed = keymapContentWithMacros.replace(/SS_DELAY\(100\)/g, 'SS_DELAY(MACRO_SPEED)');

  fs.writeFileSync(keymapPath, keymapContentWithSpeed);
}


// Oryx generates its own process_record_user() and get_tapping_term(), and QMK
// allows only one definition of each. Rename the generated ones to *_oryx so the
// keymap snippet can define the real entry points, add its own behaviour and
// delegate to Oryx's -- nothing Oryx expresses is lost.
function renameOryxCallbacks(content) {
  const renames = [
    ['bool process_record_user(uint16_t keycode, keyrecord_t *record) {',
      'bool process_record_oryx(uint16_t keycode, keyrecord_t *record) {'],
    ['uint16_t get_tapping_term(uint16_t keycode, keyrecord_t *record) {',
      'uint16_t get_tapping_term_oryx(uint16_t keycode, keyrecord_t *record) {'],
  ];

  let renamedContent = content;
  for (const [from, to] of renames) {
    if (!renamedContent.includes(from)) {
      throw new Error(`modifyFirmware: expected Oryx callback not found in keymap.c\n  expected: ${from}`);
    }
    renamedContent = renamedContent.replace(from, to);
  }

  return renamedContent;
}


function insertMacros(newKeymapContentWithMO) {
  let content = newKeymapContentWithMO
  // construct macro string
  for (const macroKey in macros) {
    const macro = macros[macroKey];
    const str = macro.with.join(' SS_DELAY(MACRO_SPEED) ').toUpperCase();
    content = content.replace(macro.replace, str);
  }

  return content;
}

module.exports = modifyFirmware;
