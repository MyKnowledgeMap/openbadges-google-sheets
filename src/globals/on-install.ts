import { addMenu } from "../functions";

/**
 * Runs when the add-on is installed to a spreadsheet.
 *
 * @export
 * @returns {void}
 */
export function onInstall(): void {
  return addMenu();
}
