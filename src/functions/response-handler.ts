import {
  getDynamicProperties,
  getPrettyError,
  updateIssuedColumnForSheet
} from ".";

/**
 * A request response handler.
 *
 * @export
 * @param {DocumentProperties} props
 * @returns {ResponseHandlerBuilder}
 */
export function responseHandler(
  props: DocumentProperties
): ResponseHandlerBuilder {
  return (sheet: Sheet) => (payloads: ReadonlyArray<CreateActivityEvent>) => ({
    success: () => {
      // This works but is a side-effect.
      getDynamicProperties(props) // tslint:disable-line:no-expression-statement
        .filter(x => x.key === "issued")
        .forEach(updateIssuedColumnForSheet(sheet)(payloads));

      const { length } = payloads;
      const message = `Sent ${length} row${length > 1 ? "s" : ""}.`;
      return SpreadsheetApp.getUi().alert(message) as any;
    },
    error: (res: HttpResponse) =>
      SpreadsheetApp.getUi().alert(
        getPrettyError(JSON.parse(res.getContentText()))
      ) as any
  });
}
