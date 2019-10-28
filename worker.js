import * as Comlink from 'https://unpkg.com/comlink?module';

function readWordlist() {
  return new Promise(resolve => {
    const file = './wordlist.txt';
    const rawFile = new XMLHttpRequest();

    rawFile.open('GET', file, false);
    rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
          const allText = rawFile.responseText;

          resolve(allText);
        }
      }
    };

    rawFile.send(null);
  });
}

const state = {
  async foo() {
    return await readWordlist();
  },
};

Comlink.expose(state);
