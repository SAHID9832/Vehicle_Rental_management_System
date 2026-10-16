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
 * Phase 1D: Stack-based arithmetic expression evaluator for rental pricing.
 * Expression: (days * dailyRate) - discount + additionalCharges
 */
function evaluateRentalCostExpression(days, dailyRate, discount = 0, additionalCharges = 0) {
  const d = parseFloat(days);
  const r = parseFloat(dailyRate);
  const disc = parseFloat(discount);
  const extra = parseFloat(additionalCharges);

  const steps = [];
  const stack = [];

  steps.push({ step: 1, action: 'PUSH days', value: d, stack: [d] });
  stack.push(d);

  steps.push({ step: 2, action: 'PUSH dailyRate', value: r, stack: [...stack, r] });
  stack.push(r);

  const subtotal = d * r;
  stack.pop();
  stack.pop();
  stack.push(subtotal);
  steps.push({ step: 3, action: 'MUL (days × dailyRate)', value: subtotal, stack: [...stack] });

  stack.push(disc);
  steps.push({ step: 4, action: 'PUSH discount', value: disc, stack: [...stack] });

  const afterDiscount = subtotal - disc;
  stack.pop();
  stack.pop();
  stack.push(afterDiscount);
  steps.push({ step: 5, action: 'SUB (subtotal - discount)', value: afterDiscount, stack: [...stack] });

  stack.push(extra);
  steps.push({ step: 6, action: 'PUSH additionalCharges', value: extra, stack: [...stack] });

  const total = afterDiscount + extra;
  stack.pop();
  stack.pop();
  stack.push(total);
  steps.push({ step: 7, action: 'ADD (afterDiscount + additionalCharges)', value: total, stack: [...stack] });

  steps.push({ step: 8, action: 'POP result', value: total, stack: [] });

  return {
    expression: `(${d} × ${r}) - ${disc} + ${extra}`,
    infix: '(days * dailyRate) - discount + additionalCharges',
    inputs: { days: d, dailyRate: r, discount: disc, additionalCharges: extra },
    result: parseFloat(Math.max(0, total).toFixed(2)),
    steps,
  };
}

module.exports = {
  StackNode,
  Stack,
  evaluateRentalCostExpression,
};
