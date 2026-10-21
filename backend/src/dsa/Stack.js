/**
 * Phase 1B: Stack (LIFO) & Phase 1D: Stack-Based Expression Evaluator
 * Used for tracking recent rental operations and calculating rental pricing via Shunting-Yard / Postfix.
 */

class StackNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class Stack {
  constructor() {
    this.top = null;
    this.size = 0;
  }

  push(value) {
    const node = new StackNode(value);
    node.next = this.top;
    this.top = node;
    this.size++;
    return this.size;
  }

  pop() {
    if (this.isEmpty()) return null;
    const popped = this.top.value;
    this.top = this.top.next;
    this.size--;
    return popped;
  }

  peek() {
    return this.top ? this.top.value : null;
  }

  isEmpty() {
    return this.size === 0;
  }

  toArray() {
    const items = [];
    let current = this.top;
    let index = 0;
    while (current) {
      items.push({
        position: index,
        is_top: index === 0,
        value: current.value,
      });
      current = current.next;
      index++;
    }
    return items;
  }
}

/**
 * Phase 1D: Shunting-Yard algorithm (Infix to Postfix)
 */
function infixToPostfix(infix) {
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const output = [];
  const opStack = [];

  const tokens = infix.split(' ').filter((t) => t.trim());
  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      output.push(token);
    } else if (token === '(') {
      opStack.push(token);
    } else if (token === ')') {
      while (opStack.length && opStack[opStack.length - 1] !== '(') {
        output.push(opStack.pop());
      }
      opStack.pop(); // remove '('
    } else if (precedence[token]) {
      while (
        opStack.length &&
        opStack[opStack.length - 1] !== '(' &&
        precedence[opStack[opStack.length - 1]] >= precedence[token]
      ) {
        output.push(opStack.pop());
      }
      opStack.push(token);
    }
  }
  while (opStack.length) output.push(opStack.pop());
  return output.join(' ');
}

/**
 * Phase 1D: Stack-based arithmetic expression evaluator for rental pricing.
 * Expression: (days * dailyRate) - discount + additionalCharges
 */
function evaluateRentalCostExpression(days, dailyRate, discount = 0, additionalCharges = 0) {
  const d = parseFloat(days);
  const r = parseFloat(dailyRate);
  const disc = parseFloat(discount);
  const extra = parseFloat(additionalCharges);

  const infix = `${d} * ${r} - ${disc} + ${extra}`;
  const postfix = infixToPostfix(infix);

  const stack = new Stack();
  const steps = [];
  const tokens = postfix.split(' ').filter((t) => t.trim());

  tokens.forEach((token, index) => {
    if (!isNaN(Number(token))) {
      const num = Number(token);
      stack.push(num);
      steps.push({
        step: index + 1,
        token,
        action: `PUSH ${token} onto stack`,
        stack: stack.toArray().map((s) => s.value).reverse(),
      });
    } else {
      const b = stack.pop();
      const a = stack.pop();
      let resVal = 0;
      switch (token) {
        case '+': resVal = a + b; break;
        case '-': resVal = a - b; break;
        case '*': resVal = a * b; break;
        case '/': resVal = b !== 0 ? a / b : 0; break;
        default: resVal = 0;
      }
      stack.push(resVal);
      steps.push({
        step: index + 1,
        token,
        action: `POP ${b} and ${a}, compute ${a} ${token} ${b} = ${resVal}, PUSH ${resVal}`,
        stack: stack.toArray().map((s) => s.value).reverse(),
        result: resVal,
      });
    }
  });

  const finalTotal = stack.peek() !== null ? stack.pop() : 0;
  const result = parseFloat(Math.max(0, finalTotal).toFixed(2));

  return {
    expression: infix,
    infix: '(days * dailyRate) - discount + additionalCharges',
    postfix,
    inputs: { days: d, dailyRate: r, discount: disc, additionalCharges: extra },
    breakdown: {
      days: d,
      dailyRate: r,
      subtotal: d * r,
      discount: disc,
      additionalCharges: extra,
      total: result,
    },
    result,
    steps,
  };
}

module.exports = {
  StackNode,
  Stack,
  infixToPostfix,
  evaluateRentalCostExpression,
};

