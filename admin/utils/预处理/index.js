// 输入一个整型数组，数组中的一个或连续多个整数组成一个子数组。求所有子数组的和的最大值。
function maxSubArray(nums) {
  // 计算每个以i位置结尾的符合要求的最大值，这里情况特殊直接复用了原数组，使额外空间复杂度为O(1)
  let max = nums[0]
  for (let i = 1, l = nums.length; i < l; i++) {
    let num = nums[i]
    if (nums[i - 1] > 0) nums[i] = nums[i - 1] + num
    else nums[i] = num
    max = Math.max(max, nums[i])
  }
  return max
}

maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])
