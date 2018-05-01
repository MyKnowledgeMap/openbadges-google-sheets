import { MENU } from "../constants";
import { setArray } from ".";

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
    const rangeValues = Object.freeze(range.getValues());

    const result = payloads
      .map(x => x.rowIndex)
      .reduce((values, index) => setArray(values, index, ["Y"]), rangeValues);

    // Would be nice if didn't have to typecast here but setValues doesn't like ReadonlyArray :(
    return range.setValues(result as any);
  };
}
