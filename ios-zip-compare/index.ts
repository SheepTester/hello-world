import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import yauzl from 'yauzl';
import os from 'os';

// CLI Arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
    console.error('Usage: node index.js <path_to_zip_1> <path_to_zip_2>');
    process.exit(1);
}

const zipPath1 = args[0];
const zipPath2 = args[1];

interface Entry {
    fileName: string;
    uncompressedSize: number;
    zipfile: yauzl.ZipFile;
    entry: yauzl.Entry;
}

// Helpers
function getZipEntries(zipFilePath: string): Promise<{ entries: Entry[], zipfile: yauzl.ZipFile }> {
    return new Promise((resolve, reject) => {
        const entries: Entry[] = [];
        yauzl.open(zipFilePath, { lazyEntries: true, autoClose: false }, (err, zipfile) => {
            if (err) return reject(err);

            zipfile.on('entry', (entry: yauzl.Entry) => {
                if (/\/$/.test(entry.fileName)) {
                    // directory
                    zipfile.readEntry();
                } else {
                    entries.push({
                        fileName: entry.fileName,
                        uncompressedSize: entry.uncompressedSize,
                        zipfile,
                        entry
                    });
                    zipfile.readEntry();
                }
            });

            zipfile.on('end', () => {
                resolve({ entries, zipfile });
            });

            zipfile.readEntry();
        });
    });
}

