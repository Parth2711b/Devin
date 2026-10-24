import { add, multiply } from './math.js';

let passedTests = 0;
let totalTests = 0;

function assertEqual(actual, expected, testName) {
  totalTests++;
  if (actual === expected) {
    passedTests++;
    console.log(`[PASS] ${testName}: expected ${expected}, got ${actual}`);
  } else {
    console.error(`[FAIL] ${testName}: expected ${expected}, got ${actual}`);
  }
}

console.log('=== Running Math Library Tests ===\n');

// Tests for add function
console.log('--- Testing add() ---');
assertEqual(add(2, 3), 5, 'add(2, 3) should return 5');
assertEqual(add(-1, 1), 0, 'add(-1, 1) should return 0');
assertEqual(add(-5, -5), -10, 'add(-5, -5) should return -10');
assertEqual(add(0, 7), 7, 'add(0, 7) should return 7');
assertEqual(add(2.5, 3.5), 6, 'add(2.5, 3.5) should return 6');

console.log('\n--- Testing multiply() ---');
assertEqual(multiply(2, 3), 6, 'multiply(2, 3) should return 6');
assertEqual(multiply(-2, 3), -6, 'multiply(-2, 3) should return -6');
assertEqual(multiply(-4, -5), 20, 'multiply(-4, -5) should return 20');
assertEqual(multiply(5, 0), 0, 'multiply(5, 0) should return 0');
assertEqual(multiply(2.5, 2), 5, 'multiply(2.5, 2) should return 5');

console.log(`\n=== Summary: ${passedTests}/${totalTests} tests passed ===`);

if (passedTests !== totalTests) {
  process.exit(1);
}
