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

// Whitelist of "next" keys for which a Shift home-row mod should eagerly hold
// (hold-on-other-key-press). '1' = eager Shift; '.' = let Shift tap. Populated
// per the rule "hold for anything that is NOT a letter and NOT a thumb": the
// alpha block and the four thumb keys are '.', everything else is '1'.
// Same LAYOUT shape as chordal_hold_layout -- hand-tune any cell freely.
const char shift_hold_on_other_layout[MATRIX_ROWS][MATRIX_COLS] PROGMEM = LAYOUT(
  '1','1','1','1','1','1',   '1','1','1','1','1','1',
  '1','.','.','.','.','.',   '.','.','.','.','.','1',
  '1','.','.','.','.','.',   '.','.','.','.','1','1',
  '1','.','.','.','.','.',   '.','.','1','1','1','1',
              '.','.',   '.','.'
);

static bool shift_eager_on_other(keypos_t key) {
    if (key.row >= MATRIX_ROWS || key.col >= MATRIX_COLS) return false;
    return pgm_read_byte(&shift_hold_on_other_layout[key.row][key.col]) == '1';
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

// Next-key-aware variant (needs the patchQmkCore mod). Shift home-row mods hold
// eagerly only for whitelisted next keys (non-letter, non-thumb); everything
// else delegates to the plain callback above. Chordal Hold still force-taps
// same-hand neighbours, so this fires for opposite-hand symbols/numbers.
bool get_hold_on_other_key_press_next(uint16_t keycode, keyrecord_t *record,
                                      uint16_t other_keycode, keyrecord_t *other_record) {
    switch (keycode) {
        case MT(MOD_LSFT, KC_F):
        case MT(MOD_RSFT, KC_J):
        case MT(MOD_LSFT, KC_T):
        case MT(MOD_LSFT, KC_S):
        case MT(MOD_LSFT, KC_D):
        case MT(MOD_RSFT, KC_N):
        case MT(MOD_RSFT, KC_H):
            return shift_eager_on_other(other_record->event.key);
        default:
            return get_hold_on_other_key_press(keycode, record);
    }
}


// Hand-gated Flow Tap. We remember the previous key's hand ourselves (via our
// chordal_hold_layout map) so we never have to patch QMK to expose it.
static char flow_prev_hand = '*';

void post_process_record_user(uint16_t keycode, keyrecord_t *record) {
    if (record->event.pressed
        && record->event.key.row < MATRIX_ROWS
        && record->event.key.col < MATRIX_COLS) {
        flow_prev_hand = chordal_hold_handedness(record->event.key);
    }
}

// While in flow (this key pressed soon after the previous one), force *same-hand*
// mod-taps to tap, so same-hand rolls like "kijk" can't sneak in a mod. Opposite-
// hand mods return 0 (Flow Tap off) so cross-hand mod chords still hold, and a
// deliberate (paused) same-hand chord still holds because flow has expired.
// Layer-taps (thumbs / V / =) aren't mod-taps, so they're never flow-tapped.
uint16_t get_flow_tap_term(uint16_t keycode, keyrecord_t *record, uint16_t prev_keycode) {
    if (IS_QK_MOD_TAP(keycode)
        && chordal_hold_handedness(record->event.key) == flow_prev_hand) {
        return FLOW_TAP_TERM;
    }
    return 0;
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
