import { addMenu } from "../functions";

/**
 * Runs when the spreadsheet is opened.
 *
 * @export
 * @returns {void}
 */
export function onOpen(): void {
  return addMenu();
}
