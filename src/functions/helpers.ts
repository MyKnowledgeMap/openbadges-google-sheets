/**
 * Combine multiple predicates into one predicate.
 *
 * @param {ReadonlyArray<Predicate<T>>} predicates An array of predicates to be evaluated.
 * @returns A predicate which accepts T object and evaluates to true or false
 * depending on the outcome of the provided predicates.
 */
export function and<T>(predicates: ReadonlyArray<Predicate<T>>): Predicate<T> {
  return (x: T) => predicates.every(predicate => predicate(x));
}

// Not actually used...
// export function or<T>(predicates: ReadonlyArray<Predicate<T>>): Predicate<T> {
//   return (x: T) => predicates.some(predicate => predicate(x));
// }

/**
 * Get a default value if the input is falsy.
 *
 * @export
 * @param {T} input The input value
 * @param {T} init The default initialise value.
 * @returns {T} The provided default value if the input is falsy, otherwise returns the input value.
 */
export function valueOrDefault<T>(input: T, init: T): T {
  return !input ? init : input;
}

/**
 * Convert a string to numbers using the character code for each letter.
 *
 * @export
 * @param {string} input
 * @returns {number}
 */
export function convertStringToNumber(input: string): number {
  return input
    .toLowerCase()
    .split("")
    .reduce((count, _, i, letters) => {
      const value =
        (letters[letters.length - 1 - i].charCodeAt(0) - 96) * Math.pow(26, i);
      return count + value;
    }, 0);
}

/**
 * Immutably update an array value at index by creating a new array.
 *
 * @export
 * @template T
 * @param {(ReadonlyArray<T> | T[])} array The array to use for immutably updating.
 * @param {number} index The index of the array to update.
 * @param {T} value The value to update with.
 * @returns {ReadonlyArray<T>}
 */
export function setArray<T>(
  array: ReadonlyArray<T> | T[], // tslint:disable-line:readonly-array
  index: number,
  value: T
): ReadonlyArray<T> {
  return [...array.slice(0, index), value, ...array.slice(index + 1)];
}
