import { UserInterfaces } from "./user-interfaces";

describe("events", () => {
  const ui = new UserInterfaces();
  describe("showConfigurationModal", () => {
    it("should not throw", () => {
      expect(ui.showConfigurationModal).not.toThrow();
    });
  });
});
