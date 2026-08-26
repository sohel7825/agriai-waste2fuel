/**
 * Small persistent store for the SIH prototype.
 *
 * Farm and collection records are persisted as JSON so a server restart no
 * longer wipes registrations. DATA_DIR can be changed for a writable volume
 * on a hosting provider. This is intentionally dependency-free; a managed
 * database can replace this service later without changing the API contract.
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, '../data/runtime');

const SOURCE_FILES = {
  farms: path.join(__dirname, '../data/farms.json'),
  collections: path.join(__dirname, '../data/collections.json')
};

const RUNTIME_FILES = {
  farms: path.join(DATA_DIR, 'farms.json'),
  collections: path.join(DATA_DIR, 'collections.json')
};

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  for (const key of Object.keys(RUNTIME_FILES)) {
    if (!fs.existsSync(RUNTIME_FILES[key])) {
      const seed = JSON.parse(fs.readFileSync(SOURCE_FILES[key], 'utf8'));
      fs.writeFileSync(RUNTIME_FILES[key], JSON.stringify(seed, null, 2));
    }
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function read(key) {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(RUNTIME_FILES[key], 'utf8'));
  } catch (error) {
    console.error(`Data store read failed for ${key}:`, error.message);
    const seed = JSON.parse(fs.readFileSync(SOURCE_FILES[key], 'utf8'));
    write(key, seed);
    return seed;
  }
}

function write(key, value) {
  ensureStore();
  const tempFile = `${RUNTIME_FILES[key]}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(value, null, 2));
  fs.renameSync(tempFile, RUNTIME_FILES[key]);
  return clone(value);
}

function reset(key) {
  const seed = JSON.parse(fs.readFileSync(SOURCE_FILES[key], 'utf8'));
  write(key, seed);
  return clone(seed);
}

module.exports = { read, write, reset, DATA_DIR };
