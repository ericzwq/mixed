// 反转单链表
function reverseList(head) {
  let pre = null, next
  while (head) {
    next = head.next
    head.next = pre
    pre = head
    head = next
  }
  return pre
}

console.log(reverseList({v: 1, next: {v: 2, next: {v: 3, next: {v: 4, next: null}}}}))
