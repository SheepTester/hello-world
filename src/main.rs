struct Solution;

impl Solution {
    /// You have `n` dice and each die has `k` faces numbered from 1 to `k`.
    ///
    /// Given three integers `n`, `k`, and `target`, return the number of
    /// possible ways (out of the `k`^`n` total ways) to roll the dice so the
    /// sum of the face-up numbers equals target. Since the answer may be too
    /// large, return it **modulo** 10^9 + 7.
    pub fn num_rolls_to_target(n: i32, k: i32, target: i32) -> i32 {
        if n * k < target || target < n {
            return 0;
        }
        if n <= 1 {
            return if k <= target { 1 } else { 0 };
        }
        let mut count = 0;
        for i in 1..=k {
            count += Solution::num_rolls_to_target(n - 1, k, target - i);
        }
        count
    }
}

fn main() {
    println!("{:?} = 1", Solution::num_rolls_to_target(1, 6, 3));
    println!("{:?} = 6", Solution::num_rolls_to_target(2, 6, 7));
    println!(
        "{:?} = 222616187",
        Solution::num_rolls_to_target(30, 30, 500)
    );
}
