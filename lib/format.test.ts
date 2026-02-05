/**
 * Price Formatting Tests
 *
 * Unit tests for formatPrice, formatAmount, and related formatting functions.
 * Requirements: R41 (Price Display Consistency)
 */

import {
  formatPrice,
  formatAmount,
  formatPriceRange,
  getCurrencySymbol,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  CURRENCY_SYMBOLS,
  CURRENCY_LOCALES,
  type PriceMoney,
} from "./format";

// ============================================================================
// formatPrice Tests (22.34.1)
// ============================================================================

describe("formatPrice", () => {
  describe("basic formatting", () => {
    it("should format PLN prices correctly", () => {
      const price: PriceMoney = { amount: "99.99", currencyCode: "PLN" };
      const formatted = formatPrice(price);
      // PLN uses Polish locale format: "99,99 zł"
      expect(formatted).toMatch(/99[,.]99/);
      expect(formatted).toMatch(/zł/);
    });

    it("should format USD prices correctly", () => {
      const price: PriceMoney = { amount: "49.99", currencyCode: "USD" };
      const formatted = formatPrice(price);
      // USD uses US locale format: "$49.99"
      expect(formatted).toMatch(/\$?49[,.]99/);
    });

    it("should format EUR prices correctly", () => {
      const price: PriceMoney = { amount: "79.50", currencyCode: "EUR" };
      const formatted = formatPrice(price);
      // EUR uses German locale format: "79,50 €"
      expect(formatted).toMatch(/79[,.]50/);
      expect(formatted).toMatch(/€/);
    });

    it("should format GBP prices correctly", () => {
      const price: PriceMoney = { amount: "29.99", currencyCode: "GBP" };
      const formatted = formatPrice(price);
      expect(formatted).toMatch(/£?29[,.]99/);
    });
  });

  describe("edge cases", () => {
    it("should return empty string for null input", () => {
      expect(formatPrice(null)).toBe("");
    });

    it("should return empty string for undefined input", () => {
      expect(formatPrice(undefined)).toBe("");
    });

    it("should handle zero amount", () => {
      const price: PriceMoney = { amount: "0.00", currencyCode: "PLN" };
      const formatted = formatPrice(price);
      expect(formatted).toMatch(/0[,.]00/);
    });

    it("should handle large amounts", () => {
      const price: PriceMoney = { amount: "999999.99", currencyCode: "USD" };
      const formatted = formatPrice(price);
      expect(formatted).toMatch(/999[,.]?999[,.]99/);
    });

    it("should handle amounts without decimal places", () => {
      const price: PriceMoney = { amount: "100", currencyCode: "PLN" };
      const formatted = formatPrice(price);
      expect(formatted).toMatch(/100[,.]00/);
    });

    it("should handle negative amounts", () => {
      const price: PriceMoney = { amount: "-50.00", currencyCode: "EUR" };
      const formatted = formatPrice(price);
      expect(formatted).toMatch(/-?50[,.]00/);
    });
  });

  describe("decimal precision", () => {
    it("should always show 2 decimal places", () => {
      const price: PriceMoney = { amount: "10.5", currencyCode: "USD" };
      const formatted = formatPrice(price);
      // Should be formatted as 10.50, not 10.5
      expect(formatted).toMatch(/10[,.]50/);
    });

    it("should round to 2 decimal places", () => {
      const price: PriceMoney = { amount: "10.999", currencyCode: "USD" };
      const formatted = formatPrice(price);
      // Should round to 11.00
      expect(formatted).toMatch(/11[,.]00/);
    });
  });

  describe("unknown currencies", () => {
    it("should handle unknown currency codes gracefully", () => {
      const price: PriceMoney = { amount: "50.00", currencyCode: "XYZ" };
      const formatted = formatPrice(price);
      // Should still format the number and include currency code
      expect(formatted).toMatch(/50/);
    });
  });
});

// ============================================================================
// formatAmount Tests (22.34.2)
// ============================================================================

