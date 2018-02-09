import { Helpers } from "./helpers";

describe("Helpers", () => {
  describe("hasRequiredProperties", () => {
    describe("when missing provided property names", () => {
      it("should return false", () => {
        const properties = {
          A: "1",
          B: "2"
        };
        const required = ["A", "B", "C"];
        const result = Helpers.hasRequiredProperties(properties, required);
        expect(result).toBe(false);
      });
    });

    describe("when has provided property names", () => {
      it("should return true", () => {
        const properties = {
          A: "1",
          B: "2",
          C: "3"
        };
        const required = ["A", "B", "C"];
        const result = Helpers.hasRequiredProperties(properties, required);
        expect(result).toBe(true);
      });
    });
  });

  describe("bindPropertiesToTemplate", () => {
    const template = {};
    let boundTemplate;

    describe("when properties not set", () => {
      it("should set template bindings as empty strings", () => {
        // Arrange
        global.PropertiesService = {
          getUserProperties: jest.fn().mockReturnThis(),
          getProperties: jest.fn().mockReturnValue({})
        };

        // Act
        boundTemplate = Helpers.bindPropertiesToTemplate(template);

        // Assert
        expect(boundTemplate.apiKey).toBe("");
        expect(boundTemplate.authToken).toBe("");
        expect(boundTemplate.openBadgesUrl).toBe("");
        expect(boundTemplate.activityId).toBe("");
        expect(boundTemplate.activityTime).toBe("");
        expect(boundTemplate.userId).toBe("");
        expect(boundTemplate.text1).toBe("");
        expect(boundTemplate.text2).toBe("");
        expect(boundTemplate.email).toBe("");
        expect(boundTemplate.firstName).toBe("");
        expect(boundTemplate.lastName).toBe("");
        expect(boundTemplate.int1).toBe("");
        expect(boundTemplate.int2).toBe("");
        expect(boundTemplate.date1).toBe("");
      });
    });

    describe("when properties set", () => {
      it("should set template bindings as the property value", () => {
        // Arrange
        const props = {
          OB_API_KEY: "Test",
          OB_AUTH_TOKEN: "Test",
          OB_URL: "Test",
          OB_ACTIVITY_ID: "Test",
          OB_ACTIVITY_TIME: "Test",
          OB_USER_ID: "Test",
          OB_TEXT_1: "Test",
          OB_TEXT_2: "Test",
          OB_FIRST_NAME: "Test",
          OB_LAST_NAME: "Test",
          OB_INT_1: "Test",
          OB_INT_2: "Test",
          OB_DATE_1: "Test",
          OB_EMAIL: "Test"
        };
        global.PropertiesService = {
          getUserProperties: jest.fn().mockReturnThis(),
          getProperties: jest.fn().mockReturnValue(props)
        };

        // Act
        boundTemplate = Helpers.bindPropertiesToTemplate(template);

        // Assert
        expect(boundTemplate.apiKey).toBe("Test");
        expect(boundTemplate.authToken).toBe("Test");
        expect(boundTemplate.openBadgesUrl).toBe("Test");
        expect(boundTemplate.activityId).toBe("Test");
        expect(boundTemplate.activityTime).toBe("Test");
        expect(boundTemplate.userId).toBe("Test");
        expect(boundTemplate.text1).toBe("Test");
        expect(boundTemplate.text2).toBe("Test");
        expect(boundTemplate.email).toBe("Test");
        expect(boundTemplate.firstName).toBe("Test");
        expect(boundTemplate.lastName).toBe("Test");
        expect(boundTemplate.int1).toBe("Test");
        expect(boundTemplate.int2).toBe("Test");
        expect(boundTemplate.date1).toBe("Test");
      });
    });
  });
});
