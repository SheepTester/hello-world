# hello-world

![imao](./test/hello-gamers.svg)

Innocent first test.

I have no idea why I exist or why I'm here.

Sheep?

TestEdit

dummy edit

yet anotre

commit for camel

#### High school graduation year conversion table

The grades listed here are for the 2020–2021 school year.

| Grade | Graduation year |
| ----- | --------------- |
| 7th   | 2026            |
| 8th   | 2025            |
| 9th   | 2024            |
| 10th  | 2023            |
| 11th  | 2022            |
| 12th  | 2021            |

### Scraping sections from IC

2. Copypaste `ic-scrape-sections.js` into the console and then run `o = await main(3)` in the console on IC while signed in. (`3` is the max number of errors it has to encounter to stop as it increments/decrements a section ID.)

3. Do `JSON.stringify(o, null, '\t')` when it finishes, and copypaste the JSON into a file (I would recommend vim for this). The file isn't in this repo; I put it in a test folder.

4. Adjust the path in `sections-analysement.js` to point to the file with the JSON.

5. Run it. `node sections-analysement.js`

6. Run `node teacher-periods.js`.

## [creating diagrams](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams)

Here is a simple flow chart:

$$
\DeclareMathOperator{\half}{half}
\DeclareMathOperator{\Div}{div}
\DeclareMathOperator{\Mod}{mod}
\DeclareMathOperator{\base}{base}
\begin{align*}
  \Div'          & : \mathbb{N} \times \mathbb{N} \times \mathbb{Z}^+ \to \mathbb{N}    \\
  \Div'(q, n, d) & = \begin{cases}
                       \Div'(q + 1, n - d, d) & \text{if } n \ge d \\
                       q                      & \text{otherwise}
                     \end{cases} \\
  \\
  \Div           & : \mathbb{N} \times \mathbb{Z}^+ \to
  \mathbb{N}                                                           \\
  \Div(n, d)     & = \Div'(0, n, d) \\
  \\
  \Mod       & : \mathbb{N} \times \mathbb{Z}^+ \to
  \mathbb{N}                                   \\
  \Mod(n, d) & = n - d \cdot \Div(n, d) \\
  \\
  \base'          & : E_b' \times \mathbb{N} \times B \to E_b           \\
  \base'(a, q, b) & = \begin{cases}
                        \base'(\Mod(q, b) \circ a, \Div(q, b), b) &
                        \text{if } q \neq 0                         \\
                        a                                         &
                        \text{otherwise}
                      \end{cases} \\
  \\
  \base           & : \mathbb{N} \times B \to E_b                       \\
  \base(n, b)     & = \begin{cases}
                        0                     & \text{if } n = 0 \\
                        \base'(\lambda, n, b) & \text{otherwise}
                      \end{cases}
\end{align*}
$$

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

```geojson
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 1,
      "properties": {
        "ID": 0
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-90, 35],
            [-90, 30],
            [-85, 30],
            [-85, 35],
            [-90, 35]
          ]
        ]
      }
    }
  ]
}
```

```topojson
{
  "type": "Topology",
  "transform": {
    "scale": [0.0005000500050005, 0.00010001000100010001],
    "translate": [100, 0]
  },
  "objects": {
    "example": {
      "type": "GeometryCollection",
      "geometries": [
        {
          "type": "Point",
          "properties": { "prop0": "value0" },
          "coordinates": [4000, 5000]
        },
        {
          "type": "LineString",
          "properties": { "prop0": "value0", "prop1": 0 },
          "arcs": [0]
        },
        {
          "type": "Polygon",
          "properties": { "prop0": "value0", "prop1": { "this": "that" } },
          "arcs": [[1]]
        }
      ]
    }
  },
  "arcs": [
    [
      [4000, 0],
      [1999, 9999],
      [2000, -9999],
      [2000, 9999]
    ],
    [
      [0, 0],
      [0, 9999],
      [2000, 0],
      [0, -9999],
      [-2000, 0]
    ]
  ]
}
```

```stl
solid cube_corner
  facet normal 0.0 -1.0 0.0
    outer loop
      vertex 0.0 0.0 0.0
      vertex 1.0 0.0 0.0
      vertex 0.0 0.0 1.0
    endloop
  endfacet
  facet normal 0.0 0.0 -1.0
    outer loop
      vertex 0.0 0.0 0.0
      vertex 0.0 1.0 0.0
      vertex 1.0 0.0 0.0
    endloop
  endfacet
  facet normal -1.0 0.0 0.0
    outer loop
      vertex 0.0 0.0 0.0
      vertex 0.0 0.0 1.0
      vertex 0.0 1.0 0.0
    endloop
  endfacet
  facet normal 0.577 0.577 0.577
    outer loop
      vertex 1.0 0.0 0.0
      vertex 0.0 1.0 0.0
      vertex 0.0 0.0 1.0
    endloop
  endfacet
endsolid
```
