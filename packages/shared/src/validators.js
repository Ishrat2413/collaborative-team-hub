/**
 * @fileoverview Shared validation patterns and helpers.
 * Used by both frontend form validation and backend request validation.
 */

// ─── Regex Patterns ──────────────────────────────────────────────────────────

/** @type {RegExp} Email validation pattern */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @type {RegExp} Password: min 8 chars, at least one letter and one number */
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

/** @type {RegExp} Hex color code (for workspace accent color) */
export const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/** @type {RegExp} @mention pattern in text */
export const MENTION_REGEX = /@(\w+)/g;

// ─── Field Constraints ───────────────────────────────────────────────────────

/** @type {Object} Validation constraints for common fields */
export const CONSTRAINTS = {
  name: { min: 1, max: 100 },
  email: { min: 3, max: 255 },
  password: { min: 8, max: 128 },
  description: { min: 0, max: 2000 },
  title: { min: 1, max: 200 },
  comment: { min: 1, max: 5000 },
  announcement: { min: 1, max: 10000 },
};

// ─── Validation Helpers ──────────────────────────────────────────────────────

/**
 * Validates an email address.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => EMAIL_REGEX.test(email);

/**
 * Validates a password meets minimum strength requirements.
 * @param {string} password
 * @returns {boolean}
 */
export const isValidPassword = (password) => PASSWORD_REGEX.test(password);

/**
 * Validates a hex color string.
 * @param {string} color
 * @returns {boolean}
 */
export const isValidHexColor = (color) => HEX_COLOR_REGEX.test(color);

/**
 * Extracts all @mentioned usernames from a text string.
 * @param {string} text
 * @returns {string[]} Array of mentioned usernames (without the @ symbol)
 */
export const extractMentions = (text) => {
  const matches = [];
  let match;
  const regex = new RegExp(MENTION_REGEX.source, 'g');
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  return [...new Set(matches)]; // deduplicate
};
