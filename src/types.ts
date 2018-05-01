/**
 * Functional construct providing a convenient way of testing if something is true for a given T object.
 */
type Predicate<T> = (value: T) => boolean;

/**
 * Shorthand for GoogleAppsScript.Spreadsheet.Sheet.
 */
type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

/**
 * Shorthand for a function that accepts T1 and returns T2.
 */
type Builder<T1, T2> = (using: T1) => T2;

/**
 * The possible cell values.
 */
type CellValue = string | number | boolean | Date;

/**
 * range.getValues() result.
 */
type GetValuesResult = CellValue[][];
