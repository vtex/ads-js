import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { atob, btoa } from "./base64";

describe("base64 utilities", () => {
  // Store original window object
  const originalWindow = global.window;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original window
    global.window = originalWindow;
  });

  describe("atob", () => {
    it("should use window.atob when available", () => {
      // Arrange
      const mockAtob = vi.fn().mockReturnValue("decoded string");
      global.window = {
        atob: mockAtob,
      } as object;

      // Act
      const result = atob("ZW5jb2RlZCBzdHJpbmc=");

      // Assert
      expect(mockAtob).toHaveBeenCalledWith("ZW5jb2RlZCBzdHJpbmc=");
      expect(result).toBe("decoded string");
    });

    it("should use Buffer when window.atob is not available", () => {
      // Arrange
      global.window = {} as object;

      // Act
      const result = atob("aGVsbG8gd29ybGQ=");

      // Assert
      expect(result).toBe("hello world");
    });

    it("should use Buffer when window is not defined (real Node.js behavior)", () => {
      // Arrange - Delete window completely to simulate real Node.js
      delete (global as object).window;

      // Act
      const result = atob("aGVsbG8gd29ybGQ=");

      // Assert
      expect(result).toBe("hello world");
    });

    it("should decode base64 strings correctly using Buffer fallback", () => {
      // Arrange
      global.window = {} as object;

      // Test various strings
      const testCases = [
        { input: "SGVsbG8=", expected: "Hello" },
        { input: "V29ybGQ=", expected: "World" },
        { input: "VGVzdCBzdHJpbmc=", expected: "Test string" },
        { input: "MTIzNDU2Nzg5MA==", expected: "1234567890" },
        {
          input: "YVcxd2NtVnpjMmx2Ymw5a1lYUmg=",
          expected: "aW1wcmVzc2lvbl9kYXRh",
        },
      ];

      testCases.forEach(({ input, expected }) => {
        // Act
        const result = atob(input);

        // Assert
        expect(result).toBe(expected);
      });
    });

    it("should handle empty string", () => {
      // Arrange
      global.window = {} as object;

      // Act
      const result = atob("");

      // Assert
      expect(result).toBe("");
    });

    it("should handle special characters", () => {
      // Arrange
      global.window = {} as object;

      // Act
      const result = atob("8J+YgPCfmIHwn5iC");

      // Assert
      expect(result).toBe("😀😁😂");
    });

    it("should fallback to Buffer when window.atob is null", () => {
      // Arrange
      global.window = {
        atob: null,
      } as object;

      // Act
      const result = atob("dGVzdA==");

      // Assert
      expect(result).toBe("test");
    });

    it("should fallback to Buffer when window.atob is undefined", () => {
      // Arrange
      global.window = {
        atob: undefined,
      } as object;

      // Act
      const result = atob("dGVzdA==");

      // Assert
      expect(result).toBe("test");
    });
  });

  describe("btoa", () => {
    it("should use window.btoa when available", () => {
      // Arrange
      const mockBtoa = vi.fn().mockReturnValue("ZW5jb2RlZCBzdHJpbmc=");
      global.window = {
        btoa: mockBtoa,
      } as unknown as Window & typeof globalThis;

      // Act
      const result = btoa("encoded string");

      // Assert
      expect(mockBtoa).toHaveBeenCalledWith("encoded string");
      expect(result).toBe("ZW5jb2RlZCBzdHJpbmc=");
    });

    it("should use Buffer when window.btoa is not available", () => {
      // Arrange
      global.window = {} as unknown as Window & typeof globalThis;

      // Act
      const result = btoa("hello world");

      // Assert
      expect(result).toBe("aGVsbG8gd29ybGQ=");
    });

    it("should use Buffer when window is not defined (real Node.js behavior)", () => {
      // Arrange - Delete window completely to simulate real Node.js
      delete (global as unknown as Window & typeof globalThis).window;

      // Act
      const result = btoa("hello world");

      // Assert
      expect(result).toBe("aGVsbG8gd29ybGQ=");
    });

    it("should encode strings correctly using Buffer fallback", () => {
      // Arrange
      global.window = {} as unknown as Window & typeof globalThis;

      // Test various strings
      const testCases = [
        { input: "Hello", expected: "SGVsbG8=" },
        { input: "World", expected: "V29ybGQ=" },
        { input: "Test string", expected: "VGVzdCBzdHJpbmc=" },
        { input: "1234567890", expected: "MTIzNDU2Nzg5MA==" },
        {
          input: "aW1wcmVzc2lvbl9kYXRh",
          expected: "YVcxd2NtVnpjMmx2Ymw5a1lYUmg=",
        },
      ];

      testCases.forEach(({ input, expected }) => {
        // Act
        const result = btoa(input);

        // Assert
        expect(result).toBe(expected);
      });
    });

    it("should handle empty string", () => {
      // Arrange
      global.window = {} as unknown as Window & typeof globalThis;

      // Act
      const result = btoa("");

      // Assert
      expect(result).toBe("");
    });

    it("should handle special characters", () => {
      // Arrange
      global.window = {} as unknown as Window & typeof globalThis;

      // Act
      const result = btoa("😀😁😂");

      // Assert
      expect(result).toBe("8J+YgPCfmIHwn5iC");
    });

    it("should fallback to Buffer when window.btoa is null", () => {
      // Arrange
      global.window = {
        btoa: null,
      } as unknown as Window & typeof globalThis;

      // Act
      const result = btoa("test");

      // Assert
      expect(result).toBe("dGVzdA==");
    });

    it("should fallback to Buffer when window.btoa is undefined", () => {
      // Arrange
      global.window = {
        btoa: undefined,
      } as unknown as Window & typeof globalThis;

      // Act
      const result = btoa("test");

      // Assert
      expect(result).toBe("dGVzdA==");
    });

    it("should handle URL strings correctly", () => {
      // Arrange
      global.window = {} as unknown as Window & typeof globalThis;

      // Act
      const result = btoa("https://example.com/click");

      // Assert
      expect(result).toBe("aHR0cHM6Ly9leGFtcGxlLmNvbS9jbGljaw==");
    });
  });

  describe("round-trip encoding/decoding", () => {
    it("should correctly encode and decode strings using browser APIs", () => {
      // Arrange
      const mockAtob = vi
        .fn()
        .mockImplementation((str) => Buffer.from(str, "base64").toString());
      const mockBtoa = vi
        .fn()
        .mockImplementation((str) => Buffer.from(str).toString("base64"));
      global.window = {
        atob: mockAtob,
        btoa: mockBtoa,
      } as unknown as Window & typeof globalThis;

      const testStrings = [
        "Hello World",
        "Test string with special chars: !@#$%^&*()",
        "Numbers: 1234567890",
        "https://example.com/path?param=value",
      ];

      testStrings.forEach((originalString) => {
        // Act
        const encoded = btoa(originalString);
        const decoded = atob(encoded);

        // Assert
        expect(decoded).toBe(originalString);
        expect(mockBtoa).toHaveBeenCalledWith(originalString);
        expect(mockAtob).toHaveBeenCalledWith(encoded);
      });
    });

    it("should correctly encode and decode strings using Buffer fallback", () => {
      // Arrange
      global.window = {} as unknown as Window & typeof globalThis;

      const testStrings = [
        "Hello World",
        "Test string with special chars: !@#$%^&*()",
        "Numbers: 1234567890",
        "https://example.com/path?param=value",
        "aW1wcmVzc2lvbl9kYXRh", // This is used in the actual codebase
      ];

      testStrings.forEach((originalString) => {
        // Act
        const encoded = btoa(originalString);
        const decoded = atob(encoded);

        // Assert
        expect(decoded).toBe(originalString);
      });
    });

    it("should handle impression URL encoding as used in the codebase", () => {
      // Arrange
      global.window = {} as unknown as Window & typeof globalThis;
      const impressionUrl = "aW1wcmVzc2lvbl9kYXRh";

      // Act - This simulates what happens in mergeAdsWithProducts.ts
      const encoded = btoa(impressionUrl);

      // Assert
      expect(encoded).toBe("YVcxd2NtVnpjMmx2Ymw5a1lYUmg=");

      // Verify round-trip
      const decoded = atob(encoded);
      expect(decoded).toBe(impressionUrl);
    });
  });

  describe("error handling", () => {
    it("should handle malformed base64 in browser environment", () => {
      // Arrange
      const mockAtob = vi.fn().mockImplementation(() => {
        throw new Error("Invalid base64");
      });
      global.window = {
        atob: mockAtob,
      } as unknown as Window & typeof globalThis;

      // Act & Assert
      expect(() => atob("invalid base64!!!")).toThrow("Invalid base64");
    });

    it("should handle malformed base64 in Node.js environment", () => {
      // Arrange
      global.window = {} as unknown as Window & typeof globalThis;

      // Act - Buffer.from is actually quite lenient with invalid base64
      // It will silently ignore invalid characters rather than throw
      const result = atob("invalid base64!!!");

      // Assert - Just verify it returns something (Buffer.from handles this
      // gracefully)
      expect(typeof result).toBe("string");
    });
  });
});
