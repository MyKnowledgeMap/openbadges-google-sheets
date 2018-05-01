import { setArray } from "./helpers";

/**
 * Build all the models for a sheet using the dyanmic columns.
 *
 * @export
 * @param {DynamicProperty[]} props
 * @returns {IndexedReducer<CreateActivityEvent[], CellValue[]>}
 */
export function getModelsUsingRows(
  props: ReadonlyArray<DynamicProperty>
): IndexedReducer<
  ReadonlyArray<CreateActivityEvent>,
  ReadonlyArray<CellValue>
> {
  return (prev, cells, rowIndex) =>
    setArray(
      prev,
      rowIndex,
      cells.reduce(getModelUsingCells(props), createActivityEvent({ rowIndex }))
    );
}

/**
 * Build a model for a row using the dynamic properties.
 *
 * @export
 * @param {DynamicProperty[]} dynamicProperties
 * @returns {IndexedReducer<CreateActivityEvent, CellValue>}
 */
export function getModelUsingCells(
  dynamicProperties: ReadonlyArray<DynamicProperty>
): IndexedReducer<CreateActivityEvent, CellValue> {
  return (prev, cell, i) => {
    const value = cell instanceof Date ? cell.toUTCString() : cell.toString();

    return dynamicProperties
      .filter(prop => prop.columnIndex - 1 === i)
      .reduce(
        (prev, prop) => Object.assign({ ...prev }, { [prop.key]: value }),
        createActivityEvent(prev)
      );
  };
}

export function createActivityEvent(
  init?: Partial<CreateActivityEvent>
): CreateActivityEvent {
  return {
    activityId: undefined,
    activityTime: undefined,
    text1: undefined,
    text2: undefined,
    email: undefined,
    userId: undefined,
    firstName: undefined,
    lastName: undefined,
    int1: undefined,
    int2: undefined,
    date1: undefined,
    verified: undefined,
    issued: undefined,
    rowIndex: 0,
    ...init
  };
}
