use std::io::{stdin, Read};

mod bits_parser {
    struct BitsParser {
        version_sum: u64,
        bits: Box<dyn Iterator<Item = bool>>,
    }

    impl BitsParser {
        fn next_bits(&mut self, count: usize) -> u64 {
            let mut value = 0;
            for bit in self.bits.take(count) {
                value <<= 1;
                if bit {
                    value |= 1;
                }
            }
            value
        }

        fn eval_next_packet(&mut self) {
            //
        }
    }

    impl<CharIter> From<CharIter> for BitsParser
    where
        CharIter: Iterator<Item = char>,
    {
        fn from(string: CharIter) -> Self {
            BitsParser {
                version_sum: 0,
                bits: Box::new(string.filter_map(|digit| digit.to_digit(16)).flat_map(
                    |number: u32| {
                        return [
                            number & 0b1000 != 0,
                            number & 0b100 != 0,
                            number & 0b10 != 0,
                            number & 0b1 != 0,
                        ];
                    },
                )),
            }
        }
    }
}

fn main() {
    let mut input = String::new();
    stdin()
        .lock()
        .read_to_string(&mut input)
        .expect("Couldn't read stdin to string.");
}
