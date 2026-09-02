#!/usr/bin/env node
/**
 * AgriAI photo dataset auditor.
 *
 * Usage:
 *   npm install sharp
 *   node dataset/scripts/photo_dataset_audit.js
 *
 * Scans dataset/images/raw/<class>/ and writes
 * dataset/metadata/photo_audit_report.csv.
 *
 * This script checks file format, readability, dimensions, SHA256,
 * exact duplicates, class folders and class counts. It does NOT prove
 * licensing, provenance, label correctness, consent, or near-duplicate
 * leakage; those require human/source review.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.error('Missing dependency: sharp');
  console.error('Run: npm install sharp');
  process.exit(2);
}

const ROOT = path.resolve(__dirname, '..', 'images', 'raw');
const REPORT = path.resolve(__dirname, '..', 'metadata', 'photo_audit_report.csv');
const MIN_WIDTH = 640;
const MIN_HEIGHT = 480;
const MIN_IMAGES = 100;
const PREFERRED_IMAGES = 150;
const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const CLASSES = [
  'rice_straw','rice_husk','rice_bran','maize_stalk','maize_cob',
  'sugarcane_bagasse','sugarcane_trash','cotton_stalk','cotton_waste',
  'chilli_stem','groundnut_shell','groundnut_haulm','banana_pseudostem',
  'banana_leaf','tobacco_stalk','pulse_residue','soybean_residue',
  'sunflower_residue','turmeric_residue','mango_waste','coconut_husk',
  'coconut_shell','vegetable_residue','unknown_other'
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function csvEscape(value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

async function audit() {
  const rows = [];
  const counts = Object.fromEntries(CLASSES.map(c => [c, 0]));
  const hashes = new Map();
  let errors = 0;
  let exactDuplicates = 0;

  if (!fs.existsSync(ROOT)) {
    console.error(`Dataset directory does not exist: ${ROOT}`);
    process.exit(1);
  }

  const files = walk(ROOT).filter(f => !path.basename(f).startsWith('.'));

  for (const file of files) {
    const rel = path.relative(path.resolve(__dirname, '..', '..'), file).replaceAll(path.sep, '/');
    const ext = path.extname(file).toLowerCase();
    const parts = path.relative(ROOT, file).split(path.sep);
    const label = parts.length > 1 ? parts[0] : '';
    const result = {
      file: rel,
      label,
      extension: ext,
      width: '',
      height: '',
      sha256: '',
      status: 'PASS',
      reason: ''
    };

    if (!CLASSES.includes(label)) {
      result.status = 'FAIL';
      result.reason = 'UNREGISTERED_CLASS_FOLDER';
      errors++;
    } else if (!ALLOWED.has(ext)) {
      result.status = 'FAIL';
      result.reason = 'UNSUPPORTED_FORMAT';
      errors++;
    } else {
      try {
        const meta = await sharp(file, { failOn: 'error' }).metadata();
        result.width = meta.width || '';
        result.height = meta.height || '';
        if (!result.width || !result.height || result.width < MIN_WIDTH || result.height < MIN_HEIGHT) {
          result.status = 'FAIL';
          result.reason = 'LOW_RESOLUTION';
          errors++;
        }
        result.sha256 = sha256(file);
        if (hashes.has(result.sha256)) {
          result.status = 'FAIL';
          result.reason = `EXACT_DUPLICATE_OF:${hashes.get(result.sha256)}`;
          exactDuplicates++;
          errors++;
        } else {
          hashes.set(result.sha256, rel);
        }
        if (result.status === 'PASS') counts[label]++;
      } catch (e) {
        result.status = 'FAIL';
        result.reason = 'CORRUPT_OR_UNREADABLE_IMAGE';
        errors++;
      }
    }
    rows.push(result);
  }

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  const header = ['file','label','extension','width','height','sha256','status','reason'];
  const lines = [header.join(',')];
  for (const row of rows) lines.push(header.map(k => csvEscape(row[k])).join(','));
  fs.writeFileSync(REPORT, lines.join('\n') + '\n', 'utf8');

  console.log('\nAgriAI Photo Dataset Audit');
  console.log('===========================');
  console.log(`Root: ${ROOT}`);
  console.log(`Files scanned: ${files.length}`);
  console.log(`Exact duplicates: ${exactDuplicates}`);
  console.log(`Technical errors: ${errors}`);
  console.log('');

  for (const label of CLASSES) {
    const n = counts[label];
    const status = n >= PREFERRED_IMAGES ? 'READY_PREFERRED' : n >= MIN_IMAGES ? 'READY_MINIMUM' : 'NEEDS_PHOTOS';
    console.log(`${label.padEnd(24)} ${String(n).padStart(4)}  ${status}`);
  }

  console.log(`\nReport: ${REPORT}`);
  console.log('\nNOTE: A PASS here means technical checks passed only. Human review is still required for provenance, license, label quality, mixed waste, consent and near-duplicate/session leakage.');

  const allPreferred = CLASSES.every(c => counts[c] >= PREFERRED_IMAGES);
  const allMinimum = CLASSES.every(c => counts[c] >= MIN_IMAGES);
  if (errors > 0) process.exitCode = 1;
  else if (!allMinimum) process.exitCode = 3;
  else if (!allPreferred) process.exitCode = 4;
  else process.exitCode = 0;
}

audit().catch(err => {
  console.error(err);
  process.exit(1);
});
