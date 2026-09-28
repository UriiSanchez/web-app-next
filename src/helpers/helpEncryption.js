import CryptoJS from 'crypto-js';

const secretKey = process.env.NEXTAUTH_SECRET;

export const encrypt = (words) => {
   return CryptoJS.AES.encrypt(words, secretKey).toString();
};

export const decrypt = (encryptText) => {
   const bytes = CryptoJS.AES.decrypt(encryptText, secretKey);
   return bytes.toString(CryptoJS.enc.Utf8);
};

export const encryptOnlyFront = (text) => {
   return 'Exf8/jk' + btoa(text);
};

export const decryptOnlyFront = (encryptText) => {
   return atob(encryptText.substring(7));
};
