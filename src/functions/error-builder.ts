import { ApiErrorResponse, ErrorDetail } from "../models";
import { valueOrDefault } from "./helpers";

/**
 * Create a nicely formatted error message from the ApiErrorResponse
 * @export
 * @param {ApiErrorResponse} response
 * @returns
 */
export function getPrettyError(response: ApiErrorResponse) {
  const { message, errors } = { ...response };
  return valueOrDefault(errors!, []).reduce(
    appendError,
    `An error occurred: ${message}\n\n`
  );
}

/**
 * Add to the message using the error detail.
 * @param {string} message
 * @param {IApiResponseError} error
 * @returns
 */
export function appendError(message: string, error: ErrorDetail) {
  message += `Property: ${error.property}\n`;
  message += `Reason: ${error.message}\n\n`;
  return message;
}
