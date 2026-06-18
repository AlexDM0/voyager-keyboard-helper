module.exports = {

  top:`
#define MACRO_SPEED 30

#define LAYER_ALT 2
#define LAYER_NUMBERS 3
#define LAYER_NAV 4
#define LAYER_CODING 5
#define LAYER_CONTROL 6
#define LAYER_DELETE 14


`,

  bottom:`



// Chordal Hold: when another key is pressed before the tapping term, decide
// whether the tap-hold key may still settle as held. Returning true only
// *permits* a hold (the tapping term / permissive-hold / hold-on-other-key-press
// still make the final tap-vs-hold call); returning false forces an immediate
// tap. Thumbs are '*' in chordal_hold_layout, so get_chordal_hold_default already
// permits a hold whenever a thumb is the held key OR the next key -- only the
// non-'*' keys need to be listed explicitly here.
bool get_chordal_hold(uint16_t tap_hold_keycode,
                      keyrecord_t* tap_hold_record,
                      uint16_t other_keycode,
                      keyrecord_t* other_record) {
  // DANCE_0 is right-home (not a thumb) -> permit it to chord with a R mod-tap.
  if (other_keycode == TD(DANCE_0)) return true;

  // Same-hand shortcut chords that should still be allowed to hold.
  if (tap_hold_keycode == MT(MOD_LGUI, KC_D) && other_keycode == KC_R) return true; // cmd+r reload
  if (tap_hold_keycode == MT(MOD_LGUI, KC_D) && other_keycode == KC_T) return true; // cmd+t new tab
  if (tap_hold_keycode == MT(MOD_LGUI, KC_D) && other_keycode == MT(MOD_LSFT, KC_F)) return true; // cmd+f find

  // '=' is left-home (not a thumb), so exempt it explicitly. V is intentionally
  // NOT exempt: digits live on the right hand, so the default opposite-hands rule
  // gives an instant layer for digits while still typing a same-hand 'v'.
  if (tap_hold_keycode == LT(LAYER_ALT, KC_EQUAL)) return true;

  // Home-row GUI/Ctrl/Alt fall through here: same-hand neighbours settle as a
  // tap; opposite-hand and any '*' thumb neighbour is permitted to hold.
  return get_chordal_hold_default(tap_hold_record, other_record);
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

// Layer-tap keys that switch layers immediately on the next keypress.
bool get_hold_on_other_key_press(uint16_t keycode, keyrecord_t *record) {
    switch (keycode) {
        case MT(MOD_LSFT, KC_F):
        
        case LT(LAYER_ALT,KC_EQUAL):    // layer tap equal for numeric layer
        case LT(LAYER_NUMBERS,KC_V):    // V -> number layer on next keypress
        case LT(LAYER_CODING,KC_ENTER): // left thumb
        case LT(LAYER_DELETE,KC_BSPC):  // left thumb
        case LT(LAYER_NAV,KC_TAB):      // right thumb
            return true;
        default:
            return false;
    }
}


uint16_t get_quick_tap_term(uint16_t keycode, keyrecord_t *record) {
    switch (keycode) {
        case LT(LAYER_DELETE,KC_BSPC):
            return 0;
        default:
            return QUICK_TAP_TERM;
    }
}

`

}
