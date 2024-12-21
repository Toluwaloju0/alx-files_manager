export default function stringDecoder(string) {
  // Change the string to base 64
  const decoded = Buffer.from(string, 'base64').toString().split(':');
  return decoded;
}
