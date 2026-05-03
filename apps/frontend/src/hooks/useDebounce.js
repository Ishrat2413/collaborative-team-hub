/**
 * @fileoverview useDebounce hook — delays a value update by a given number of ms.
 * @param {*} value
 * @param {number} delay
 * @returns {*} Debounced value
 */

'use client';
import { useState, useEffect } from 'react';

const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
