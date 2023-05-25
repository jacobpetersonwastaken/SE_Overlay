import {gameLoop} from '../helpers/gameLoop.js';
import {
  ADMIN_USERS,
  JOIN_COMMANDS,
  ENABLED_FEATURES,
} from '../helpers/consts.js';
import {
  showCounter, 
  hideCounter, 
  flashCounter, 
  getDeleteCounterByNickname,
  speak,
  updateVoice,
} from '../helpers/utils.js';
import {getUsers} from '../helpers/fetch.js';
import {
  initDeleteCounterData, 
  saveUserDeletionCounters, 
  removeUserDeletionCounter
} from '../helpers/deleteCounters.js';
import {runLottery} from '../helpers/lottery.js';
import {updateHypeTrain} from '../helpers/updateHypeTrain.js';
import {
  blacklistWords
} from '../helpers/blackListWords.js'
import {
  gptGeneration
} from '../helpers/gptGenerate.js'
const lotteryCount = document.getElementById('lottery_players_count');
const filter_word = 'beep'
const username = document.getElementById('tts_username');
const user_message = document.getElementById('tts_message');
export const handleMessageEvent = async (event, sessionData) => {
  const {userId, msgId, text, tags, displayName} = event.data;
  
  if(!sessionData.users[userId]) {
    const users = await getUsers(sessionData, [userId], []);
    if(users?.length) {
      const [user] = users;
      sessionData.users[userId] = user;
    }
  }

  const counter = sessionData.deleteCounters[userId];
  if(counter) {
    counter.messageIds[msgId] = true;
  }
  const lowerMessage = text.trim().toLowerCase();
  if(
    ENABLED_FEATURES.tts &&
    sessionData.tts.isEnabled && 
    tags && 
    tags['custom-reward-id'] && 
    sessionData.tts.eventIds.includes(tags['custom-reward-id'])
  ) {
    let index = sessionData.tts.eventIds.indexOf(event.data.tags["custom-reward-id"]);
    if (index !== -1) {
      const textStyle = sessionData.tts.eventTitles[index].trim().toLowerCase();
      username.innerHTML = displayName;
      if (textStyle.includes('normal')) { 
        user_message.innerHTML = cleanText(text.slice(0, 100));
        speak(cleanText(text.slice(0, 100)));
        return;
      }
      gptGeneration(textStyle,text)
      .then(result => {
        user_message.innerHTML = result;
        speak(result);
    })
      .catch(error => console.error(error)); 
  } 
  } 
  
  if(
    ENABLED_FEATURES.chat_lottery &&
    sessionData.lottery.isOpen && 
    JOIN_COMMANDS.includes(lowerMessage)
  ) {
    sessionData.lottery.users.add(userId);
    lotteryCount.innerHTML = sessionData.lottery.users.size
  } 
  if(ADMIN_USERS.includes(userId)) {
    handleAdminMessage(text, sessionData);
  }

  if(
    ENABLED_FEATURES.tts &&
    sessionData.tts.isEnabled && 
    tags && 
    tags['custom-reward-id'] && 
    sessionData.tts.eventIds.includes(tags['custom-reward-id'])
  ) {
    speak(sessionData, text);
  } 
}

/*
ADMIN WIDGET COMMANDS
---------------
** HYPE TRAIN **

choo choo
- forces a hype train to run 

------------------------
** DELETION COUNTERS **

show [USER] coutner
hide [USER] coutner
flash [USER] coutner

makedeletecounter [USERNAME] [NICKNAMES]
- adds a counter that tracks the number of messages of theirs that have been deleted

removedeletecounter [USERNAME]
- removes a counter that was tracking a given user, if there was one.

-------------------------
** USER SELECT LOTTERY **

!runLottery [WINNERS_COUNT]
- open user lottery and give the numbers of users to select

!play
- user types this command to join the lottery pool
- open to all users in chat while a lotto is open

*/


const cleanText = (message, replacementWord = filter_word) => {
  let cleanedMessage = message;
  blacklistWords.forEach((word) => {
      let regex = new RegExp(word.replace(/\s+/g, ''), 'gi');
      cleanedMessage = cleanedMessage.replace(regex, replacementWord);
      regex = new RegExp(word.replace(/\s/g, '\\s*'), 'gi');
      cleanedMessage = cleanedMessage.replace(regex, replacementWord);
  });
  return cleanedMessage;
};

