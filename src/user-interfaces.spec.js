import * as ui from "./user-interfaces";

describe("events", () => {
  describe("showConfigurationModal", () => {
    it("should not throw", () => {
      expect(ui.showConfigurationModal).not.toThrow();
    });
  });
});
