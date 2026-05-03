/**
 * @fileoverview CSV generation utility for workspace data export.
 */

/**
 * Converts an array of objects to a CSV string.
 * Handles nested values by stringifying them.
 *
 * @param {Object[]} data - Array of flat objects to convert
 * @param {string[]} [columns] - Optional column order. Defaults to all keys.
 * @returns {string} CSV-formatted string
 */
export const toCSV = (data, columns) => {
  if (!data || data.length === 0) return '';

  const headers = columns || Object.keys(data[0]);
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    // Wrap in quotes if contains comma, newline, or quote
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map((row) => headers.map((h) => escape(row[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
};

/**
 * Sets response headers for a CSV file download.
 * @param {import('express').Response} res
 * @param {string} filename - Desired filename (without .csv extension)
 */
export const setCsvHeaders = (res, filename) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
};