try {
        console.log(`Parsing ${zipPath1}...`);
        const { entries: entries1, zipfile: zipfile1 } = await getZipEntries(zipPath1);
        console.log(`Parsed ${entries1.length} files from ${zipPath1}.`);

        console.log(`Parsing ${zipPath2}...`);
        const { entries: entries2, zipfile: zipfile2 } = await getZipEntries(zipPath2);
        console.log(`Parsed ${entries2.length} files from ${zipPath2}.`);

        console.log('Building size maps...');
        const sizeMap1 = new Map();
        for (const e of entries1) {
            if (!sizeMap1.has(e.uncompressedSize)) sizeMap1.set(e.uncompressedSize, []);
            sizeMap1.get(e.uncompressedSize).push(e);
        }

        const sizeMap2 = new Map();
        for (const e of entries2) {
            if (!sizeMap2.has(e.uncompressedSize)) sizeMap2.set(e.uncompressedSize, []);
            sizeMap2.get(e.uncompressedSize).push(e);
        }

        const candidateSizes = new Set();
        for (const size of sizeMap1.keys()) {
            if (sizeMap2.has(size)) candidateSizes.add(size);
        }

        console.log(`Found ${candidateSizes.size} unique file sizes present in both zips.`);
        console.log('Computing hashes for candidate files...');

        const identicalFiles: { entry1: Entry, entry2: Entry, hash: string }[] = []; // Array of { entry1, entry2 }

        for (const size of candidateSizes) {
            const group1 = sizeMap1.get(size);
            const group2 = sizeMap2.get(size);

            const hashes1 = new Map();
            for (const e of group1) {
                const h = await computeHash(e.zipfile, e.entry);
                if (!hashes1.has(h)) hashes1.set(h, []);
                hashes1.get(h).push(e);
            }

            for (const e of group2) {
                const h = await computeHash(e.zipfile, e.entry);
                if (hashes1.has(h)) {
                    // Match found
                    identicalFiles.push({
                        entry1: hashes1.get(h)[0],
                        entry2: e,
                        hash: h
                    });
                }
            }
        }

        console.log(`Found ${identicalFiles.length} identical files.`);

        console.log('Processing identical files and handling Live Photo edge cases...');
        const outDir = path.join(os.homedir(), 'storage', 'downloads', 'identical');
        fs.mkdirSync(outDir, { recursive: true });

        const ignoredFiles = new Set();
        const extractedCount = 0;

        // Process identical files to find Live Photo .mov files to ignore
        const identicalBaseNames = new Set();
        for (const pair of identicalFiles) {
            const ext = path.extname(pair.entry1.fileName).toLowerCase();
            if (ext === '.heic' || ext === '.jpg') {
                const base = path.basename(pair.entry1.fileName, path.extname(pair.entry1.fileName)).toLowerCase();
                identicalBaseNames.add(base);
            }
        }

        // Helper to check if a file is a sister .mov
        function isSisterMov(entry: yauzl.Entry) {
            const ext = path.extname(entry.fileName).toLowerCase();
            if (ext === '.mov') {
                const base = path.basename(entry.fileName, path.extname(entry.fileName)).toLowerCase();
                if (identicalBaseNames.has(base)) {
                    return true;
                }
            }
            return false;
        }

        // Mark sister .mov files as ignored
        for (const e of entries1) {
            if (isSisterMov(e.entry)) ignoredFiles.add(e.entry.fileName);
        }
        for (const e of entries2) {
            if (isSisterMov(e.entry)) ignoredFiles.add(e.entry.fileName);
        }

        let extractCount = 0;
        for (const pair of identicalFiles) {
            const fileName = path.basename(pair.entry1.fileName);
            let outPath = path.join(outDir, fileName);

            // Handle collision
            let counter = 1;
            while (fs.existsSync(outPath)) {
                const ext = path.extname(fileName);
                const base = path.basename(fileName, ext);
                outPath = path.join(outDir, `${base}_${counter}${ext}`);
                counter++;
            }

            await extractFile(pair.entry1.zipfile, pair.entry1.entry, outPath);
            extractCount++;
        }

        console.log(`Extracted ${extractCount} identical files to ${outDir}`);
        console.log(`Ignored ${ignoredFiles.size} Live Photo sister .mov files.`);

        console.log('\n--- Remaining Diff ---');
        const extractedNames1 = new Set(identicalFiles.map(p => p.entry1.fileName));
        const extractedNames2 = new Set(identicalFiles.map(p => p.entry2.fileName));

        const remaining1 = entries1.filter(e => !extractedNames1.has(e.entry.fileName) && !ignoredFiles.has(e.entry.fileName));
        const remaining2 = entries2.filter(e => !extractedNames2.has(e.entry.fileName) && !ignoredFiles.has(e.entry.fileName));

        const remainingFilesPath = path.join(process.cwd(), 'remaining-files.txt');
        const remainingLines: string[] = [];

        console.log(`Files unique to ${zipPath1} (or modified):`);
        if (remaining1.length === 0) console.log('  (None)');
        remaining1.forEach(e => {
            console.log(`  ${e.entry.fileName}`);
            remainingLines.push(`s ${e.entry.fileName} (from ${zipPath1})`);
        });

        console.log(`\nFiles unique to ${zipPath2} (or modified):`);
        if (remaining2.length === 0) console.log('  (None)');
        remaining2.forEach(e => {
            console.log(`  ${e.entry.fileName}`);
            remainingLines.push(`s ${e.entry.fileName} (from ${zipPath2})`);
        });

        if (remainingLines.length > 0) {
            fs.writeFileSync(remainingFilesPath, remainingLines.join('\n') + '\n');
            console.log(`\nWrote remaining diff to ${remainingFilesPath} for manual review.`);
        }

        console.log('\nNote: .aae files are Apple sidecar files for non-destructive edits. If they are in the remaining diff, edits may not have been exported or applied differently.');

        // Close zips
        zipfile1.close();
        zipfile2.close();
} catch (err) {
    console.error('Error:', err);
}

function extractFile(zipfile: yauzl.ZipFile, entry: yauzl.Entry, outPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);
            const writeStream = fs.createWriteStream(outPath);
            readStream.pipe(writeStream);
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
            readStream.on('error', reject);
        });
    });
}

function computeHash(zipfile: yauzl.ZipFile, entry: yauzl.Entry): Promise<string> {
    return new Promise((resolve, reject) => {
        zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);
            const hash = crypto.createHash('sha256');
            readStream.on('data', (chunk) => hash.update(chunk));
            readStream.on('end', () => resolve(hash.digest('hex')));
            readStream.on('error', reject);
        });
    });
}
