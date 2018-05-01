import { MENU } from "../constants";
import { CreateActivityEvent, DynamicProperty } from "../models";

/**
 * Add the menu to the active spreadsheet.
 * @export
 */
export function addMenu(): void {
  SpreadsheetApp.getActiveSpreadsheet()!.addMenu("OpenBadges", MENU);
}

/**
 * Update the issued column for any rows which were sent to the API.
 *
 * @export
 * @param {Sheet} sheet
 * @returns {Builder<CreateActivityEvent[], Builder<DynamicProperty, void>>}
 */
export function updateIssuedColumnForSheet(
  sheet: Sheet
): Builder<CreateActivityEvent[], Builder<DynamicProperty, void>> {
  return (payloads: CreateActivityEvent[]) => (
    dynamicProperty: DynamicProperty
  ) => {
    // Get the range for the issued column.
    const range = sheet.getRange(
      2,
      dynamicProperty.columnIndex,
      sheet.getLastRow() - 1
    );
    const values = range.getValues();

    // Create the update from the existing values.
    const newValues = [...values];
    payloads.map(x => x.rowIndex).forEach(i => (newValues[i] = ["Y"]));

    // Execute the update.
    range.setValues(newValues);
  };
}
