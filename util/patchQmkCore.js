const fs = require('fs');
const path = require('path');
const CONFIG = require('../config');

// Mod QMK core so the tap-hold FSM can consult a next-key-aware variant of
// hold-on-other-key-press. Rather than change the existing
// get_hold_on_other_key_press() signature (which has a second weak default in
// action.c and call sites that don't have the interrupting key), we ADD a new
// callback get_hold_on_other_key_press_next(tap_hold, record, other, other_record)
// and only repoint the macro used inside process_tapping() -- where `keyp` is
// the interrupting record already handed to get_chordal_hold(). The new callback
// defaults to delegating to the original, so behaviour is unchanged unless a
// keymap overrides it.
//
// Idempotent: safe to run on every build; re-applies if QMK is re-cloned/pulled.
function patchQmkCore() {
  const headerPath = path.join(CONFIG.qmkPath, 'quantum', 'action_tapping.h');
  const sourcePath = path.join(CONFIG.qmkPath, 'quantum', 'action_tapping.c');

  patchFile(headerPath, [
    {
      // declare the new callback right after the existing prototype
      from: 'bool     get_hold_on_other_key_press(uint16_t keycode, keyrecord_t *record);',
      to:
        'bool     get_hold_on_other_key_press(uint16_t keycode, keyrecord_t *record);\n' +
        'bool     get_hold_on_other_key_press_next(uint16_t keycode, keyrecord_t *record, uint16_t other_keycode, keyrecord_t *other_record);',
    },
  ]);

  patchFile(sourcePath, [
    {
      // add a weak default that delegates to the original, just before it
      from: '__attribute__((weak)) bool get_hold_on_other_key_press(uint16_t keycode, keyrecord_t *record) {',
      to:
        '__attribute__((weak)) bool get_hold_on_other_key_press_next(uint16_t keycode, keyrecord_t *record, uint16_t other_keycode, keyrecord_t *other_record) {\n' +
        '    return get_hold_on_other_key_press(keycode, record);\n' +
        '}\n' +
        '__attribute__((weak)) bool get_hold_on_other_key_press(uint16_t keycode, keyrecord_t *record) {',
    },
    {
      // repoint the macro used inside process_tapping() at the new callback;
      // `keyp` is the interrupting key record in that scope
      from: 'get_hold_on_other_key_press(tapping_keycode, &tapping_key)',
      to: 'get_hold_on_other_key_press_next(tapping_keycode, &tapping_key, get_record_keycode(keyp, false), keyp)',
    },
  ]);
}

function patchFile(file, replacements) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const { from, to } of replacements) {
    if (content.includes(to)) continue; // already patched
    if (!content.includes(from)) {
      throw new Error(`patchQmkCore: anchor not found in ${file}\n  expected: ${from}`);
    }
    content = content.replace(from, to);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`patchQmkCore: patched ${file}`);
  } else {
    console.log(`patchQmkCore: already patched ${file}`);
  }
}

module.exports = patchQmkCore;
