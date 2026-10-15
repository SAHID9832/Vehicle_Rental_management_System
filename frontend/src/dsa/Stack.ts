// ============================================================
// DSA Phase 1 - Stack using Linked List
// Used for recent rental/return operations (LIFO)
// Time Complexity: Push O(1) | Pop O(1) | Peek O(1)
// Space Complexity: O(n)
// ============================================================

interface StackNode<T> {
  data: T;
  next: StackNode<T> | null;
}

export interface StackSnapshot<T> {
  items: T[];       // top is items[0]
  top: T | null;
  size: number;
}

export class Stack<T> {
  private top: StackNode<T> | null = null;
  private size: number = 0;

  /** Push onto stack top — O(1) */
  push(data: T): void {
    const newNode: StackNode<T> = { data, next: this.top };
    this.top = newNode;
    this.size++;
  }

  /** Pop from stack top — O(1) */
  pop(): T | null {
    if (!this.top) return null;
    const data = this.top.data;
    this.top = this.top.next;
    this.size--;
    return data;
  }

  /** Peek at top without removing — O(1) */
  peek(): T | null {
    return this.top ? this.top.data : null;
  }

  /** Display all elements from top to bottom — O(n) */
  display(): T[] {
    const result: T[] = [];
    let current = this.top;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  getSize(): number { return this.size; }
  isEmpty(): boolean { return this.size === 0; }

  getSnapshot(): StackSnapshot<T> {
    return {
      items: this.display(),
      top: this.peek(),
      size: this.size,
    };
  }
}

// ============================================================
// DSA Phase 1D - Stack-Based Rental Cost Expression Evaluator
// Evaluates postfix expressions for rental cost calculation
// Example: "3 2000 * 200 - 500 +" => computes using stack
// Time Complexity: O(n) where n is tokens
// ============================================================

export interface EvalStep {
  token: string;
  action: string;
  stackState: number[];
  result?: number;
}

export interface ExpressionResult {
  expression: string;
  postfix: string;
  steps: EvalStep[];
  result: number;
  breakdown: {
    days: number;
    dailyRate: number;
    subtotal: number;
    discount: number;
    additionalCharges: number;
    total: number;
  };
}

/** Convert infix to postfix using shunting-yard algorithm */
function infixToPostfix(infix: string): string {
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const output: string[] = [];
  const opStack: string[] = [];

  const tokens = infix.split(' ').filter(t => t.trim());
  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      output.push(token);
    } else if (token === '(') {
      opStack.push(token);
    } else if (token === ')') {
      while (opStack.length && opStack[opStack.length - 1] !== '(') {
        output.push(opStack.pop()!);
      }
      opStack.pop(); // remove '('
    } else if (precedence[token]) {
      while (
        opStack.length &&
        opStack[opStack.length - 1] !== '(' &&
        precedence[opStack[opStack.length - 1]] >= precedence[token]
      ) {
        output.push(opStack.pop()!);
      }
      opStack.push(token);
    }
  }
  while (opStack.length) output.push(opStack.pop()!);
  return output.join(' ');
}

/** Evaluate postfix expression step by step using a stack */
function evaluatePostfix(postfix: string): { result: number; steps: EvalStep[] } {
  const stack: number[] = [];
  const steps: EvalStep[] = [];
  const tokens = postfix.split(' ').filter(t => t.trim());

  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      stack.push(Number(token));
      steps.push({
        token,
        action: `Push ${token} onto stack`,
        stackState: [...stack],
      });
    } else {
      const b = stack.pop()!;
      const a = stack.pop()!;
      let result: number;
      switch (token) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': result = a / b; break;
        default: result = 0;
      }
      stack.push(result);
      steps.push({
        token,
        action: `Pop ${b} and ${a}, compute ${a} ${token} ${b} = ${result}, push ${result}`,
        stackState: [...stack],
        result,
      });
    }
  }
  return { result: stack[0] || 0, steps };
}

/**
 * Main evaluator for rental cost
 * Formula: total = (days * dailyRate) - discount + additionalCharges
 * Infix: "days * dailyRate - discount + additionalCharges"
 */
export function evaluateRentalCost(
  days: number,
  dailyRate: number,
  discount: number = 0,
  additionalCharges: number = 0
): ExpressionResult {
  const infix = `${days} * ${dailyRate} - ${discount} + ${additionalCharges}`;
  const postfix = infixToPostfix(infix);
  const { result, steps } = evaluatePostfix(postfix);

  return {
    expression: infix,
    postfix,
    steps,
    result,
    breakdown: {
      days,
      dailyRate,
      subtotal: days * dailyRate,
      discount,
      additionalCharges,
      total: result,
    },
  };
}
