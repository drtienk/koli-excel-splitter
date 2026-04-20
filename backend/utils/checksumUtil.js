import crypto from 'crypto';

export function calculateChecksum(data) {
  const jsonStr = JSON.stringify(data);
  return crypto.createHash('sha256').update(jsonStr).digest('hex');
}

export function calculateFileChecksum(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function verifyChecksum(data, checksum) {
  return calculateChecksum(data) === checksum;
}
