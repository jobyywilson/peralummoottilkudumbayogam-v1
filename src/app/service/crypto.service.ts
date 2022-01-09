import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  keyText : string  = "hf8685nfhfhjs9h8"

  encrypt(plainText: string) {
    const key = CryptoJS.enc.Utf8.parse(this.keyText);
    const iv1 = CryptoJS.enc.Utf8.parse(this.keyText);
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
        keySize: 16,
        iv: iv1,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    return encrypted + "";
  }


  decrypt(cipher: string) {
    const key = CryptoJS.enc.Utf8.parse(this.keyText);
    const iv1 = CryptoJS.enc.Utf8.parse(this.keyText);
    const plainText = CryptoJS.AES.decrypt(cipher, key, {
        keySize: 16,
        iv: iv1,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    return plainText.toString(CryptoJS.enc.Utf8);
  }
}