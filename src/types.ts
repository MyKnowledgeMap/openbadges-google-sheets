/**
 * Functional construct providing a convenient way of testing if something is true for a given T object.
 */
type Predicate<T> = (value: T) => boolean;

// TODO: description
type HttpResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;

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
 * Shorthand for GoogleAppsScript.HTML.HtmlTemplate.
 */
type HtmlTemplate = GoogleAppsScript.HTML.HtmlTemplate;

/**
 * An object with an index signature.
 *
 * @interface IndexedObject
 * @template T
 */
interface IndexedObject<T> {
  readonly [key: string]: T;
}

/**
 * The DTO which the API will accept for creating an activity event.
 *
 * @interface CreateActivityEvent
 * @extends {(IndexedObject<string | number>)}
 */
interface CreateActivityEvent extends IndexedObject<string | number> {
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
}

/**
 * The user's document properties.
 *
 * @interface DocumentProperties
 * @extends {IndexedObject<string>}
 */
interface DocumentProperties extends IndexedObject<string> {
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

/**
 * A dynamic property with key, value and the associated column index.
 *
 * @interface DynamicProperty
 */
interface DynamicProperty {
  readonly columnIndex: number;
  readonly key: string;
  readonly value: string;
}

/**
 * The template for the settings sidebar.
 *
 * @interface SettingsHtmlTemplate
 * @extends {HtmlTemplate}
 */
interface SettingsHtmlTemplate extends HtmlTemplate {
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

/**
 * A menu item with name and associated function.
 *
 * @interface MenuItem
 */
interface MenuItem {
  readonly name: string;
  readonly functionName: string;
}

/**
 * The api error response object.
 *
 * @interface ApiErrorResponse
 */
interface ApiErrorResponse {
  readonly message: string;
  readonly errors?: ReadonlyArray<ErrorDetail>;
}

/**
 * The error detail object.
 *
 * @interface ErrorDetail
 */
interface ErrorDetail {
  readonly property: string;
  readonly message: string;
}
