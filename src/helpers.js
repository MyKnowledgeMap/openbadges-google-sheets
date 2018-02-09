export const Helpers = {
  /**
   * Fetches the user properties and binds them to the provided template.
   * @param {any} template
   * @return {any} template
   */
  bindPropertiesToTemplate: template => {
    // Get the user properties.
    const properties = PropertiesService.getUserProperties().getProperties();

    // Bind the properties to the template.
    template.apiKey = properties["OB_API_KEY"] || "";
    template.authToken = properties["OB_AUTH_TOKEN"] || "";
    template.openBadgesUrl = properties["OB_URL"] || "";
    template.activityId = properties["OB_ACTIVITY_ID"] || "";
    template.activityTime = properties["OB_ACTIVITY_TIME"] || "";
    template.firstName = properties["OB_FIRST_NAME"] || "";
    template.lastName = properties["OB_LAST_NAME"] || "";
    template.userId = properties["OB_USER_ID"] || "";
    template.text1 = properties["OB_TEXT_1"] || "";
    template.text2 = properties["OB_TEXT_2"] || "";
    template.email = properties["OB_EMAIL"] || "";
    template.int1 = properties["OB_INT_1"] || "";
    template.int2 = properties["OB_INT_2"] || "";
    template.date1 = properties["OB_DATE_1"] || "";

    return template;
  },

  /**
   * Check whether the required properties were set on the
   * provided properties object.
   * @param {any} properties
   * @param {string[]} propertyNames
   * @return {boolean} result
   */
  hasRequiredProperties: (properties, propertyNames) => {
    const results = propertyNames.map(name => !!properties[name]);
    return results.every(result => result);
  }
};
