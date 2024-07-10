module.exports = {

  top:`
#include "process_achordion.h"
#define MACRO_SPEED 50

`,

  processRecordUser: `
  if (!process_achordion(keycode, record)) {
    return false;
  }
`,

  bottom:`



void matrix_scan_user(void) {
  achordion_task();
}


bool achordion_chord(uint16_t tap_hold_keycode,
                     keyrecord_t* tap_hold_record,
                     uint16_t other_keycode,
                     keyrecord_t* other_record) {
  // thumb keys should be affected by this
  switch (other_keycode) {
      case TD(DANCE_0):
        return true;
  }

  // thumb keys should not affect this
  switch (tap_hold_keycode) {
    case LT(3,KC_ENTER):
    case LT(2,KC_TAB):
    case MT(MOD_LCTL, KC_S):
      return true;
    default:
      return achordion_opposite_hands(tap_hold_record, other_record);
  }
}


bool get_permissive_hold(uint16_t keycode, keyrecord_t *record) {
    switch (keycode) {
        case MT(MOD_LSFT, KC_F):
        case MT(MOD_RSFT, KC_J):
            return true;
        default:
            return false;
    }
}


bool get_hold_on_other_key_press(uint16_t keycode, keyrecord_t *record) {
    switch (keycode) {
        case LT(3,KC_ENTER): // left thumb
        case LT(2,KC_TAB):   // right thumb
            return true;  // Eagerly apply Shift and Ctrl mods.
        default:
            return false;
    }
}



uint16_t achordion_timeout(uint16_t tap_hold_keycode) {
  return 500;
}


bool achordion_eager_mod(uint8_t mod) {
  switch (mod) {
    case MOD_LSFT:
    case MOD_RSFT:
    case MOD_LCTL:
    case MOD_RCTL:
    case MOD_LGUI:
    case MOD_RGUI:
    case MOD_LALT:
    case MOD_RALT:
      return true;  // Eagerly apply Shift and Ctrl mods.

    default:
      return false;
  }
}
`

}