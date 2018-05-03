import { and, convertStringToNumber } from "./helpers";
import { getModelsUsingDynamicProperties } from "./model-builder";

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
  const usingTracking = getDynamicProperties(props).some(
    x => x.key === "issued"
  );

  return (sheet: Sheet) => {
    const allPayloads = getDynamicPayloads(props)(sheet).map(
      withStaticData(props)
    );

    return usingTracking
      ? allPayloads.filter(
          and<CreateActivityEvent>([
            // Verified is defined.
            x => !!x.verified,
            // Verified is "Y".
            x => x.verified.toUpperCase() === "Y",
            // (Issued is undefined OR Issued is not "Y")
            x => !x.issued || x.issued.toUpperCase() !== "Y"
          ])
        )
      : allPayloads;
  };
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
    return rows.reduce(getModelsUsingDynamicProperties(dynamic), []);
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
  return (model: CreateActivityEvent) =>
    Object.entries(props)
      .filter(
        and([
          ([key]) => !/(api)(\S+)/.test(key),
          ([key]) => model[key] === undefined
        ])
      )
      .reduce((prev, [key, value]) => ({ ...prev, [key]: value }), model);
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
  return {
    key,
    value,
    columnIndex: convertStringToNumber(value.toLowerCase())
  };
}
