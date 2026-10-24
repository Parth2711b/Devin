const test = require('node:test');
const assert = require('node:assert');
const Calculator = require('./calculator.js');

test('Calculator Engine - Basic Arithmetic', () => {
  const calc = new Calculator();
  assert.strictEqual(calc.evaluate('2 + 3 * 4'), 14);
  assert.strictEqual(calc.evaluate('(2 + 3) * 4'), 20);
  assert.strictEqual(calc.evaluate('10 / 2 - 3'), 2);
  assert.strictEqual(calc.evaluate('2 ^ 3'), 8);
  assert.strictEqual(calc.evaluate('5 % 2'), 1);
});

test('Calculator Engine - Floating Precision', () => {
  const calc = new Calculator();
  assert.strictEqual(calc.evaluate('0.1 + 0.2'), 0.3);
});

test('Calculator Engine - Scientific Functions & Constants', () => {
  const calc = new Calculator();
  calc.setAngleMode('deg');
  assert.strictEqual(calc.evaluate('sin(90)'), 1);
  assert.strictEqual(calc.evaluate('cos(0)'), 1);
  assert.strictEqual(calc.evaluate('tan(45)'), 1);
  assert.strictEqual(calc.evaluate('sqrt(16)'), 4);
  assert.strictEqual(calc.evaluate('log(100)'), 2);
  assert.strictEqual(calc.evaluate('ln(e)'), 1);
});

test('Calculator Engine - Memory Operations', () => {
  const calc = new Calculator();
  calc.memoryClear();
  assert.strictEqual(calc.memoryRecall(), 0);
  calc.memoryAdd(10);
  assert.strictEqual(calc.memoryRecall(), 10);
  calc.memorySubtract(4);
  assert.strictEqual(calc.memoryRecall(), 6);
  calc.memoryStore(25);
  assert.strictEqual(calc.memoryRecall(), 25);
});

test('Calculator Engine - Error Handling', () => {
  const calc = new Calculator();
  assert.throws(() => calc.evaluate('1 / 0'), /divide by zero/);
  assert.throws(() => calc.evaluate('sqrt(-1)'), /Square root/);
  assert.throws(() => calc.evaluate('2 + * 3'), /Invalid/);
});
