//! Based on Niema's Python implementation

use std::{
    collections::{HashMap, VecDeque},
    io::Read,
    mem::size_of,
    time::Instant,
};

#[derive(Debug, Default)]
struct Node {
    chars: HashMap<char, Node>,
    is_word: bool,
}

#[derive(Debug, Default)]
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
            curr = curr.chars.entry(c).or_default();
        }
        curr.is_word = true;
    }

    pub fn size(&self, all_nodes: bool) -> usize {
        let mut total = 0;
        let mut to_visit = VecDeque::from([&self.root]);
        while let Some(curr) = to_visit.pop_back() {
            // Approximate
            total += size_of::<Node>()
                + curr.chars.capacity() * (size_of::<char>() + size_of::<&Node>());
            if all_nodes {
                to_visit.extend(curr.chars.values());
            }
        }
        total
    }
}

fn main() -> reqwest::Result<()> {
    // https://stackoverflow.com/a/45623133
    let mut res =
        reqwest::blocking::get("https://github.com/dwyl/english-words/raw/master/words.txt")?;
    println!("i have obtained the words");
    let mut body = String::new();
    res.read_to_string(&mut body).unwrap();
    let words = body.trim().split('\n');
    println!("the words have been nicely diced up");

    // https://stackoverflow.com/a/40953863
    let start = Instant::now();
    let mut mwt = Mwt::new();
    for word in words {
        mwt.insert(word)
    }
    let elapsed = start.elapsed();
    println!("Build time: {elapsed:.2?}");
    println!("Size: {} bytes", mwt.size(true));
    println!("Size of root: {} bytes", mwt.size(false));

    Ok(())
}
