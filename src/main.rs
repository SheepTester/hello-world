// Definition for a binary tree node.
#[derive(Debug, PartialEq, Eq)]
pub struct TreeNode {
    pub val: i32,
    pub left: Option<Rc<RefCell<TreeNode>>>,
    pub right: Option<Rc<RefCell<TreeNode>>>,
}

impl TreeNode {
    #[inline]
    pub fn new(val: i32) -> Self {
        TreeNode {
            val,
            left: None,
            right: None,
        }
    }

    pub fn from(
        val: i32,
        left: Option<Rc<RefCell<TreeNode>>>,
        right: Option<Rc<RefCell<TreeNode>>>,
    ) -> Option<Rc<RefCell<Self>>> {
        Some(Rc::new(RefCell::new(TreeNode { val, left, right })))
    }
}
struct Solution;

use std::cell::RefCell;
use std::collections::VecDeque;
use std::rc::Rc;
impl Solution {
    // fn min_depth_x(root: &TreeNode, depth: i32, smaller: i32) -> i32 {
    //     if root.left.is_none() && root.right.is_none() {
    //         return depth;
    //     }
    //     let left_min_depth = if let Some(left) = root.left {
    //         Solution::min_depth_x(root.left, depth + 1, smaller)
    //     } else {

    //     }
    // }
    pub fn min_depth(root: Option<Rc<RefCell<TreeNode>>>) -> i32 {
        let mut queue: VecDeque<(i32, Rc<RefCell<TreeNode>>)> = VecDeque::from([(
            1,
            if let Some(w) = root {
                w
            } else {
                return 0;
            },
        )]);
        // find first node with no children
        while let Some((depth, node)) = queue.pop_front() {
            let lol = node.borrow();
            if lol.left.is_none() && lol.right.is_none() {
                return depth;
            }
            if let Some(a) = lol.left.clone() {
                queue.push_back((depth + 1, a));
            }
            if let Some(a) = lol.right.clone() {
                queue.push_back((depth + 1, a));
            }
        }
        panic!("i dont think this should happen lmao")
    }
}

fn main() {
    println!(
        "{:?}",
        Solution::min_depth(TreeNode::from(
            3,
            TreeNode::from(9, None, None),
            TreeNode::from(
                20,
                TreeNode::from(15, None, None),
                TreeNode::from(7, None, None)
            )
        ))
    );
    println!(
        "{:?}",
        Solution::min_depth(TreeNode::from(
            2,
            None,
            TreeNode::from(
                3,
                None,
                TreeNode::from(
                    4,
                    None,
                    TreeNode::from(5, None, TreeNode::from(6, None, None))
                )
            )
        ))
    );
}
