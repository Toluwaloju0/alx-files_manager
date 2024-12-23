const decoder = {
  stringDecoder(string) {
    // Change the string to base 64
    const decoded = Buffer.from(string, 'base64').toString().split(':');
    return decoded;
  },

  dataDecoder(string) {
    return Buffer.from(string, 'base64').toString();
  },
}

export default decoder;
