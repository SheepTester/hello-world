
use std::io;


fn getint() -> i32{
    let mut w = String::new();
   io::stdin()
    .read_line(&mut w)
    .expect("Failed to read line");
    w.trim().parse().expect("Input")
}

fn main(){
let wow = getint();
let mut he:Vec<(i32,i32)> = 
    (0..wow).map(|i| (i,getint())).collect();
//let hell= vec![];
 he.sort_by_key(|e| -e.1);
let mut fac = 1;
let mut i = 0;
let mut res : Vec<(i32,i32)>=vec![];
while let Some(next) = he
    .pop() {
while i < next.1 {
i+=1;
    fac=fac*i% 998244353;
    }
res.push((next.0,fac));
    }
res.sort_by_key(|e| e.0);
for (_, ahh) in res {
    println!("{}", ahh);
}
}
