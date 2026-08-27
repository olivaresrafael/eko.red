const replace = String.prototype.replace

// escape
const ca = /[&<>'"]/g

const esca = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
}
const pe = (m) => esca[m]

/**
 * Safely escape HTML entities such as `&`, `<`, `>`, `"`, and `'`.
 * @param {string|number|boolean} input the input to safely escape
 * @returns {string} the escaped input
 */
export const escape = (input) => {
  if (input === null || input === undefined) return ''
  return replace.call(String(input), ca, pe)
}
