import { convert, formatCurrency, getSymbol, CURRENCIES } from './currency-utils.js';

console.log("--- Currency Utils Verification ---");

// Mock Rates (Base JPY)
const mockRates = {
    'TWD': 0.22,  // 1 JPY = 0.22 TWD
    'USD': 0.007, // 1 JPY = 0.007 USD
    'EUR': 0.0065 // 1 JPY = 0.0065 EUR
};

// Test 1: Format Currency
console.log("\n1. Testing formatCurrency:");
const t1 = formatCurrency(1000, 'JPY');
console.log(`JPY 1000 -> ${t1} (Expected: ¥1,000)`);
if (t1 !== '¥1,000') console.error("FAIL");

const t2 = formatCurrency(500.5, 'TWD');
console.log(`TWD 500.5 -> ${t2} (Expected: NT$501)`); // Decimals 0
if (t2 !== 'NT$501') console.error("FAIL");

const t3 = formatCurrency(12.345, 'USD');
console.log(`USD 12.345 -> ${t3} (Expected: $12.35)`); // Decimals 2
if (t3 !== '$12.35') console.error("FAIL");


// Test 2: Convert Logic
console.log("\n2. Testing convert:");

// Case A: JPY -> TWD (Base -> Target)
// 1000 JPY * 0.22 = 220 TWD
const c1 = convert(1000, 'JPY', 'TWD', mockRates);
console.log(`1000 JPY -> TWD: ${c1} (Expected: 220)`);
if (Math.abs(c1 - 220) > 0.01) console.error("FAIL");

// Case B: TWD -> JPY (Target -> Base)
// 220 TWD / 0.22 = 1000 JPY
const c2 = convert(220, 'TWD', 'JPY', mockRates);
console.log(`220 TWD -> JPY: ${c2} (Expected: 1000)`);
if (Math.abs(c2 - 1000) > 0.01) console.error("FAIL");

// Case C: TWD -> USD (Cross Rate)
// 1000 TWD -> JPY: 1000 / 0.22 = 4545.45...
// JPY -> USD: 4545.45... * 0.007 = 31.8181...
const c3 = convert(1000, 'TWD', 'USD', mockRates);
const expectedC3 = (1000 / 0.22) * 0.007; // ~31.818
console.log(`1000 TWD -> USD: ${c3} (Expected: ~${expectedC3.toFixed(4)})`);
if (Math.abs(c3 - expectedC3) > 0.0001) console.error("FAIL");


// Test 3: Robustness
console.log("\n3. Testing Robustness:");
const r1 = getSymbol('KRW');
console.log(`KRW Symbol: ${r1} (Expected: ₩)`);
if (r1 !== '₩') console.error("FAIL");

const r2 = convert(100, 'JPY', 'UNKNOWN', mockRates);
console.log(`Unknown Currency Conversion: ${r2} (Should handle missing rate gracefully, likely return undefined or NaN based on impl, checked impl returns 1:1 fallback? No, it returns NaN if rate is missing)`);
// Actually current impl checks if rate is 0. rateTo will be undefined -> 0.
// Let's check the implementation again.
// rateTo = rates['UNKNOWN'] || 0. 
// if rateTo === 0 => console.warn, returns amount.
// So expected is 100 (fallback).

console.log(`Fallback value: ${r2} (Expected: 100)`);
if (r2 !== 100) console.error("FAIL");

console.log("\n--- Verification Complete ---");
