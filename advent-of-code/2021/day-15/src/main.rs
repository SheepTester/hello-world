use std::collections::{HashMap, HashSet};

const PART_1: bool = false;

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
    let get_risk = |row: usize, column: usize| {
        if PART_1 {
            map[row][column]
        } else {
            (map[row % map.len()][column % map[0].len()]
                + (row / map.len()) as u32
                + (column / map[0].len()) as u32
                - 1)
                % 9
                + 1
        }
    };

    let mut visited = HashSet::new();
    let mut distances = HashMap::from([((0, 0), 0)]);

    let end_row = if PART_1 {
        map.len() - 1
    } else {
        map.len() * 5 - 1
    };
    let end_column = if PART_1 {
        map[0].len() - 1
    } else {
        map[0].len() * 5 - 1
    };

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

            let calculated_distance = distance + get_risk(neighbour_row, neighbour_column);
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
        if row < end_row {
            consider_neighbour(row + 1, column);
        }
        if column > 0 {
            consider_neighbour(row, column - 1);
        }
        if column < end_column {
            consider_neighbour(row, column + 1);
        }

        if row == end_row && column == end_column {
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
