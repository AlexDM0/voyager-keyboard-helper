module.exports = {

  top:`
#include "process_achordion.h"
#define MACRO_SPEED 30

`,

  bottom:`



bool achordion_chord(uint16_t tap_hold_keycode,
                     keyrecord_t* tap_hold_record,
                     uint16_t other_keycode,
                     keyrecord_t* other_record) {
  // thumb keys should be affected by this
  switch (other_keycode) {
      case TD(DANCE_0):
      case LT(3,KC_ENTER):
      case LT(2,KC_TAB):
        return true;
  }

  // control c to kill something
  if (tap_hold_keycode == MT(MOD_LCTL, KC_S) && other_keycode == KC_C) {
    return true;
  }
  // command r to reload
  if (tap_hold_keycode == MT(MOD_LGUI, KC_D) && other_keycode == KC_R) {
    return true;
  }
  // command t to open new tab
  if (tap_hold_keycode == MT(MOD_LGUI, KC_D) && other_keycode == KC_T) {
    return true;
  }

  // thumb keys should not affect this
  switch (tap_hold_keycode) {
    case LT(1,KC_EQUAL):
    case LT(3,KC_ENTER):
    case LT(2,KC_TAB):
      return true;
    default:
      return achordion_opposite_hands(tap_hold_record, other_record);
  }
}



bool get_permissive_hold(uint16_t keycode, keyrecord_t *record) {
    switch (keycode) {
        case MT(MOD_LSFT, KC_F):
        case MT(MOD_RSFT, KC_J):

        // for maya, sturdy and colemak
        case MT(MOD_LSFT, KC_T):
        case MT(MOD_LSFT, KC_S):
        case MT(MOD_LSFT, KC_D):

        case MT(MOD_RSFT, KC_N):
        case MT(MOD_RSFT, KC_H):
            return true;
        default:
            return false;
    }
}


bool get_hold_on_other_key_press(uint16_t keycode, keyrecord_t *record) {
    switch (keycode) {
        case LT(1,KC_EQUAL):  // layer tap equal for numeric layer
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
