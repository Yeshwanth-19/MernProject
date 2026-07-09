import CryptoJS from 'crypto-js';

const getSecretKey = () => process.env.AES_SECRET;

export function encryptAes(value) {
  const secretKey = getSecretKey();

  if (!secretKey) {
    throw new Error('AES encryption is not configured on the server');
  }

  return CryptoJS.AES.encrypt(value, secretKey).toString();
}

export function decryptAes(encryptedValue) {
  const secretKey = getSecretKey();

  if (!secretKey) {
    throw new Error('AES decryption is not configured on the server');
  }

  const bytes = CryptoJS.AES.decrypt(encryptedValue, secretKey);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  if (!decrypted) {
    throw new Error('Failed to decrypt value');
  }

  return decrypted;
}

export function resolveEncryptedValue(value, isEncrypted) {
  if (!isEncrypted) {
    return value;
  }

  return decryptAes(value);
}

export function resolveEncryptedPassword(password, isEncrypted) {
  return resolveEncryptedValue(password, isEncrypted);
}
