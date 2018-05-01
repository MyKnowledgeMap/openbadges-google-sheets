import {
  asDynamicProperty,
  getDynamicPayloads,
  getDynamicProperties,
  getPayloads,
  withStaticData
} from "./payload-builder";

describe("getPayloads", () => {
  // Arrange
  const props = { email: "{{A}}", text1: "z" } as any;

  const payloadBuilder = getPayloads(props);

  const rows = [["a", "b", "c", "d"], ["e", "f", "g", "h"]] as any;

  const range = {
    getValues: jest.fn().mockReturnValue(rows)
  };

  const sheet = {
    getRange: jest.fn().mockReturnValue(range),
    getLastColumn: jest.fn(),
    getLastRow: jest.fn()
  } as any;

  // Act
  const payloads = payloadBuilder(sheet);

  it("should return payload for each row", () => {
    expect(payloads.length).toBe(2);
  });

  it("should use static properties", () => {
    expect(payloads[0].text1).toBe("z");
  });

  it("should use dynamic properties", () => {
    expect(payloads[0].email).toBe("a");
    expect(payloads[1].email).toBe("e");
  });
});

describe("getDynamicPayloads", () => {
  // Arrange
  const rows = [["a", "b", "c", "d"], ["e", "f", "g", "h"]] as any;

  const range = {
    getValues: jest.fn().mockReturnValue(rows)
  };

  const sheet = {
    getRange: jest.fn().mockReturnValue(range),
    getLastColumn: jest.fn(),
    getLastRow: jest.fn()
  } as any;

  const props = {
    email: "{{A}}",
    text1: "{{B}}",
    text2: "{{C}}"
  } as any;
  const payloadsFromProps = getDynamicPayloads(props);

  // Act
  const payloads = payloadsFromProps(sheet);

  it("should return curried function", () => {
    expect(typeof payloadsFromProps).toBe("function");
  });

  it("should return payloads for rows", () => {
    expect(payloads.length).toBe(2);
  });

  it("should return payload with dynamic values", () => {
    expect(payloads[0].email).toBe("a");
    expect(payloads[0].text1).toBe("b");
    expect(payloads[0].text2).toBe("c");
    expect(payloads[1].email).toBe("e");
    expect(payloads[1].text1).toBe("f");
    expect(payloads[1].text2).toBe("g");
  });
});

describe("withStaticData", () => {
  const props = {
    apiKey: "a",
    text1: "b",
    text2: "c"
  } as any;

  const payloadBuilder = withStaticData(props);

  const payload = {
    text1: "exists"
  } as any;

  const result = payloadBuilder(payload);

  it("should not mutate provided payload", () => {
    expect(payload.text2).toBeUndefined();
    expect(result).not.toBe(payload);
  });

  it("should ignore api prefixed keys", () => {
    expect((result as any).apiKey).toBeUndefined();
  });

  it("should ignore existing values", () => {
    expect(result.text1).toBe("exists");
  });

  it("should update values using props", () => {
    expect(result.text2).toBe("c");
  });
});

describe("getDynamicProperties", () => {
  describe("when no dynamic", () => {
    it("should return empty", () => {
      expect(getDynamicProperties({} as any).length).toBe(0);
    });
  });

  describe("when dynamic", () => {
    // Arrange
    const props = { text1: "{{B}}" } as any;

    // Act
    const result = getDynamicProperties(props);

    it("should return all dynamic", () => {
      expect(result.length).toBe(1);
    });

    it("should have column key as number", () => {
      expect(result[0].columnIndex).toBe(2);
    });

    it("should have property key", () => {
      expect(result[0].key).toBe("text1");
    });

    it("should have clean property value", () => {
      expect(result[0].value).toBe("B");
    });
  });

  describe("asDynamicProperty", () => {
    const input: any = ["text1", "{{A}}"];
    const result = asDynamicProperty(input);

    it("should remove brackets from value", () => {
      expect(result.value).toBe("A");
    });

    it("should contain column number", () => {
      expect(result.columnIndex).toBe(1);
    });

    it("should return key for model", () => {
      expect(result.key).toBe(input[0]);
    });
  });
});
