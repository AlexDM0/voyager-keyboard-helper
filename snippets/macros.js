const macros = {
  const: {
    replace: 'SS_LALT(SS_LCTL(SS_LGUI(SS_LSFT(SS_TAP(X_C)))))',
    with: [
      'SS_TAP(X_C)',
      'SS_TAP(X_O)',
      'SS_TAP(X_N)',
      'SS_TAP(X_S)',
      'SS_TAP(X_T)',
      'SS_TAP(X_SPACE)',
    ]
  },
  function: {
    replace: 'SS_LALT(SS_LCTL(SS_LGUI(SS_LSFT(SS_TAP(X_F)))))',
    with: [
      'SS_TAP(X_F)',
      'SS_TAP(X_U)',
      'SS_TAP(X_N)',
      'SS_TAP(X_C)',
      'SS_TAP(X_T)',
      'SS_TAP(X_I)',
      'SS_TAP(X_O)',
      'SS_TAP(X_N)',
      'SS_TAP(X_SPACE)',
    ]
  },
  export: {
    replace: 'SS_LALT(SS_LCTL(SS_LGUI(SS_LSFT(SS_TAP(X_E)))))',
    with: [
      'SS_TAP(X_E)',
      'SS_TAP(X_X)',
      'SS_TAP(X_P)',
      'SS_TAP(X_O)',
      'SS_TAP(X_R)',
      'SS_TAP(X_T)',
      'SS_TAP(X_SPACE)',
    ]
  },
  yarnStart: {
    replace: 'SS_LALT(SS_LCTL(SS_LGUI(SS_LSFT(SS_TAP(X_Y)))))',
    with: [
      'SS_TAP(X_Y)',
      'SS_TAP(X_A)',
      'SS_TAP(X_R)',
      'SS_TAP(X_N)',
      'SS_TAP(X_SPACE)',
      'SS_TAP(X_S)',
      'SS_TAP(X_T)',
      'SS_TAP(X_A)',
      'SS_TAP(X_R)',
      'SS_TAP(X_T)',
    ]
  }
}


module.exports = macros;
