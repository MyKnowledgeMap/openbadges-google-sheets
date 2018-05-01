import { CreateActivityEvent, DynamicProperty } from "../models";

/**
 * Build all the models for a sheet using the dyanmic columns.
 *
 * @export
 * @param {DynamicProperty[]} columns
 * @returns
 */
export function getModelsUsingRows(columns: DynamicProperty[]) {
  return (
    previous: CreateActivityEvent[],
    cells: Array<string | number | boolean | Date>,
    rowIndex: number
  ) => {
    // Copy the payload array.
    const current = [...previous];

    // Get the model for this row using the cells.
    const model = cells.reduce(
      getModelUsingCells(columns),
      new CreateActivityEvent()
    );

    // Set the row index.
    model.rowIndex = rowIndex;

    // Set the model to the index in array.
    current[rowIndex] = model;
    return current;
  };
}

/**
 * Build a model for a row using the dynamic columns.
 *
 * @export
 * @param {DynamicProperty[]} columns
 * @returns {(
 *   previous: CreateActivityEvent,
 *   cell: CellValue,
 *   index: number
 * ) => CreateActivityEvent}
 */
export function getModelUsingCells(
  columns: DynamicProperty[]
): (
  previous: CreateActivityEvent,
  cell: CellValue,
  index: number
) => CreateActivityEvent {
  return (previous: CreateActivityEvent, cell: CellValue, index: number) => {
    const current = new CreateActivityEvent({ ...previous });
    const column = columns.filter(x => x.columnIndex - 1 === index);
    const value = cell instanceof Date ? cell.toUTCString() : cell.toString();
    column.forEach(c => (current[c.key] = value));
    return current;
  };
}
