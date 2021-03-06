[slicedlime/examples](https://github.com/slicedlime/examples) has a vanilla\_worldgen.zip file that makes it hard to see differences between versions.

This aims to unzip it and recreate the commit history.

To start, run in this directory,

```sh
./init
```

Afterwards, and whenever there's a new update, do

```sh
./unzip-history
```

I've done this and pushed the result to [SheepTester/vanilla-worldgen](https://github.com/SheepTester/vanilla-worldgen).

---

I did not get prior permission to republish the zipped file on [slicedlime/examples](https://github.com/slicedlime/examples) and will take down that repository when asked.

---

For the [caves-and-cliffs branch](https://github.com/SheepTester/vanilla-worldgen/tree/caves-and-cliffs),

```sh
cd vanilla_worldgen
git checkout caves-and-cliffs
../url-unzip https://launcher.mojang.com/v1/objects/.../CavesAndCliffsPreview.zip
git commit -m "..."
```
