import crypto from 'crypto';

export default function hashPassword(password) {
  const hasher = crypto.createHash('sha1');
  hasher.update(password);
  return hasher.digest('hex');
}
