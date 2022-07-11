import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  keyText : string  = "hf8685345fhjs9h8"

  encrypt(data: any) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.keyText).toString();
  }


  decrypt(data: string) {
    try {
      let decryptData;
      const bytes = CryptoJS.AES.decrypt(data, this.keyText);
      if (bytes.toString()) {
        decryptData =  JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
      return decryptData;
    } catch (e) {
      console.log(e);
    }
  }
}