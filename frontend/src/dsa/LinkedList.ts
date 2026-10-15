// ============================================================
// DSA Phase 1 - Singly Linked List
// Used for vehicle record management
// Time Complexity: Insert O(1) head, O(n) tail | Search O(n)
// Space Complexity: O(n)
// ============================================================

export interface ListNode<T> {
  data: T;
  next: ListNode<T> | null;
}

export interface LinkedListSnapshot<T> {
  nodes: Array<{ data: T; id: number }>;
  head: T | null;
  size: number;
}

export class SinglyLinkedList<T extends { id?: number | string }> {
  private head: ListNode<T> | null = null;
  private size: number = 0;

  /** Insert at the head — O(1) */
  insertAtHead(data: T): void {
    const newNode: ListNode<T> = { data, next: this.head };
    this.head = newNode;
    this.size++;
  }

  /** Insert at the tail — O(n) */
  insertAtTail(data: T): void {
    const newNode: ListNode<T> = { data, next: null };
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = newNode;
    }
    this.size++;
  }

  /** Delete by matching id field — O(n) */
  deleteById(id: number | string): boolean {
    if (!this.head) return false;

    if (this.head.data.id === id) {
      this.head = this.head.next;
      this.size--;
      return true;
    }

    let current = this.head;
    while (current.next) {
      if (current.next.data.id === id) {
        current.next = current.next.next;
        this.size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  /** Search by id — O(n), returns data and index */
  searchById(id: number | string): { found: boolean; data: T | null; index: number; comparisons: number } {
    let current = this.head;
    let index = 0;
    let comparisons = 0;
    while (current) {
      comparisons++;
      if (current.data.id === id) {
        return { found: true, data: current.data, index, comparisons };
      }
      current = current.next;
      index++;
    }
    return { found: false, data: null, index: -1, comparisons };
  }

  /** Traverse all nodes — O(n) */
  traverse(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  /** Returns a snapshot for visualization */
  getSnapshot(): LinkedListSnapshot<T> {
    return {
      nodes: this.traverse().map((d, i) => ({ data: d, id: i })),
      head: this.head ? this.head.data : null,
      size: this.size,
    };
  }

  getSize(): number { return this.size; }
  isEmpty(): boolean { return this.size === 0; }
  getHead(): T | null { return this.head ? this.head.data : null; }

  /** Build from array */
  static fromArray<T extends { id?: number | string }>(arr: T[]): SinglyLinkedList<T> {
    const list = new SinglyLinkedList<T>();
    arr.forEach(item => list.insertAtTail(item));
    return list;
  }
}
