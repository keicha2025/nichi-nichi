/**
 * Currency Utility Functions
 * Handles formatting and conversion for multi-currency support.
 */

export const CURRENCIES = {
    JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
    TWD: { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar', decimals: 0 },
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
    KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimals: 0 },
    THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', decimals: 2 },
    CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
    HKD: { code: 'HKD', symbol: '$', name: 'Hong Kong Dollar', decimals: 2 },
    SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimals: 2 }
};

/**
 * Formats a number as a currency string.
 * @param {number} amount - The amount to format.
 * @param {string} currencyCode - The currency code (e.g., 'JPY', 'TWD').
 * @returns {string} - The formatted currency string (e.g., "¥1,000", "NT$500").
 */
export function formatCurrency(amount, currencyCode) {
    const currency = CURRENCIES[currencyCode] || { symbol: currencyCode, decimals: 2 };

    // Check if amount is valid
    if (amount === undefined || amount === null || isNaN(amount)) {
        return `${currency.symbol}0`;
    }

    // Format number with commas and appropriate decimal places
    const formattedNum = Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals
    });

    return `${currency.symbol}${formattedNum}`;
}

/**
 * Converts an amount from one currency to another using provided rates.
 * Logic: 
 * - If From == To: Return Amount.
 * - If From == Base (JPY): Amount * Rate(To).
 * - If To == Base (JPY): Amount / Rate(From).
 * - Else (Cross Rate): (Amount / Rate(From)) * Rate(To).
 * 
 * NOTE: The System Base Currency is assumed to be JPY for typical rates usage (1 JPY = X TWD).
 * However, many APIs provide rates with USD as base. 
 * This function assumes the `rates` object is keyed by currency code relative to a SINGLE base.
 * If your `rx_rate` (legacy) is JPY -> TWD (0.22), then JPY is Base.
 * 
 * @param {number} amount - The amount to convert.
 * @param {string} fromCurrency - The source currency code.
 * @param {string} toCurrency - The target currency code.
 * @param {object} rates - Map of exchange rates relative to a base currency (e.g., { "TWD": 0.22, "USD": 0.007 }). Base currency (JPY) does not need to be in the map (rate is 1).
 * @param {string} baseCurrencyCode - The base currency for the rates (default 'JPY').
 * @returns {number} - The converted amount.
 */
export function convert(amount, fromCurrency, toCurrency, rates, baseCurrencyCode = 'JPY') {
    if (!amount) return 0;
    if (fromCurrency === toCurrency) return amount;

    // Resolve rates
    // Base currency rate is always 1
    const getRate = (code) => {
        if (code === baseCurrencyCode) return 1;
        return rates[code] || 0;
    };

    const rateFrom = getRate(fromCurrency);
    const rateTo = getRate(toCurrency);

    if (rateFrom === 0 || rateTo === 0) {
        console.warn(`Missing exchange rate for conversion: ${fromCurrency} -> ${toCurrency}`);
        return amount; // Fallback to 1:1 if rate missing to avoid 0/Infinity issues in UI
    }

    // Convert: Amount / RateFrom * RateTo
    // Example: 100 TWD -> USD (Base JPY)
    // TWD rate (JPY->TWD) = 0.22
    // USD rate (JPY->USD) = 0.007
    // 100 TWD = 100 / 0.22 JPY = 454.54 JPY
    // 454.54 JPY = 454.54 * 0.007 USD = 3.18 USD

    return (amount / rateFrom) * rateTo;
}

/**
 * Helper to get the currency symbol.
 * @param {string} currencyCode 
 * @returns {string}
 */
export function getSymbol(currencyCode) {
    return CURRENCIES[currencyCode]?.symbol || currencyCode;
}
