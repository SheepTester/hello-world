fn main() {
    println!(
        "{:?}",
        Solution::find_original_array(vec![1, 3, 4, 2, 6, 8])
    );
    println!("{:?}", Solution::find_original_array(vec![4, 4]));
    println!("{:?}", Solution::find_original_array(vec![4, 8, 8, 4]));
    println!(
        "{:?}",
        Solution::find_original_array(vec![1, 2, 3, 2, 4, 6, 2, 4, 6, 4, 8, 12])
    );
}

struct Solution;

impl Solution {
    pub fn find_original_array(mut changed: Vec<i32>) -> Vec<i32> {
        if changed.len() % 2 != 0 {
            return vec![];
        }
        // let original = Vec::with_capacity(changed.len() / 2);
        // ok so say there's [1, 2, 2, 4]
        // my idea would make it [1, 1, 2]. hmmm
        // could go from largest to smallest?
        // sort: [4, 2, 2, 1]
        // delete 4 / 2 in [2, 2, 1] -> [2, 1]
        // delete 2 / 2 in [1] -> []
        // if it can't delete then bad
        // this contains the halved even numbers that are in the list
        changed.sort();
        let mut highest = changed.len() - 1;
        'wah: for i in (0..changed.len()).rev() {
            // the largest half of the array is the doubled or some insane
            // undoubled
            // [1, 2, 2, 3, 4, 6]
            // [1, 2, 2,-1, 4, 3]
            // [1, 2,-1,-1, 2, 3]
            // there will only be doubled numbers between -1s, I think
            if changed[i] == -1 {
                // if lowest_unhalved == 0 {
                //     // println!("{:?}, {}", changed, i);
                //     break;
                // }
                // changed.swap(lowest_unhalved - 1, i);
                continue;
            }
            if changed[i] % 2 != 0 {
                // println!("is odd {:?}", changed);
                return vec![];
            }
            changed[i] /= 2;
            let last = changed[i];
            for j in (0..i).rev() {
                if changed[j] == last {
                    // swap
                    // changed.swap(j, i);
                    // lowest_unhalved = j;
                    changed[j] = -1;
                    if i != highest {
                        changed.swap(highest, i);
                    }
                    highest -= 1;
                    continue 'wah;
                }
            }
            // could not find odd num
            // println!("couldn't find {:?}, {}  {}", changed, last, i);
            return vec![];
        }
        // while let Some(last) = changed.last() {
        //     if last % 2 == 0 {
        //         match changed.indexof {
        //             Some(_) => original.append(last / 2),
        //             None => return vec![],
        //         }
        //     } else {
        //         // there was no larger number that was double this large odd
        //         // number
        //         return vec![];
        //     }
        // }
        changed[changed.len() / 2..].to_vec()
    }
}
