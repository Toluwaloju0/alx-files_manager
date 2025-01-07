import sha1 from 'sha1';

export default function hashPassword(password) {
  return sha1(password);
}
