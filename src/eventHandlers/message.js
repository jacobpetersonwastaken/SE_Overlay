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
} from '../helpers/utils.js';
import {getUsers} from '../helpers/fetch.js';
import {
  initDeleteCounterData, 
  saveUserDeletionCounters, 
  removeUserDeletionCounter
} from '../helpers/deleteCounters.js';
import {runLottery} from '../helpers/lottery.js';
import {updateHypeTrain} from '../helpers/updateHypeTrain.js';

const lotteryCount = document.getElementById('lottery_players_count');

export const handleMessageEvent = async (event, sessionData) => {
  const {userId, msgId, text, tags} = event.data;

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
    speak(text);
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
    default:
      break;
  }
};

const setTtsEnabled = (sessionData, enabled) => {
  sessionData.tts.isEnabled = enabled;
}

const handleRunLottery = (sessionData, message) => {
  const [firstWord, secondWord] = message.trim().split(' ');
  const secondWordNumber = Number(secondWord);
  const seconds = (
    secondWordNumber && !isNaN(secondWordNumber) ? 
    secondWordNumber : 
    60
  );
  runLottery(sessionData, seconds);
}

const handleDeleteCounterLookup = (sessionData, message) => {
  const messageFragments = message.trim().split(' ');
  if(messageFragments.length !== 2) {
    return;
  }

  const [command, nickname] = messageFragments;
  return getDeleteCounterByNickname(sessionData, nickname);
}

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
}

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
}

const handleRemoveDeleteCounter = (sessionData, message) => {
  const messageFragments = message.trim().split(' ');
  if(messageFragments.length !== 2) {
    return;
  }
  removeUserDeletionCounter(sessionData, messageFragments[1]);
  return;
}