const handleAdminMessage = (message, sessionData) => {
  const [firstWord, secondWord] = message.trim().split(' ');

  switch(firstWord) {
    case('!chooChoo'):
      ENABLED_FEATURES.hype_train && updateHypeTrain(sessionData, true);
      break;
    case('!showDeleteCounter'):
      ENABLED_FEATURES.delete_counter && handleShowDeleteCounter(sessionData, message);
      break;
    case('!hideDeleteCounter'):
      ENABLED_FEATURES.delete_counter && handleHideDeleteCounter(sessionData, message);
      break;
    case('!flashDeleteCounter'):
      ENABLED_FEATURES.delete_counter && handleFlashDeleteCounter(sessionData, message);
      break;
    case('!makeDeleteCounter'):
      ENABLED_FEATURES.delete_counter && handleMakeDeleteCounter(sessionData, message);
      break;
    case('!removeDeleteCounter'):
      ENABLED_FEATURES.delete_counter && handleRemoveDeleteCounter(sessionData, message);
      break;
    case('!runLottery'):
      ENABLED_FEATURES.chat_lottery && handleRunLottery(sessionData, message);
      break;
    case('!enableTts'):
      ENABLED_FEATURES.tts && setTtsEnabled(sessionData, true);
    case('!disableTts'):
      ENABLED_FEATURES.tts && setTtsEnabled(sessionData, false);
    case('!updateVoice'):
      ENABLED_FEATURES.tts && updateVoice(sessionData, secondWord);
    case('!skiptts'):
      ENABLED_FEATURES.tts && handleSkipTts();
    default:
      break;
  }
};

const handleSkipTts = () => {
  if(speechSynthesis?.speaking) {
    speechSynthesis.cancel();
  }
};

const setTtsEnabled = (sessionData, enabled) => {
  sessionData.tts.isEnabled = enabled;
};

const handleRunLottery = (sessionData, message) => {
  const [firstWord, secondWord] = message.trim().split(' ');
  const secondWordNumber = Number(secondWord);
  const seconds = (
    secondWordNumber && !isNaN(secondWordNumber) ? 
    secondWordNumber : 
    60
  );
  runLottery(sessionData, seconds);
};

const handleDeleteCounterLookup = (sessionData, message) => {
  const messageFragments = message.trim().split(' ');
  if(messageFragments.length !== 2) {
    return;
  }

  const [command, nickname] = messageFragments;
  return getDeleteCounterByNickname(sessionData, nickname);
};

const handleShowDeleteCounter = (sessionData, message) => {
  const counter = handleDeleteCounterLookup(sessionData, message);
  counter?.element && showCounter(sessionData, counter.element);
};

const handleHideDeleteCounter = (sessionData, message) => {
  const counter = handleDeleteCounterLookup(sessionData, message);
  counter?.element && hideCounter(sessionData, counter.element);
};

const handleFlashDeleteCounter = (sessionData, message) => {
  const counter = handleDeleteCounterLookup(sessionData, message);
  counter?.element && flashCounter(sessionData, counter.element);
};

const handleMakeDeleteCounter = async (sessionData, message) => {
  const messageFragments = message.trim().split(' ');
  if(messageFragments.length < 2 || messageFragments.length > 3) {
    return;
  }
  
  const [command, username, nicknames] = messageFragments;
  const users = await getUsers(sessionData, [], [username])
  if(!users?.length) {
    return;
  }

  const [user] = users;
  const formattedNicknames = nicknames?.split(',') || [];
  
  await initDeleteCounterData(sessionData, user.id, formattedNicknames)
  await saveUserDeletionCounters(sessionData);

  return;
};

const handleRemoveDeleteCounter = (sessionData, message) => {
  const messageFragments = message.trim().split(' ');
  if(messageFragments.length !== 2) {
    return;
  }
  removeUserDeletionCounter(sessionData, messageFragments[1]);
  return;
};
