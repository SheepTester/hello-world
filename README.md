# hello-world
Innocent first test.

I have no idea why I exist or why I'm here.

Sheep?

TestEdit

dummy edit

yet anotre

commit for camel

#### High school graduation year conversion table

The grades listed here are for the 2020–2021 school year.

Grade | Graduation year
----- | ---------------
 7th  | 2026
 8th  | 2025
 9th  | 2024
10th  | 2023
11th  | 2022
12th  | 2021

### Scraping sections from IC

2. Copypaste `ic-scrape-sections.js` into the console and then run `o = await main(3)` in the console on IC while signed in. (`3` is the max number of errors it has to encounter to stop as it increments/decrements a section ID.)

3. Do `JSON.stringify(o, null, '\t')` when it finishes, and copypaste the JSON into a file (I would recommend vim for this). The file isn't in this repo; I put it in a test folder.

4. Adjust the path in `sections-analysement.js` to point to the file with the JSON.

5. Run it. `node sections-analysement.js`

6. Run `node teacher-periods.js`.
