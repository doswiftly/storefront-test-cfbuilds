/**
 * Unit Tests for Cookie Manager
 *
 * These tests verify the cookie manager works correctly in both SSR and client contexts.
 *
 * Note: These tests require a test setup with:
 * - Jest or Vitest
 * - @testing-library/react for React component testing
 * - Mock implementations for Next.js cookies() API
 *
 * To run: npm test or pnpm test
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import Cookies from "js-cookie";
import {
  getCookieManager,
  resetCookieManager,
  getCurrencyFromCookie,
  setCurrencyInCookie,
  removeCurrencyFromCookie,
  CURRENCY_COOKIE_NAME,
} from "../cookie-manager";

// Mock js-cookie
vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

describe("CookieManager - Client Context", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    resetCookieManager();

    // Mock window to simulate client context
    global.window = {} as any;
  });

  describe("getCurrency()", () => {
    it("should return currency from cookie when set", () => {
      const mockCurrency = "EUR";
      vi.mocked(Cookies.get).mockReturnValue(mockCurrency);

      const manager = getCookieManager();
      const result = manager.getCurrency();

      expect(result).toBe(mockCurrency);
      expect(Cookies.get).toHaveBeenCalledWith(CURRENCY_COOKIE_NAME);
    });

    it("should return null when cookie is not set", () => {
      vi.mocked(Cookies.get).mockReturnValue(undefined);

      const manager = getCookieManager();
      const result = manager.getCurrency();

      expect(result).toBeNull();
    });

    it("should return null and log warning when cookie read fails", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation();
      vi.mocked(Cookies.get).mockImplementation(() => {
        throw new Error("Cookie blocked");
      });

      const manager = getCookieManager();
      const result = manager.getCurrency();

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[CookieManager] Failed to read currency cookie"
        ),
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("setCurrency()", () => {
    it("should set currency in cookie with correct attributes", () => {
      const currency = "USD";

      const manager = getCookieManager();
      manager.setCurrency(currency);

      expect(Cookies.set).toHaveBeenCalledWith(
        CURRENCY_COOKIE_NAME,
        currency,
        expect.objectContaining({
          expires: expect.any(Number),
          path: "/",
          sameSite: "lax",
        })
      );
    });

    it("should handle cookie write failure gracefully", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation();
      vi.mocked(Cookies.set).mockImplementation(() => {
        throw new Error("Cookie blocked");
      });

      const manager = getCookieManager();

      // Should not throw
      expect(() => manager.setCurrency("EUR")).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[CookieManager] Failed to set currency cookie"
        ),
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("removeCurrency()", () => {
    it("should remove currency cookie", () => {
      const manager = getCookieManager();
      manager.removeCurrency();

      expect(Cookies.remove).toHaveBeenCalledWith(CURRENCY_COOKIE_NAME, {
        path: "/",
      });
    });

    it("should handle cookie removal failure gracefully", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation();
      vi.mocked(Cookies.remove).mockImplementation(() => {
        throw new Error("Cookie blocked");
      });

      const manager = getCookieManager();

      // Should not throw
      expect(() => manager.removeCurrency()).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[CookieManager] Failed to remove currency cookie"
        ),
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("isServer()", () => {
    it("should return false in client context", () => {
      const manager = getCookieManager();
      expect(manager.isServer()).toBe(false);
    });
  });
});

describe("CookieManager - Server Context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCookieManager();

    // Mock SSR context by removing window
    delete (global as any).window;
  });

  describe("getCurrency()", () => {
    it("should return currency from Next.js cookies API", async () => {
      const mockCurrency = "GBP";
      const { cookies } = await import("next/headers");

      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: mockCurrency }),
      } as any);

      const manager = getCookieManager();
      const result = manager.getCurrency();

      expect(result).toBe(mockCurrency);
    });

    it("should return null when cookie is not set in SSR", async () => {
      const { cookies } = await import("next/headers");

      vi.mocked(cookies).mockReturnValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const manager = getCookieManager();
      const result = manager.getCurrency();

      expect(result).toBeNull();
    });

    it("should handle SSR cookie read failure gracefully", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation();
      const { cookies } = await import("next/headers");

      vi.mocked(cookies).mockImplementation(() => {
        throw new Error("Headers not available");
      });

      const manager = getCookieManager();
      const result = manager.getCurrency();

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[CookieManager] Failed to read currency cookie in SSR"
        ),
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("setCurrency()", () => {
    it("should log warning when called in SSR context", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation();

      const manager = getCookieManager();
      manager.setCurrency("USD");

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[CookieManager] setCurrency called in SSR context"
        )
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("removeCurrency()", () => {
    it("should log warning when called in SSR context", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation();

      const manager = getCookieManager();
      manager.removeCurrency();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[CookieManager] removeCurrency called in SSR context"
        )
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("isServer()", () => {
    it("should return true in SSR context", () => {
      const manager = getCookieManager();
      expect(manager.isServer()).toBe(true);
    });
  });
});

describe("Convenience Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCookieManager();
    global.window = {} as any;
  });

  it("getCurrencyFromCookie should work", () => {
    vi.mocked(Cookies.get).mockReturnValue("EUR");

    const result = getCurrencyFromCookie();

    expect(result).toBe("EUR");
  });

  it("setCurrencyInCookie should work", () => {
    setCurrencyInCookie("USD");

    expect(Cookies.set).toHaveBeenCalledWith(
      CURRENCY_COOKIE_NAME,
      "USD",
      expect.any(Object)
    );
  });

  it("removeCurrencyFromCookie should work", () => {
    removeCurrencyFromCookie();

    expect(Cookies.remove).toHaveBeenCalledWith(
      CURRENCY_COOKIE_NAME,
      expect.any(Object)
    );
  });
});

describe("Singleton Pattern", () => {
  beforeEach(() => {
    resetCookieManager();
    global.window = {} as any;
  });

  it("should return the same instance on multiple calls", () => {
    const manager1 = getCookieManager();
    const manager2 = getCookieManager();

    expect(manager1).toBe(manager2);
  });

  it("should create new instance after reset", () => {
    const manager1 = getCookieManager();
    resetCookieManager();
    const manager2 = getCookieManager();

    expect(manager1).not.toBe(manager2);
  });
});
