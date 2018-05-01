import {
  CreateActivityEvent,
  DocumentProperties,
  DynamicProperty
} from "../models";
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
): Builder<Sheet, CreateActivityEvent[]> {
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
): Builder<Sheet, CreateActivityEvent[]> {
  return (sheet: Sheet) => {
    const numberOfRows = sheet.getLastRow();
    const numberOfColumns = sheet.getLastColumn();
    const rows = sheet
      .getRange(2, 1, numberOfRows - 1, numberOfColumns)
      .getValues() as GetValuesResult;
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
    const updated: { [key: string]: string } = {};
    const predicates: Array<Predicate<string[]>> = [
      ([k]) => !/(api)(\S+)/.test(k),
      ([k]) => model[k] === undefined
    ];
    Object.entries(props)
      .filter(and(predicates))
      .forEach(([k, v]) => (updated[k] = v));
    return new CreateActivityEvent({ ...model, ...updated });
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
): DynamicProperty[] {
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
  return new DynamicProperty({
    key,
    value,
    columnIndex: convertStringToNumber(value.toLowerCase())
  });
}
