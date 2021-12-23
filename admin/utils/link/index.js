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

// console.log(reverseList({v: 1, next: {v: 2, next: {v: 3, next: {v: 4, next: null}}}}))

// 判断是否为回文链表
function isPalindrome(head) {
  if (!head) return true
  let fast = head, slow = head, temp, pre = null, next // 记录当前slow的前一个及后一个节点
  while (true) {
    if (!(fast = fast.next)) { // 链表长度为奇数
      fast = next
      slow = pre
      break
    }
    // 反转此时slow的前一个节点-->  slow.next = pre，不能反转slow的下一个节点（下一轮要用slow.next）
    temp = slow.next // 下一轮的slow
    next = temp.next // 下一轮的next
    slow.next = pre
    pre = slow
    slow = temp
    if (!(fast = fast.next)) { // 偶数
      fast = slow
      slow = pre
      break
    }
  }
  while (fast) {
    if (slow.val !== fast.val) return false
    slow = slow.next
    fast = fast.next
  }
  return true
}

// console.log(isPalindrome({val: 1, next: {val: 2, next: {val: 3, next: {val: 2, next: {val: 1}}}}}))
// console.log(isPalindrome({val: 1, next: {val: 2, next: {val: 2, next: {val: 1}}}}))
