import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  key : string  = "hf8685345fhjs9h8"

  encrypt(data: any) {
    var encryptedText = '';
    for (var i = 0; i < data.length; i++) {
        var plainChar = data[i];
        var keyChar = this.key[i % this.key.length]; // Repeats key if it's shorter than plaintext
        var encryptedChar = String.fromCharCode((plainChar.charCodeAt(0) + keyChar.charCodeAt(0)) % 256);
        encryptedText += encryptedChar;
    }
    return encryptedText;
}

  decrypt(data: string) {
    var decryptedText = '';
    for (var i = 0; i < data.length; i++) {
        var encryptedChar = data[i];
        var keyChar = this.key[i % this.key.length]; // Repeats key if it's shorter than encryptedText
        var decryptedChar = String.fromCharCode((encryptedChar.charCodeAt(0) - keyChar.charCodeAt(0) + 256) % 256);
        decryptedText += decryptedChar;
    }
    return decryptedText;
}
decryptAndParse(data: string){
  return JSON.parse(this.decrypt(data).replace(/[\x00-\x1F\x7F-\x9F]/g, ''))
}

}