import { getPayloads, responseHandler } from "../functions";

/**
 * Run the sheet processing.
 *
 * @export
 * @returns {*}
 */
export function onRun(): any {
  // Get the current sheet and get total the number of rows.
  const sheet = SpreadsheetApp.getActiveSheet();

  // Get the document properties.
  const props = PropertiesService.getDocumentProperties().getProperties() as DocumentProperties;

  // Get the payloads.
  const payloads = getPayloads(props)(sheet);

  // Create the request object.
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${props.apiToken}`,
      ApiKey: props.apiKey
    },
    payload: JSON.stringify(payloads),
    muteHttpExceptions: true
  };

  // Make the request and handle the response.
  const response = UrlFetchApp.fetch(props.apiUrl, options);

  // Get the error and success response handlers.
  const { error, success } = responseHandler(props)(sheet)(payloads);

  return response.getResponseCode() === 200 ? success() : error(response);
}
