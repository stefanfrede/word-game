function WordGame(length, wordlist) {
  this.highscore = [];
  this.randomString = void 0;
  this.wordlist = wordlist;

  this.validStyles = [
    'shadow',
    'appearance-none',
    'border',
    'rounded',
    'w-full',
    'py-2',
    'px-3',
    'text-gray-700',
    'leading-tight',
    'focus:outline-none',
    'focus:shadow-outline',
  ];

  this.errorStyles = [
    'shadow',
    'appearance-none',
    'border',
    'border-red-500',
    'rounded',
    'w-full',
    'py-2',
    'px-3',
    'text-gray-700',
    'mb-3',
    'leading-tight',
    'focus:outline-none',
    'focus:shadow-outline',
  ];

  this.generateRandomString();
  this.setupEventListeners();
  this.populateBaseString();
}

WordGame.build = async function build(length) {
  const file = './wordlist.txt';

  const wordlist = await WordGame.readWordlist(file);
  const wordlistArr = wordlist.split('\n');

  return new WordGame(length, wordlistArr.filter(Boolean));
};

WordGame.readWordlist = function readWordlist(file) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState > 3 && xhr.status === 200) {
        resolve(xhr.responseText);
      }
    };

    xhr.onerror = function xhrFailure() {
      console.error(this.statusText);
    };

    xhr.open('GET', file, true);
    xhr.send(null);
  });
};

WordGame.prototype.generateRandomString = function generateRandomString(
  length,
) {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  const strLength = length || 15;

  let result = '';

  for (let i = 0; i < strLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  this.randomString = result;
};

WordGame.prototype.submitWord = async function submitWord(word) {
  /**
   * Submit a word on behalf of a player. A word is accepted if its letters are
   * contained in the base string used to construct the game AND if it is in the
   * word list provided: wordlist.txt.
   *
   * If the word is accepted and its score is high enough, the submission should
   * be added to the high score list. If there are multiple submissions with the
   * same score, all are accepted, BUT the first submission with that score
   * should rank higher.
   *
   * A word can only appear ONCE in the high score list. If the word is already
   * present in the high score list the submission should be rejected.
   *
   * @parameter word. The player's submission to the game. All submissions may
   *                  be assumed to be lowercase and contain no whitespace or
   *                  special characters.
   */

  const isProvided = !!~this.wordlist.indexOf(word);

  if (isProvided) {
    const chars = word.split('');
    const resetBtn = document.querySelector('.js-btn-reset');

    let isAccepted = true;

    for (let i = 0, { length } = chars; i < length; i++) {
      if (!~this.randomString.indexOf(chars[i])) {
        isAccepted = false;
        break;
      }
    }

    if (isAccepted) {
      this.addToHighscore(word);
      resetBtn.click();
    } else {
      this.showError('Sorry, you used invalid characters.');
    }
  } else {
    this.showError('Sorry, this is not an english word.');
  }
};

WordGame.prototype.addToHighscore = function addToHighscore(word) {
  const score = word.length;
  const timestamp = new Date().getTime();

  const highscore = JSON.parse(JSON.stringify(this.highscore));

  const isDoublet = !!~this.highscore.findIndex(item => item.word === word);

  if (isDoublet) {
    return;
  }

  highscore.push({
    word,
    timestamp,
    score,
  });

  highscore.sort((a, b) => {
    let num;

    if (a.score === b.score) {
      num = a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0;
    } else {
      num = a.score > b.score ? -1 : 1;
    }

    return num;
  });

  this.highscore = highscore.length > 10 ? highscore.slice(0, 10) : highscore;

  this.updateHighscore();
};

WordGame.prototype.getWordEntryAtPosition = function getWordEntryAtPosition(
  position,
) {
  /**
   *  Return word entry at given position in the high score list, 0 being the
   *  highest (best score) and 9 the lowest. You may assume that this method
   *  will never be called with position > 9.
   *
   *  @parameter position Index position in high score list @return the word
   *                      entry at the given position in the high score list, or
   *                      null if there is no entry at the position requested
   */
  return this.highscore[position].word;
};

WordGame.prototype.getScoreAtPosition = function getScoreAtPosition(position) {
  /**
   * Return the score at the given position in the high score list, 0 being the
   * highest (best score) and 9 the lowest. You may assume that this method will
   * never be called with position > 9.
   *
   * @parameter position Index position in high score list
   * @return the score at the given position in the high score list, or null if
   *   there is no entry at the position requested
   */
  return this.highscore[position] ? this.highscore[position].score : 0;
};

WordGame.prototype.setupEventListeners = function setupEventListeners() {
  const form = document.getElementById('form');
  const resetBtn = document.querySelector('.js-btn-reset');

  form.addEventListener(
    'submit',
    function(evt) {
      evt.preventDefault();

      this.submitWord(evt.target['user-input'].value);
    }.bind(this),
    false,
  );

  resetBtn.addEventListener(
    'click',
    function(evt) {
      evt.preventDefault();

      form.reset();

      this.hideError();
      this.generateRandomString();
      this.populateBaseString();
      this.focusInputField();
    }.bind(this),
    false,
  );
};

WordGame.prototype.focusInputField = function focusInputField() {
  const input = document.getElementById('user-input');
  input.focus();
};

WordGame.prototype.populateBaseString = function populateBaseString() {
  const input = document.getElementById('base-string');
  input.value = this.randomString;
};

WordGame.prototype.showError = function showError(msg) {
  const input = document.getElementById('user-input');
  input.setAttribute('class', '');
  input.classList.add(...this.errorStyles);
  const p = document.querySelector('#user-input + p');
  p.textContent = msg;
  p.removeAttribute('hidden');
};

WordGame.prototype.hideError = function hideError() {
  const input = document.getElementById('user-input');
  input.setAttribute('class', '');
  input.classList.add(...this.validStyles);
  const p = document.querySelector('#user-input + p');
  p.setAttribute('hidden', '');
  p.textContent = '';
};

WordGame.prototype.updateHighscore = function updateHighscore() {
  const table = document.getElementById('highscore');
  const tbody = document.getElementById('highscoreBody');
  tbody.innerHTML = '';

  this.highscore.forEach((item, index) => {
    const tr = document.createElement('tr');

    const tdPos = document.createElement('td');
    tdPos.classList.add('border', 'px-4', 'py-2');
    const tdWrd = document.createElement('td');
    tdWrd.classList.add('border', 'px-4', 'py-2');
    const tdScr = document.createElement('td');
    tdScr.classList.add('border', 'px-4', 'py-2');

    const posCnt = document.createTextNode(index + 1);
    const wrdCnt = document.createTextNode(item.word);
    const scrCnt = document.createTextNode(item.score);

    tdPos.appendChild(posCnt);
    tdWrd.appendChild(wrdCnt);
    tdScr.appendChild(scrCnt);

    tr.appendChild(tdPos);
    tr.appendChild(tdWrd);
    tr.appendChild(tdScr);

    tbody.appendChild(tr);
  });

  table.removeAttribute('hidden');
};

async function initWordGame() {
  await WordGame.build();
}

initWordGame();
