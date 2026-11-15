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

  decrypt(data: string, key: string = this.key) {
    var decryptedText = '';
    for (var i = 0; i < data.length; i++) {
        var encryptedChar = data[i];
        var keyChar = key[i % key.length]; // Repeats key if shorter than the encrypted text
        var decryptedChar = String.fromCharCode((encryptedChar.charCodeAt(0) - keyChar.charCodeAt(0) + 256) % 256);
        decryptedText += decryptedChar;
    }
    return decryptedText;
}
decryptAndParse(data: string){
  if (typeof data !== 'string' || !data.length) {
    throw new Error('The family data response is missing.');
  }
  // Read the former API default during a rolling frontend/function deployment.
  for (const key of [this.key, 'hf8685345fhjs9h']) {
    try {
      return JSON.parse(this.decrypt(data, key));
    } catch {
      // Try only the known legacy key; do not repair or silently alter invalid JSON.
    }
  }
  throw new Error('Unable to decode family data. Check that the API and browser response keys match.');
}

}