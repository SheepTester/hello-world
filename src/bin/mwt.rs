//! Based on Niema's Python implementation

use std::{collections::HashMap, io::Read, mem::size_of_val};

#[derive(Debug, Default)]
struct Node {
    chars: HashMap<char, Node>,
    is_word: bool,
}

struct Mwt {
    root: Node,
}

impl Mwt {
    pub fn new() -> Mwt {
        Mwt {
            root: Node::default(),
        }
    }

    pub fn insert(&mut self, s: &str) {
        let mut curr = &mut self.root;
        for c in s.chars() {
            curr = curr.chars.entry(c).or_insert_with(|| Node::default());
        }
        curr.is_word = true;
    }

    pub fn size(&self) -> usize {
        let mut total = 0;
        let mut to_visit = vec![&self.root];
        while let Some(curr) = to_visit.pop() {
            total += size_of_val(curr);
            to_visit.extend(curr.chars.values());
        }
        total
    }
}

fn main() {
    // https://stackoverflow.com/a/45623133
    let mut res =
        reqwest::blocking::get("https://github.com/dwyl/english-words/raw/master/words.txt")
            .unwrap();
    println!("i have obtained the words");
    let mut body = String::new();
    res.read_to_string(&mut body).unwrap();
    let words = body.trim().split('\n');
    println!("the words have been nicely diced up");

    let mut mwt = Mwt::new();
    for word in words {
        mwt.insert(word)
    }
    println!("Size: {}", mwt.size());
}
