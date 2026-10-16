/**
 * Phase 1C: Queue (FIFO)
 * Manages customer waiting lists for high-demand or unavailable vehicle categories.
 * First in, first served.
 */

class QueueNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class Queue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.size = 0;
  }

  enqueue(value) {
    const node = new QueueNode(value);
    if (!this.rear) {
      this.front = node;
      this.rear = node;
    } else {
      this.rear.next = node;
      this.rear = node;
    }
    this.size++;
    return this.size;
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const dequeued = this.front.value;
    this.front = this.front.next;
    if (!this.front) this.rear = null;
    this.size--;
    return dequeued;
  }

  peek() {
    return this.front ? this.front.value : null;
  }

  isEmpty() {
    return this.size === 0;
  }

  toArray() {
    const items = [];
    let current = this.front;
    let index = 1;
    while (current) {
      items.push({
        position: index,
        is_front: index === 1,
        value: current.value,
      });
      current = current.next;
      index++;
    }
    return items;
  }
}

module.exports = {
  QueueNode,
  Queue,
};
