/**
 * Functional construct providing a convenient way of testing if something is true for a given T object.
 */
type Predicate<T> = (value: T) => boolean;

/**
 * Shorthand for GoogleAppsScript.Spreadsheet.Sheet.
 */
type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

/**
 * Shorthand for GoogleAppsScript.Spreadsheet.Range.
 */
type Range = GoogleAppsScript.Spreadsheet.Range;

/**
 * Shorthand for GoogleAppsScript.Spreadsheet.Range.
 */
type Properties = GoogleAppsScript.Properties.Properties;

/**
 * Shorthand for a function that accepts T1 and returns T2.
 */
type Builder<T1, T2> = (using: T1) => T2;

/**
 * Functional construct providing a convenient way of typing a reducer
 */
type Reducer<T1, T2> = (previous: T1, current: T2) => T1;

/**
 * Functional construct providing a convenient way of typing a reducer which uses the index argument.
 */
type IndexedReducer<T1, T2> = (previous: T1, current: T2, index: number) => T1;

/**
 * The possible cell values.
 */
type CellValue = string | number | boolean | Date;

/**
 * range.getValues() result.
 */
type GetValuesResult = ReadonlyArray<ReadonlyArray<CellValue>>;

/**
 * The DTO which the API will accept for creating an activity event.
 */
type CreateActivityEvent = {
  readonly [key: string]: any;
  readonly activityId: string;
  readonly activityTime: string;
  readonly text1: string;
  readonly text2: string;
  readonly email: string;
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly int1: string;
  readonly int2: string;
  readonly date1: string;
  readonly verified: string;
  readonly issued: string;
  readonly rowIndex: number;
};

/**
 * The user's document properties.
 */
type DocumentProperties = {
  readonly [key: string]: string;
  readonly apiKey: string;
  readonly apiUrl: string;
  readonly apiToken: string;
  readonly activityId: string;
  readonly text1: string;
  readonly text2: string;
  readonly int1: string;
  readonly int2: string;
  readonly date1: string;
  readonly activityTime: string;
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly verified: string;
  readonly issued: string;
};

/**
 * A dynamic property with key, value and the associated column index.
 */
type DynamicProperty = {
  readonly columnIndex: number;
  readonly key: string;
  readonly value: string;
};

/**
 * The HTML template object for the settings sidebar.
 * @export
 * @interface SettingsHtmlTemplate
 * @extends {GoogleAppsScript.HTML.HtmlTemplate}
 */
interface SettingsHtmlTemplate extends GoogleAppsScript.HTML.HtmlTemplate {
  readonly apiKey: string;
  readonly apiUrl: string;
  readonly apiToken: string;
  readonly activityId: string;
  readonly text1: string;
  readonly text2: string;
  readonly int1: string;
  readonly int2: string;
  readonly date1: string;
  readonly activityTime: string;
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly verified: string;
  readonly issued: string;
}