describe("formatAmount", () => {
  describe("string amounts", () => {
    it("should format string amount with PLN", () => {
      const formatted = formatAmount("115.20", "PLN");
      expect(formatted).toMatch(/115[,.]20/);
      expect(formatted).toMatch(/zł/);
    });

    it("should format string amount with USD", () => {
      const formatted = formatAmount("99.99", "USD");
      expect(formatted).toMatch(/99[,.]99/);
    });

    it("should format string amount with EUR", () => {
      const formatted = formatAmount("250.00", "EUR");
      expect(formatted).toMatch(/250[,.]00/);
      expect(formatted).toMatch(/€/);
    });
  });

  describe("numeric amounts", () => {
    it("should format number amount correctly", () => {
      const formatted = formatAmount(49.99, "USD");
      expect(formatted).toMatch(/49[,.]99/);
    });

    it("should format integer amount with decimals", () => {
      const formatted = formatAmount(100, "PLN");
      expect(formatted).toMatch(/100[,.]00/);
    });

    it("should handle floating point precision", () => {
      const formatted = formatAmount(0.1 + 0.2, "USD"); // 0.30000000000000004
      expect(formatted).toMatch(/0[,.]30/);
    });
  });

  describe("edge cases", () => {
    it("should handle zero amount", () => {
      const formatted = formatAmount("0", "EUR");
      expect(formatted).toMatch(/0[,.]00/);
    });

    it("should handle very small amounts", () => {
      const formatted = formatAmount("0.01", "USD");
      expect(formatted).toMatch(/0[,.]01/);
    });

    it("should handle very large amounts", () => {
      const formatted = formatAmount("1000000", "CHF");
      expect(formatted).toMatch(/1[,.' ]?000[,.' ]?000/);
    });
  });
});

// ============================================================================
// formatPriceRange Tests
// ============================================================================

describe("formatPriceRange", () => {
  it("should format price range with different min and max", () => {
    const min: PriceMoney = { amount: "10.00", currencyCode: "USD" };
    const max: PriceMoney = { amount: "50.00", currencyCode: "USD" };
    const formatted = formatPriceRange(min, max);
    expect(formatted).toMatch(/10[,.]00/);
    expect(formatted).toMatch(/50[,.]00/);
    expect(formatted).toMatch(/-/);
  });

  it("should format single price when min equals max", () => {
    const min: PriceMoney = { amount: "25.00", currencyCode: "EUR" };
    const max: PriceMoney = { amount: "25.00", currencyCode: "EUR" };
    const formatted = formatPriceRange(min, max);
    // Should not contain separator when prices are equal
    expect(formatted.match(/-/g) || []).toHaveLength(0);
    expect(formatted).toMatch(/25[,.]00/);
  });
});

// ============================================================================
// getCurrencySymbol Tests
// ============================================================================

describe("getCurrencySymbol", () => {
  it("should return correct symbols for common currencies", () => {
    expect(getCurrencySymbol("PLN")).toBe("zł");
    expect(getCurrencySymbol("USD")).toBe("$");
    expect(getCurrencySymbol("EUR")).toBe("€");
    expect(getCurrencySymbol("GBP")).toBe("£");
  });

  it("should return currency code for unknown currencies", () => {
    expect(getCurrencySymbol("XYZ")).toBe("XYZ");
    expect(getCurrencySymbol("ABC")).toBe("ABC");
  });
});

// ============================================================================
// CURRENCY_SYMBOLS Constants Tests
// ============================================================================

describe("CURRENCY_SYMBOLS", () => {
  it("should contain all expected currency symbols", () => {
    expect(CURRENCY_SYMBOLS.PLN).toBe("zł");
    expect(CURRENCY_SYMBOLS.EUR).toBe("€");
    expect(CURRENCY_SYMBOLS.USD).toBe("$");
    expect(CURRENCY_SYMBOLS.GBP).toBe("£");
    expect(CURRENCY_SYMBOLS.CHF).toBe("CHF");
    expect(CURRENCY_SYMBOLS.JPY).toBe("¥");
  });
});

describe("CURRENCY_LOCALES", () => {
  it("should contain all expected currency locales", () => {
    expect(CURRENCY_LOCALES.PLN).toBe("pl-PL");
    expect(CURRENCY_LOCALES.EUR).toBe("de-DE");
    expect(CURRENCY_LOCALES.USD).toBe("en-US");
    expect(CURRENCY_LOCALES.GBP).toBe("en-GB");
  });
});

// ============================================================================
// formatNumber Tests
// ============================================================================

