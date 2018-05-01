import { and, convertStringToNumber } from "./helpers";
import { getModelsUsingRows } from "./model-builder";

/**
 * Build the payloads using dynamic and static data from the sheet and props.
 *
 * @export
 * @param {DocumentProperties} props
 * @returns {Builder<Sheet, CreateActivityEvent[]>}
 */
export function getPayloads(
  props: DocumentProperties
): Builder<Sheet, ReadonlyArray<CreateActivityEvent>> {
  return (sheet: Sheet) =>
    getDynamicPayloads(props)(sheet).map(withStaticData(props));
}

/**
 * Populate the payloads with dynamic data from the sheet.
 *
 * @export
 * @param {DocumentProperties} props
 * @returns {Builder<Sheet, CreateActivityEvent[]>}
 */
export function getDynamicPayloads(
  props: DocumentProperties
): Builder<Sheet, ReadonlyArray<CreateActivityEvent>> {
  return (sheet: Sheet) => {
    const numberOfRows = sheet.getLastRow();
    const numberOfColumns = sheet.getLastColumn();
    const rows: GetValuesResult = sheet
      .getRange(2, 1, numberOfRows - 1, numberOfColumns)
      .getValues() as any;
    const dynamic = getDynamicProperties(props);
    return rows.reduce(getModelsUsingRows(dynamic), []);
  };
}

/**
 * Populate the model with static data from the properties.
 *
 * @export
 * @param {DocumentProperties} props
 * @returns {Builder<CreateActivityEvent, CreateActivityEvent>}
 */
export function withStaticData(
  props: DocumentProperties
): Builder<CreateActivityEvent, CreateActivityEvent> {
  return (model: CreateActivityEvent) => {
    const predicates: ReadonlyArray<Predicate<ReadonlyArray<string>>> = [
      ([key]) => !/(api)(\S+)/.test(key),
      ([key]) => model[key] === undefined
    ];
    return Object.entries(props)
      .filter(and(predicates))
      .reduce(
        (prev, [key, value]) => Object.assign({ ...prev }, { [key]: value }),
        model
      );
  };
}

/**
 * Gets the dynamic properties.
 *
 * @export
 * @param {DocumentProperties} props
 * @returns {DynamicProperty[]}
 */
export function getDynamicProperties(
  props: DocumentProperties
): ReadonlyArray<DynamicProperty> {
  return Object.entries(props)
    .filter(([_, value]) => /{{.+}}/.test(value))
    .map(asDynamicProperty);
}

/**
 * Create a representation of a property key and value with the associated column index.
 *
 * @export
 * @param {string[]} [ key, original ]
 * @returns {DynamicProperty}
 */
export function asDynamicProperty([key, original]: [
  string,
  string
]): DynamicProperty {
  const value: string = original.replace(/[{}]/g, "").toUpperCase();
  return createDynamicProperty({
    key,
    value,
    columnIndex: convertStringToNumber(value.toLowerCase())
  });
}

export function createDynamicProperty(
  init?: Partial<DynamicProperty>
): DynamicProperty {
  return {
    columnIndex: undefined,
    key: undefined,
    value: undefined,
    ...init
  };
}
