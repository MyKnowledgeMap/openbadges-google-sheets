import { setArray } from "./helpers";

/**
 * Build all the models for a sheet using the dyanmic columns.
 *
 * @export
 * @param {DynamicProperty[]} props
 * @returns {IndexedReducer<CreateActivityEvent[], CellValue[]>}
 */
export function getModelsUsingDynamicProperties(
  props: ReadonlyArray<DynamicProperty>
): IndexedReducer<
  ReadonlyArray<CreateActivityEvent>,
  ReadonlyArray<CellValue>
> {
  return (models, cells, rowIndex) =>
    setArray(
      models,
      rowIndex,
      cells.reduce(
        (model, cellValue, i) =>
          props
            // Filter dynamic properties the current index
            .filter(prop => prop.columnIndex - 1 === i)
            // Immutably build the CreateActivityEvent model.
            .reduce((prev, prop) => {
              // Return a new model based on the previous model with an updated property for the cell value.
              return {
                ...prev,
                [prop.key]:
                  // Get the cell value as a string or UTC string.
                  cellValue instanceof Date
                    ? cellValue.toUTCString()
                    : cellValue.toString()
              };
              // Initialise the nested reducer with a new model based on the previous value.
            }, createActivityEvent(model)),
        // Initialise the reducer with new model with rowIndex set.
        createActivityEvent({ rowIndex })
      )
    );
}

/**
 * Create a new activity event model.
 *
 * @export
 * @param {Partial<CreateActivityEvent>} [init]
 * @returns {CreateActivityEvent}
 */
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
