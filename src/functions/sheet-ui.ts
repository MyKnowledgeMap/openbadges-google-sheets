import { MENU } from "../constants";
import { setArray } from "./helpers";

/**
 * Add the menu to the active spreadsheet.
 * @export
 */
export function addMenu(): void {
  return SpreadsheetApp.getActiveSpreadsheet()!.addMenu("OpenBadges", [
    ...MENU
  ]);
}

/**
 * Update the issued column for any rows which were sent to the API.
 *
 * @export
 * @param {Sheet} sheet
 * @returns {Builder<CreateActivityEvent[], Builder<DynamicProperty, Range>>}
 */
export function updateIssuedColumnForSheet(
  sheet: Sheet
): Builder<
  ReadonlyArray<CreateActivityEvent>,
  Builder<DynamicProperty, Range>
> {
  return (payloads: ReadonlyArray<CreateActivityEvent>) => (
    dynamicProperty: DynamicProperty
  ) => {
    // Get the range for the issued column.
    const range = sheet.getRange(
      2,
      dynamicProperty.columnIndex,
      sheet.getLastRow() - 1
    );

    // Get the values for the range.
    const originalValues = Object.freeze(range.getValues());

    // Get the new values using the original values and setting the value for each payload rowIndex to "Y".
    const newValues = payloads
      .map(x => x.rowIndex)
      .reduce((v, i) => setArray(v, i, ["Y"]), originalValues);

    // Update the values in the range using the new values.
    return range.setValues(newValues as CellValue[][]); // tslint:disable-line:readonly-array
  };
}
