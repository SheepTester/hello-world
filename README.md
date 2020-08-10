# hello-world
Innocent first test.

I have no idea why I exist or why I'm here.

Sheep?

TestEdit

dummy edit

yet anotre

### Scraping sections from IC

2. Copypaste `ic-scrape-sections.js` into the console and then run `o = await main(3)` in the console on IC while signed in. (`3` is the max number of errors it has to encounter to stop as it increments/decrements a section ID.)

3. Do `JSON.stringify(o, null, '\t')` when it finishes, and copypaste the JSON into a file (I would recommend vim for this). The file isn't in this repo; I put it in a test folder.

4. Adjust the path in `sections-analysement.js` to point to the file with the JSON.

5. Run it. `node sections-analysement.js`

6. Run `node teacher-periods.js`.
