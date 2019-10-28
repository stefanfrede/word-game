function WordGame(length, wordlist) {
  this.highscore = [];
  this.randomString = this.makeRandomString(length);
  this.wordlist = wordlist;

  this.setupEventListener();
  this.populateString();
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

WordGame.prototype.makeRandomString = function makeRandomString(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  const strLength = length || 15;

  let result = '';

  for (let i = 0; i < strLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
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

    let isAccepted = true;

    for (let i = 0, { length } = chars; i < length; i++) {
      if (!~this.randomString.indexOf(chars[i])) {
        isAccepted = false;
        break;
      }
    }

    if (isAccepted) {
      this.addToHighscore(word);
    } else {
      console.error('Sorry, you used invalid characters.');
    }
  } else {
    console.error('Sorry, this is not an english word.');
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

WordGame.prototype.setupEventListener = function setupEventListener() {
  const theForm = document.querySelector('form');
  const resetBtn = document.querySelector('.js-btn-reset');
  const submitBtn = document.querySelector('.js-btn-submit');

  resetBtn.addEventListener(
    'click',
    e => {
      e.preventDefault;

      theForm.reset();
      this.randomString = this.makeRandomString(length);
      this.populateString();
    },
    false,
  );

  submitBtn.addEventListener(
    'click',
    e => {
      e.preventDefault;

      const userInput = document.getElementById('user-input').value;

      this.submitWord(userInput);
      resetBtn.click();
    },
    false,
  );
};

WordGame.prototype.populateString = function populateString() {
  document.getElementById('random-string').value = this.randomString;
};

WordGame.prototype.updateHighscore = function updateHighscore() {
  const highscore = JSON.stringify(this.highscore);

  document.getElementById('highscore').textContent = highscore;
};

async function initWordGame() {
  await WordGame.build();
}

initWordGame();
