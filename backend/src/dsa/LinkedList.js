/**
 * Phase 1A: Singly Linked List
 * Represents dynamic chaining of vehicle nodes where each node points to the next.
 */

class LinkedListNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class SinglyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  insertAtHead(data) {
    const node = new LinkedListNode(data);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head = node;
    }
    this.length++;
    return node;
  }

  insertAtTail(data) {
    const node = new LinkedListNode(data);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
    return node;
  }

  deleteByVehicleId(id) {
    if (!this.head) return false;

    if (this.head.data.id === id || this.head.data.vehicle_id === id) {
      this.head = this.head.next;
      if (!this.head) this.tail = null;
      this.length--;
      return true;
    }

    let current = this.head;
    while (current.next) {
      if (current.next.data.id === id || current.next.data.vehicle_id === id) {
        if (current.next === this.tail) {
          this.tail = current;
        }
        current.next = current.next.next;
        this.length--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  search(predicate) {
    let current = this.head;
    let index = 0;
    while (current) {
      if (predicate(current.data, index)) {
        return { node: current, index };
      }
      current = current.next;
      index++;
    }
    return null;
  }

  toArray() {
    const result = [];
    let current = this.head;
    let index = 1;
    while (current) {
      result.push({
        node_id: index,
        data: current.data,
        next: current.next ? index + 1 : null,
      });
      current = current.next;
      index++;
    }
    return result;
  }
}

module.exports = {
  LinkedListNode,
  SinglyLinkedList,
};
