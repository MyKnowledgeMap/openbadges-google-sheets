/**
 * Interface for FormSubmitEvent since it doesn't appear to be included in @types/google-app-script.
 * https://developers.google.com/apps-script/guides/triggers/events
 * @interface FormSubmitEvent
 */
interface FormSubmitEvent {
  source: GoogleAppsScript.Forms.Form;
  response: GoogleAppsScript.Forms.FormResponse;
  authMode: GoogleAppsScript.Script.AuthMode;
  triggerUid: number;
}