describe("formatNumber", () => {
  it("should format numbers with thousands separator", () => {
    expect(formatNumber(1000)).toMatch(/1[,.]000/);
    expect(formatNumber(1000000)).toMatch(/1[,.]000[,.]000/);
  });

  it("should handle small numbers", () => {
    expect(formatNumber(42)).toBe("42");
  });

  it("should handle zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
});

// ============================================================================
// formatPercentage Tests
// ============================================================================

describe("formatPercentage", () => {
  it("should format decimal as percentage", () => {
    expect(formatPercentage(0.15)).toBe("15%");
    expect(formatPercentage(0.5)).toBe("50%");
    expect(formatPercentage(1)).toBe("100%");
  });

  it("should round percentages", () => {
    expect(formatPercentage(0.156)).toBe("16%");
    expect(formatPercentage(0.333)).toBe("33%");
  });

  it("should handle zero", () => {
    expect(formatPercentage(0)).toBe("0%");
  });
});

// ============================================================================
// formatDate Tests
// ============================================================================

describe("formatDate", () => {
  it("should format Date object", () => {
    const date = new Date("2025-01-23");
    const formatted = formatDate(date);
    expect(formatted).toMatch(/Jan/);
    expect(formatted).toMatch(/23/);
    expect(formatted).toMatch(/2025/);
  });

  it("should format ISO date string", () => {
    const formatted = formatDate("2025-12-25");
    expect(formatted).toMatch(/Dec/);
    expect(formatted).toMatch(/25/);
    expect(formatted).toMatch(/2025/);
  });
});

// ============================================================================
// formatDateTime Tests
// ============================================================================

describe("formatDateTime", () => {
  it("should include time in format", () => {
    const date = new Date("2025-01-23T14:30:00");
    const formatted = formatDateTime(date);
    expect(formatted).toMatch(/Jan/);
    expect(formatted).toMatch(/23/);
    expect(formatted).toMatch(/2025/);
    // Should include time component
    expect(formatted).toMatch(/[0-9]+:[0-9]+/);
  });
});

// ============================================================================
// Integration Tests (22.34.3)
// ============================================================================

describe("Price Display Integration", () => {
  describe("consistent formatting across currencies", () => {
    const testCases = [
      { currency: "PLN", amount: "99.99" },
      { currency: "USD", amount: "99.99" },
      { currency: "EUR", amount: "99.99" },
      { currency: "GBP", amount: "99.99" },
    ];

    testCases.forEach(({ currency, amount }) => {
      it(`should consistently format ${currency} prices`, () => {
        const price: PriceMoney = { amount, currencyCode: currency };
        const formatted = formatPrice(price);

        // Should contain the amount
        expect(formatted).toMatch(/99[,.]99/);

        // Should not be empty
        expect(formatted.length).toBeGreaterThan(0);

        // Should contain currency indicator
        const symbol = CURRENCY_SYMBOLS[currency];
        if (symbol) {
          expect(formatted.includes(symbol) || formatted.includes(currency)).toBe(true);
        }
      });
    });
  });

  describe("formatPrice and formatAmount consistency", () => {
    it("should produce equivalent results for same input", () => {
      const amount = "50.00";
      const currency = "PLN";

      const fromFormatPrice = formatPrice({ amount, currencyCode: currency });
      const fromFormatAmount = formatAmount(amount, currency);

      // Both should produce the same result
      expect(fromFormatPrice).toBe(fromFormatAmount);
    });
  });

  describe("price comparison scenarios", () => {
    it("should correctly format sale vs original price", () => {
      const originalPrice: PriceMoney = { amount: "100.00", currencyCode: "PLN" };
      const salePrice: PriceMoney = { amount: "79.99", currencyCode: "PLN" };

      const formattedOriginal = formatPrice(originalPrice);
      const formattedSale = formatPrice(salePrice);

      // Both should be formatted
      expect(formattedOriginal).toMatch(/100[,.]00/);
      expect(formattedSale).toMatch(/79[,.]99/);
    });

    it("should format cart total correctly", () => {
      // Simulating cart total calculation
      const lineItems = [
        { amount: "29.99", currencyCode: "EUR" },
        { amount: "49.99", currencyCode: "EUR" },
        { amount: "19.99", currencyCode: "EUR" },
      ];

      const total = lineItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const formattedTotal = formatAmount(total, "EUR");

      // 29.99 + 49.99 + 19.99 = 99.97
      expect(formattedTotal).toMatch(/99[,.]97/);
    });
  });
});

// Export for test runner
export {};
