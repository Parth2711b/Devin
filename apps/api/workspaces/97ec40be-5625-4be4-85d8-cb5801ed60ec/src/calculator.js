/**
 * Calculator Engine Module
 * Supports basic & scientific math expressions, evaluation, precision handling, angle modes, memory, and history.
 */

(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.Calculator = factory();
  }
}(this, (function () {
  'use strict';

  // Helper for floating point precision fix
  function roundPrecision(val, decimals = 12) {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
      return val;
    }
    // Fix common floating point issues (e.g. 0.1 + 0.2 = 0.30000000000000004)
    const factor = Math.pow(10, decimals);
    const rounded = Math.round((val + Number.EPSILON) * factor) / factor;
    // Remove potential negative zero
    return rounded === 0 ? 0 : rounded;
  }

  function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (!Number.isInteger(n)) return NaN; // Factorial defined for integers here
    if (n > 170) return Infinity; // Prevent overflow
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  class CalculatorEngine {
    constructor() {
      this.angleMode = 'deg'; // 'deg' or 'rad'
      this.memory = 0;
      this.history = [];
    }

    setAngleMode(mode) {
      if (mode === 'deg' || mode === 'rad') {
        this.angleMode = mode;
      }
    }

    getAngleMode() {
      return this.angleMode;
    }

    toggleAngleMode() {
      this.angleMode = this.angleMode === 'deg' ? 'rad' : 'deg';
      return this.angleMode;
    }

    // Memory operations
    memoryClear() {
      this.memory = 0;
      return this.memory;
    }

    memoryRecall() {
      return this.memory;
    }

    memoryAdd(value) {
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (!isNaN(num)) {
        this.memory += num;
      }
      return this.memory;
    }

    memorySubtract(value) {
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (!isNaN(num)) {
        this.memory -= num;
      }
      return this.memory;
    }

    memoryStore(value) {
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (!isNaN(num)) {
        this.memory = num;
      }
      return this.memory;
    }

    getHistory() {
      return [...this.history];
    }

    clearHistory() {
      this.history = [];
    }

    /**
     * Tokenizes a mathematical expression string
     */
    tokenize(expr) {
      const tokens = [];
      let i = 0;
      const str = expr.replace(/\s+/g, '');

      while (i < str.length) {
        const char = str[i];

        // Numbers (including decimals)
        if (/\d|\./.test(char)) {
          let numStr = '';
          while (i < str.length && (/\d|\./.test(str[i]))) {
            numStr += str[i];
            i++;
          }
          // Check scientific notation e.g. 1e-5
          if (i < str.length && (str[i] === 'e' || str[i] === 'E') && i + 1 < str.length && /[\d+\-]/.test(str[i+1])) {
            numStr += str[i];
            i++;
            if (str[i] === '+' || str[i] === '-') {
              numStr += str[i];
              i++;
            }
            while (i < str.length && /\d/.test(str[i])) {
              numStr += str[i];
              i++;
            }
          }
          tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
          continue;
        }

        // Identifier / Functions / Constants
        if (/[a-zA-Zπ]/.test(char)) {
          let nameStr = '';
          while (i < str.length && /[a-zA-Z0-9π]/.test(str[i])) {
            nameStr += str[i];
            i++;
          }
          const lower = nameStr.toLowerCase();
          if (lower === 'pi' || nameStr === 'π') {
            tokens.push({ type: 'NUMBER', value: Math.PI });
          } else if (lower === 'e') {
            tokens.push({ type: 'NUMBER', value: Math.E });
          } else {
            tokens.push({ type: 'FUNCTION', value: lower });
          }
          continue;
        }

        // Operators & Punctuation
        if ('+-*/%^()!'.includes(char)) {
          // Normalize multiplication / division if unicode symbols used
          let op = char;
          if (op === '×') op = '*';
          if (op === '÷') op = '/';
          tokens.push({ type: 'OPERATOR', value: op });
          i++;
          continue;
        }

        // Unicode multiplication / division
        if (char === '×') {
          tokens.push({ type: 'OPERATOR', value: '*' });
          i++;
          continue;
        }
        if (char === '÷') {
          tokens.push({ type: 'OPERATOR', value: '/' });
          i++;
          continue;
        }

        throw new Error(`Invalid character: ${char}`);
      }

      return tokens;
    }

    /**
     * Evaluates math expression string
     */
    evaluate(expression) {
      if (!expression || expression.trim() === '') {
        return 0;
      }

      try {
        const tokens = this.tokenize(expression);
        const processedTokens = this.preprocessTokens(tokens);
        const postfix = this.shuntingYard(processedTokens);
        const result = this.evaluatePostfix(postfix);

        if (typeof result !== 'number' || isNaN(result)) {
          throw new Error('Invalid calculation');
        }

        const roundedResult = roundPrecision(result);

        // Record history
        this.history.unshift({
          expression: expression,
          result: roundedResult,
          timestamp: new Date()
        });
        if (this.history.length > 50) {
          this.history.pop();
        }

        return roundedResult;
      } catch (err) {
        throw new Error(err.message || 'Error');
      }
    }

    /**
     * Handles implicit multiplication and unary signs
     */
    preprocessTokens(tokens) {
      const result = [];

      for (let i = 0; i < tokens.length; i++) {
        const prev = result[result.length - 1];
        const curr = tokens[i];

        // Handle unary + / -
        if (curr.type === 'OPERATOR' && (curr.value === '+' || curr.value === '-')) {
          const isUnary = !prev || 
            (prev.type === 'OPERATOR' && prev.value !== ')' && prev.value !== '!') || 
            prev.type === 'FUNCTION';

          if (isUnary) {
            if (curr.value === '-') {
              result.push({ type: 'UNARY_MINUS', value: 'neg' });
            }
            // Skip unary plus
            continue;
          }
        }

        // Handle implicit multiplication (e.g. 2(3), 2pi, (2)(3), 2sin(30))
        if (prev) {
          const prevIsVal = prev.type === 'NUMBER' || (prev.type === 'OPERATOR' && (prev.value === ')' || prev.value === '!'));
          const currIsVal = curr.type === 'NUMBER' || curr.type === 'FUNCTION' || (curr.type === 'OPERATOR' && curr.value === '(');

          if (prevIsVal && currIsVal) {
            result.push({ type: 'OPERATOR', value: '*' });
          }
        }

        result.push(curr);
      }

      return result;
    }

    /**
     * Shunting-yard algorithm to convert infix tokens to postfix (RPN)
     */
    shuntingYard(tokens) {
      const outputQueue = [];
      const operatorStack = [];

      const precedence = {
        '+': 2,
        '-': 2,
        '*': 3,
        '/': 3,
        '%': 3,
        '^': 4,
        'neg': 5,
        '!': 6
      };

      const associativity = {
        '+': 'Left',
        '-': 'Left',
        '*': 'Left',
        '/': 'Left',
        '%': 'Left',
        '^': 'Right',
        'neg': 'Right',
        '!': 'Left'
      };

      for (let token of tokens) {
        if (token.type === 'NUMBER') {
          outputQueue.push(token);
        } else if (token.type === 'FUNCTION') {
          operatorStack.push(token);
        } else if (token.type === 'UNARY_MINUS') {
          operatorStack.push(token);
        } else if (token.type === 'OPERATOR') {
          const op = token.value;

          if (op === '(') {
            operatorStack.push(token);
          } else if (op === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].value !== '(') {
              outputQueue.push(operatorStack.pop());
            }
            if (operatorStack.length === 0) {
              throw new Error('Mismatched parentheses');
            }
            operatorStack.pop(); // Pop '('

            // If function is on top of stack, pop it into output queue
            if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
              outputQueue.push(operatorStack.pop());
            }
          } else {
            // Operator
            while (operatorStack.length > 0) {
              const top = operatorStack[operatorStack.length - 1];
              if (top.value === '(') break;

              const topPrec = precedence[top.value] || 0;
              const currPrec = precedence[op] || 0;

              if (
                (associativity[op] === 'Left' && currPrec <= topPrec) ||
                (associativity[op] === 'Right' && currPrec < topPrec)
              ) {
                outputQueue.push(operatorStack.pop());
              } else {
                break;
              }
            }
            operatorStack.push(token);
          }
        }
      }

      while (operatorStack.length > 0) {
        const top = operatorStack.pop();
        if (top.value === '(' || top.value === ')') {
          throw new Error('Mismatched parentheses');
        }
        outputQueue.push(top);
      }

      return outputQueue;
    }

    /**
     * Evaluates RPN (Postfix) tokens
     */
    evaluatePostfix(postfix) {
      const stack = [];

      for (let token of postfix) {
        if (token.type === 'NUMBER') {
          stack.push(token.value);
        } else if (token.type === 'UNARY_MINUS') {
          if (stack.length < 1) throw new Error('Invalid expression');
          const val = stack.pop();
          stack.push(-val);
        } else if (token.type === 'OPERATOR') {
          const op = token.value;

          if (op === '!') {
            if (stack.length < 1) throw new Error('Invalid expression');
            const a = stack.pop();
            const res = factorial(a);
            if (isNaN(res)) throw new Error('Invalid factorial operand');
            stack.push(res);
            continue;
          }

          if (stack.length < 2) throw new Error('Invalid expression');
          const b = stack.pop();
          const a = stack.pop();

          let res;
          switch (op) {
            case '+': res = a + b; break;
            case '-': res = a - b; break;
            case '*': res = a * b; break;
            case '/':
              if (b === 0) throw new Error('Cannot divide by zero');
              res = a / b;
              break;
            case '%': res = a % b; break;
            case '^': res = Math.pow(a, b); break;
            default: throw new Error(`Unknown operator ${op}`);
          }
          stack.push(res);
        } else if (token.type === 'FUNCTION') {
          if (stack.length < 1) throw new Error('Invalid function arguments');
          const arg = stack.pop();
          const fn = token.value;
          let res;

          const toRad = (angle) => this.angleMode === 'deg' ? (angle * Math.PI) / 180 : angle;
          const fromRad = (rad) => this.angleMode === 'deg' ? (rad * 180) / Math.PI : rad;

          switch (fn) {
            case 'sin':
              res = Math.sin(toRad(arg));
              // Clean up floating point artifacts like sin(180 deg) = 0
              if (Math.abs(res) < 1e-15) res = 0;
              break;
            case 'cos':
              res = Math.cos(toRad(arg));
              if (Math.abs(res) < 1e-15) res = 0;
              break;
            case 'tan':
              const cosVal = Math.cos(toRad(arg));
              if (Math.abs(cosVal) < 1e-15) throw new Error('Tangent undefined');
              res = Math.tan(toRad(arg));
              break;
            case 'asin':
              if (arg < -1 || arg > 1) throw new Error('Domain error for asin');
              res = fromRad(Math.asin(arg));
              break;
            case 'acos':
              if (arg < -1 || arg > 1) throw new Error('Domain error for acos');
              res = fromRad(Math.acos(arg));
              break;
            case 'atan':
              res = fromRad(Math.atan(arg));
              break;
            case 'sqrt':
              if (arg < 0) throw new Error('Square root of negative number');
              res = Math.sqrt(arg);
              break;
            case 'cbrt':
              res = Math.cbrt(arg);
              break;
            case 'log':
              if (arg <= 0) throw new Error('Logarithm of non-positive number');
              res = Math.log10(arg);
              break;
            case 'ln':
              if (arg <= 0) throw new Error('Natural log of non-positive number');
              res = Math.log(arg);
              break;
            case 'abs':
              res = Math.abs(arg);
              break;
            case 'fact':
              res = factorial(arg);
              if (isNaN(res)) throw new Error('Invalid factorial operand');
              break;
            default:
              throw new Error(`Unknown function ${fn}`);
          }

          stack.push(res);
        }
      }

      if (stack.length !== 1) {
        throw new Error('Invalid expression format');
      }

      return stack[0];
    }
  }

  CalculatorEngine.roundPrecision = roundPrecision;
  CalculatorEngine.factorial = factorial;

  return CalculatorEngine;
})));
