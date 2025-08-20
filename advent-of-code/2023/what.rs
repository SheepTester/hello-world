
use std::io;


fn getint() -> i64{
    let mut w = String::new();
   io::stdin()
    .read_line(&mut w)
    .expect("Failed to read line");
    w.trim().parse().expect("Input")
}

fn main(){
let wow = getint();
let mut he:Vec<(i64,i64)> = 
    (0..wow).map(|i| (i,getint())).collect();
//let hell= vec![];
 he.sort_by_key(|e| -e.1);
let mut fac:i64= 1;
let mut i:i64 = 0;
let mut res : Vec<(i64,i64)>=vec![];
while let Some(next) = he
    .pop() {
while i < next.1 {
i+=1;
    fac=(fac.checked_mul(i).expect(format!("overflpw {}*{}", fac, i).as_str()))% 998244353;
    }
res.push((next.0,fac));
    }
res.sort_by_key(|e| e.0);
for (_, ahh) in res {
    println!("{}", ahh);
}
}
