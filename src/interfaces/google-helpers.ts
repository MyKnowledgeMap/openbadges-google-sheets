/**
 * Interface for FormSubmitEvent since it doesn't appear to be included in @types/google-app-script.
 * https://developers.google.com/apps-script/guides/triggers/events
 * @interface FormSubmitEvent
 */
interface IFormSubmitEvent {
  source: GoogleAppsScript.Forms.Form;
  response: GoogleAppsScript.Forms.FormResponse;
  authMode: GoogleAppsScript.Script.AuthMode;
  triggerUid: number;
}

/**
 * Simple helper interface which saves typing Array<Array<number | boolean | string | Date>> for range.GetValues().
 * @interface IGetValuesResult
 * @extends {(Array<Array<number | boolean | string | Date>>)}
 */
interface IGetValuesResult
  extends Array<Array<number | boolean | string | Date>> {}

/**
 * Simple form item response model.
 * @interface ISimpleItemResponse
 */
interface ISimpleItemResponse {
  title: string;
  response: any; // string | string[] | string[][]
}
