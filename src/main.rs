use std::collections::HashMap;

struct AuthenticationManager {
    time_to_live: i32,
    map: HashMap<String, i32>,
}

/**
 * `&self` means the method takes an immutable reference.
 * If you need a mutable reference, change it to `&mut self` instead.
 */
impl AuthenticationManager {
    fn new(time_to_live: i32) -> Self {
        Self {
            time_to_live,
            map: HashMap::new(),
        }
    }

    fn generate(&mut self, token_id: String, current_time: i32) {
        self.map.insert(token_id, current_time + self.time_to_live);
    }

    fn renew(&mut self, token_id: String, current_time: i32) {
        let egg = self.time_to_live;
        self.map.entry(token_id).and_modify(|e| {
            if *e > current_time {
                *e = current_time + egg;
            }
        });
    }

    fn count_unexpired_tokens(&mut self, current_time: i32) -> i32 {
        self.map.retain(|_, v| *v > current_time);
        self.map.len() as i32
    }
}

fn main() {
    // let obj = AuthenticationManager::new(timeToLive);
    // obj.generate(tokenId, currentTime);
    // obj.renew(tokenId, currentTime);
    // let ret_3: i32 = obj.count_unexpired_tokens(currentTime);
    let mut obj = AuthenticationManager::new(5); // Constructs the AuthenticationManager with timeToLive = 5 seconds.
    obj.renew("aaa".to_string(), 1); // No token exists with tokenId "aaa" at time 1, so nothing happens.
    obj.generate("aaa".to_string(), 2); // Generates a new token with tokenId "aaa" at time 2.
    println!("{}", obj.count_unexpired_tokens(6)); // The token with tokenId "aaa" is the only unexpired one at time 6, so return 1.
    obj.generate("bbb".to_string(), 7); // Generates a new token with tokenId "bbb" at time 7.
    obj.renew("aaa".to_string(), 8); // The token with tokenId "aaa" expired at time 7, and 8 >= 7, so at time 8 the renew request is ignored, and nothing happens.
    obj.renew("bbb".to_string(), 10); // The token with tokenId "bbb" is unexpired at time 10, so the renew request is fulfilled and now the token will expire at time 15.
    println!("{}", obj.count_unexpired_tokens(15)); // The token with tokenId "bbb" expires at time 15, and the token with tokenId "aaa" expired at time 7, so currently no token is unexpired, so return 0.
}
