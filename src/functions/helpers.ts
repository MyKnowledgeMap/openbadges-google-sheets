/**
 * Combine multiple predicates.
 * @template T
 * @param {Array<Predicate<T>>} predicates
 * @returns
 */
export function and<T>(predicates: Array<Predicate<T>>) {
  return (obj: T) => predicates.every(predicate => predicate(obj));
}

/**
 * Return the value if truthy or return the provided init value.
 * @template T
 * @param {T} input
 * @param {T} init
 */
export function valueOrDefault<T>(input: T, init: T) {
  return !input ? init : input;
}

/**
 * Convert a string to numbers using the character code for each letter.
 * https://stackoverflow.com/a/29040784/6387935 🙌
 * @param {string} input
 */
export function convertStringToNumber(input: string) {
  if (!/^[a-zA-Z]+$/.test(input)) {
    throw new Error(
      "Input must be a non-empty string of only uppercase or lowercase letters."
    );
  }

  return input
    .toLowerCase()
    .split("")
    .reduce((count, _, i, letters) => {
      const value =
        (letters[letters.length - 1 - i].charCodeAt(0) - 96) * Math.pow(26, i);
      return count + value;
    }, 0);
}
