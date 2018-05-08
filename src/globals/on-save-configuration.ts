/**
 * Called by the settings template when the save button is clicked.
 *
 * @export
 * @param {DocumentProperties} props
 * @returns {Properties}
 */
export function onSaveConfiguration(props: DocumentProperties): Properties {
  return PropertiesService.getDocumentProperties().setProperties(props);
}
