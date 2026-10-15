// ============================================================
// DSA Phase 1C - Queue using Linked List
// Used for customer waiting queue (FIFO)
// Time Complexity: Enqueue O(1) | Dequeue O(1) | Peek O(1)
// Space Complexity: O(n)
// ============================================================

interface QueueNode<T> {
  data: T;
  next: QueueNode<T> | null;
}

export interface QueueSnapshot<T> {
  items: T[];       // front is items[0]
  front: T | null;
  rear: T | null;
  size: number;
}

export class Queue<T> {
  private front: QueueNode<T> | null = null;
  private rear: QueueNode<T> | null = null;
  private size: number = 0;

  /** Enqueue at rear — O(1) */
  enqueue(data: T): void {
    const newNode: QueueNode<T> = { data, next: null };
    if (!this.rear) {
      this.front = this.rear = newNode;
    } else {
      this.rear.next = newNode;
      this.rear = newNode;
    }
    this.size++;
  }

  /** Dequeue from front — O(1) */
  dequeue(): T | null {
    if (!this.front) return null;
    const data = this.front.data;
    this.front = this.front.next;
    if (!this.front) this.rear = null;
    this.size--;
    return data;
  }

  /** Peek at front without removing — O(1) */
  peekFront(): T | null {
    return this.front ? this.front.data : null;
  }

  /** Peek at rear — O(1) */
  peekRear(): T | null {
    return this.rear ? this.rear.data : null;
  }

  /** Display all elements front to rear — O(n) */
  display(): T[] {
    const result: T[] = [];
    let current = this.front;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  getSize(): number { return this.size; }
  isEmpty(): boolean { return this.size === 0; }

  getSnapshot(): QueueSnapshot<T> {
    return {
      items: this.display(),
      front: this.peekFront(),
      rear: this.peekRear(),
      size: this.size,
    };
  }
}
