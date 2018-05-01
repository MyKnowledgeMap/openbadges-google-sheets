import { ApiErrorResponse, ErrorDetail } from "../models";
import { valueOrDefault } from "./helpers";

/**
 * Create a nicely formatted error message from the ApiErrorResponse
 * @export
 * @param {ApiErrorResponse} response
 * @returns A formatted string for the error.
 */
export function getPrettyError(response: ApiErrorResponse): string {
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
 * @returns A new string with the property and associated message appended.
 */
export function appendError(message: string, error: ErrorDetail): string {
  return message + `Property: ${error.property}\nReason: ${error.message}\n\n`;
}
