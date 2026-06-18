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

// Layer-taps that switch layers immediately on any next keypress. Used both by
// QMK's process_action() path and as the delegate base for the next-key-aware
// callback below.
bool get_hold_on_other_key_press(uint16_t keycode, keyrecord_t *record) {
    switch (keycode) {
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

// Per-position whitelist for the Shift home-row mods. When a Shift mod-tap is
// pending and the *next* key is pressed, we read that next key's matrix cell here
// and eager-hold Shift only on a matching mark; everything else falls through to
// Chordal Hold / the tapping term (so rolling onto a letter taps -- fixes kijk and
// mid-word capitals). '1' = hold when LEFT shift (F) is held, '2' = hold when
// RIGHT shift (J) is held, '.' = never. The marked cells are the non-letter keys
// on the opposite hand (number row + edge symbols), so F+/ -> ? still fires while
// letters stay '.'. Same LAYOUT shape as chordal_hold_layout -- tune any cell.
const char shift_hold_on_other_layout[MATRIX_ROWS][MATRIX_COLS] PROGMEM = LAYOUT(
  '2','2','2','2','2','2',   '1','1','1','1','1','1',
  '2','.','.','.','.','.',   '.','.','.','.','.','1',
  '2','.','.','.','.','.',   '.','.','.','.','1','1',
  '2','.','.','.','.','.',   '.','.','1','1','1','1',
              '.','.',   '.','.'
);

// Next-key-aware hold-on-other-key-press (needs the patchQmkCore mod).
//  - Shift mod-taps (F/J): consult shift_hold_on_other_layout above -- hold only
//    on an explicitly marked next key, otherwise let Chordal Hold / the tapping
//    term decide (so same-hand and letter rolls tap, e.g. kijk).
//  - Other home-row mods (GUI/Ctrl/Alt): eager-hold on any opposite-hand key.
//  - Layer-taps (thumbs / V / =): fire on any next key.
bool get_hold_on_other_key_press_next(uint16_t keycode, keyrecord_t *record,
                                      uint16_t other_keycode, keyrecord_t *other_record) {
    char want = 0;
    switch (keycode) {
        case MT(MOD_LSFT, KC_F): want = '1'; break;  // left shift
        case MT(MOD_RSFT, KC_J): want = '2'; break;  // right shift
    }
    if (want != 0) {
        uint8_t row = other_record->event.key.row;
        uint8_t col = other_record->event.key.col;
        return (char)pgm_read_byte(&shift_hold_on_other_layout[row][col]) == want;
    }

    return get_hold_on_other_key_press(keycode, record);
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
