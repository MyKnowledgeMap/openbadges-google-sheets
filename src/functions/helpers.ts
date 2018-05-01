/**
 * Combine multiple predicates into one predicate.
 *
 * @param {Array<Predicate<T>>} predicates
 * @returns A predicate which accepts T object and evaluates to true or false
 * depending on the outcome of the provided predicates.
 */
export function and<T>(predicates: ReadonlyArray<Predicate<T>>): Predicate<T> {
  return (x: T) => predicates.every(predicate => predicate(x));
}

/**
 * Return the provided init value if the input is falsy.
 *
 * @export
 * @param {T} input
 * @param {T} init
 * @returns {T}
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

//TODO: JSDoc
export function setArray<T>(
  // tslint:disable-next-line:readonly-array
  arr: ReadonlyArray<T> | T[],
  i: number,
  value: T
): ReadonlyArray<T> {
  return Object.assign([...arr], { [i]: value });
}
