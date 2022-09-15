struct Solution;

impl Solution {
    fn square(n: i32) -> i32 {
        n * n
    }

    pub fn count_points(points: Vec<Vec<i32>>, queries: Vec<Vec<i32>>) -> Vec<i32> {
        let points: Vec<(i32, i32)> = points.iter().map(|p| (p[0], p[1])).collect();
        queries
            .iter()
            .map(|p| {
                let (x, y, radius) = (p[0], p[1], p[2]);
                let r2 = Solution::square(radius);
                points
                    .iter()
                    .filter(|(px, py)| Solution::square(px - x) + Solution::square(py - y) <= r2)
                    .count() as i32
            })
            .collect()
    }
}

fn main() {
    println!(
        "{:?}",
        Solution::count_points(
            vec![vec![1, 3], vec![3, 3], vec![5, 3], vec![2, 2]],
            vec![vec![2, 3, 1], vec![4, 3, 1], vec![1, 1, 2]]
        )
    );
    println!(
        "{:?}",
        Solution::count_points(
            vec![vec![1, 1], vec![2, 2], vec![3, 3], vec![4, 4], vec![5, 5]],
            vec![vec![1, 2, 2], vec![2, 2, 2], vec![4, 3, 2], vec![4, 3, 3]]
        )
    );
}
