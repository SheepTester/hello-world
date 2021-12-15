use std::collections::{HashMap, HashSet};

/// https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
fn main() {
    let map = include_str!("../../day-15-input.txt")
        .lines()
        .map(|line| {
            line.chars()
                .map(|char| char.to_digit(10).expect("I expected a digit."))
                .collect()
        })
        .collect::<Vec<Vec<_>>>();

    let mut visited = HashSet::new();
    let mut distances = HashMap::from([((0, 0), map[0][0])]);

    let mut row = 0;
    let mut column = 0;
    let lowest_risk_path = loop {
        let distance = *distances
            .get(&(row, column))
            .expect("The distance to this position should've already been calculated.");

        let mut consider_neighbour = |neighbour_row: usize, neighbour_column: usize| {
            if visited.contains(&(neighbour_row, neighbour_column)) {
                return;
            }

            let calculated_distance = distance + map[neighbour_row][neighbour_column];
            distances
                .entry((neighbour_row, neighbour_column))
                .and_modify(|distance| {
                    if calculated_distance < *distance {
                        *distance = calculated_distance;
                    }
                })
                .or_insert(calculated_distance);
        };
        if row > 0 {
            consider_neighbour(row - 1, column);
        }
        if row < map.len() - 1 {
            consider_neighbour(row + 1, column);
        }
        if column > 0 {
            consider_neighbour(row, column - 1);
        }
        if column < map[row].len() - 1 {
            consider_neighbour(row, column + 1);
        }

        if row == map.len() - 1 && column == map[row].len() - 1 {
            break distances
                .get(&(row, column))
                .expect("The distance to the destination should've already been calculated.");
        }
        visited.insert((row, column));

        let ((next_row, next_column), _) = distances
            .iter()
            .filter(|(position, _)| !visited.contains(position))
            .min_by_key(|(_, distance)| *distance)
            .expect("There are no unvisited positions.");
        row = *next_row;
        column = *next_column;
    };

    println!("{}", lowest_risk_path);
}
