import { Global } from "../__mocks__/global.mock";
import { onSaveConfiguration } from "./on-save-configuration";

declare const global: Global;

describe("onSaveConfiguration", () => {
  it("should set properties", () => {
    // Arrange
    const documentProperties: GoogleAppsScript.Properties.Properties = {
      setProperties: jest.fn().mockReturnThis()
    } as any;

    global.PropertiesService = {
      getDocumentProperties: jest.fn().mockReturnValue(documentProperties)
    } as any;

    const props = {} as any;

    // Act
    const result = onSaveConfiguration(props);

    // Assert
    expect(result).toBeDefined();
    expect(documentProperties.setProperties).toBeCalledWith(props);
  });
});
