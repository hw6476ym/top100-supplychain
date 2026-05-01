#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.resolve(process.cwd(), 'data');
const maxAgeDays = Number(process.env.MAX_DATA_AGE_DAYS || '45');
const now = new Date();

if (!fs.existsSync(dataDir)) {
  console.error(`Data directory not found: ${dataDir}`);
  process.exit(1);
}

const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json')).sort();
if (files.length === 0) {
  console.error('No JSON files found in data/.');
  process.exit(1);
}

const errors = [];
const checksums = [];

function ageInDays(isoDate) {
  const then = new Date(`${isoDate}T00:00:00Z`);
  return (now - then) / (1000 * 60 * 60 * 24);
}

for (const file of files) {
  const fullPath = path.join(dataDir, file);
  const raw = fs.readFileSync(fullPath, 'utf8');

  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  checksums.push(`${hash}  ${path.posix.join('data', file)}`);

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    errors.push(`${file}: invalid JSON (${e.message})`);
    continue;
  }

  if (!Array.isArray(parsed)) {
    errors.push(`${file}: expected top-level array`);
    continue;
  }

  parsed.forEach((record, idx) => {
    const rec = `${file}[${idx}]`;
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      errors.push(`${rec}: expected object record`);
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(record, 'provenance') || !record.provenance) {
      errors.push(`${rec}: missing required field "provenance"`);
    }

    if (!Object.prototype.hasOwnProperty.call(record, 'confidence')) {
      errors.push(`${rec}: missing required field "confidence"`);
    } else if (typeof record.confidence !== 'number' || record.confidence < 0 || record.confidence > 100) {
      errors.push(`${rec}: "confidence" must be a number from 0 to 100`);
    }

    if (!record.as_of_date) {
      errors.push(`${rec}: missing required field "as_of_date"`);
    } else {
      const match = /^\d{4}-\d{2}-\d{2}$/.test(record.as_of_date);
      if (!match) {
        errors.push(`${rec}: "as_of_date" must be YYYY-MM-DD`);
      } else {
        const age = ageInDays(record.as_of_date);
        if (Number.isNaN(age)) {
          errors.push(`${rec}: invalid "as_of_date" value`);
        } else if (age > maxAgeDays) {
          errors.push(`${rec}: stale as_of_date ${record.as_of_date} (> ${maxAgeDays} days old)`);
        }
      }
    }
  });
}

const checksumPath = path.join(dataDir, 'checksums.sha256');
fs.writeFileSync(checksumPath, `${checksums.join('\n')}\n`, 'utf8');
console.log(`Wrote ${checksumPath}`);

if (errors.length > 0) {
  console.error('\nData validation failed:');
  errors.forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}

console.log(`Validated ${files.length} JSON file(s). MAX_DATA_AGE_DAYS=${maxAgeDays}`);
