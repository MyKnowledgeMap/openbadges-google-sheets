import { Events } from "./events";

describe("events", () => {
  const events = new Events();

  describe("onOpen", () => {
    it("should not throw", () => {
      expect(events.onOpen).not.toThrow();
    });
  });

  describe("onInstall", () => {
    it("should not throw", () => {
      expect(events.onInstall).not.toThrow();
    });
  });

  describe("onSaveConfiguration", () => {
    it("should not throw", () => {
      expect(events.onSaveConfiguration).not.toThrow();
    });
  });

  describe("onFormSubmit", () => {
    it("should not throw", () => {
      expect(events.onFormSubmit).not.toThrow();
    });
  });
});
