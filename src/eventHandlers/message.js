import {gameLoop} from '../helpers/gameLoop.js';
import {KDAWG_USER_ID, FATED_USER_ID, MAV_USER_ID} from '../helpers/consts.js'

const hideCounter = (counter) => {
  counter.classList.remove('visible');
  counter.classList.add('invisible');
}

const showCounter = (counter) => {
  counter.classList.add('visible');
  counter.classList.remove('invisible');
}

/*
DEV COMMANDS

choo choo
- forces a hype train to run 

show [USER] coutner
hide [USER] coutner
flash [USER] coutner

*/

const handleDevMessage = (message, sessionData) => {
  if(message === 'choo choo') {
    if(!sessionData.hypeTrain.isRunning) {
      sessionData.hypeTrain.isRunning = true;
      gameLoop(sessionData);
    }
    return;
  }

  const commandFound = Object.entries(sessionData.deleteCounters).some(([userId, deleteCounterData]) => {
    const {nicknames} = deleteCounterData;
    const userHandles = [...nicknames];

    const user = sessionData.users[userId];

    if(user && user.display_name) {
      userHandles.push(user.display_name)
    }
    
    let i = userHandles.length;
    while(i--) {
      const userHandle = userHandles[i];
      if(message === `show ${userHandle} counter`) {
        showCounter(deleteCounterData.element)
        i = 0;
        return true;
      } else if(message === `hide ${userHandle} counter`) {
        hideCounter(deleteCounterData.element)
        i = 0;
        return true;
      } else if(message === `flash ${userHandle} counter`) {
        showCounter(deleteCounterData.element)
        setTimeout(() => hideCounter(deleteCounterData.element), 6000);
        i = 0;
        return true;
      } else if(user && user.display_name && message === ``) {

      }
    }

    return false;
  })

  if(commandFound) {
    return;
  }

  if(message.startsWith('makedeletecounter')) {
    // makedeletecounter fate__bot
    return;
  }

  if(message.startsWith('newpoll')) {
    // newpoll a:yes b:no - colors:red,green duration:
    return;
  }
}

export const handleMessageEvent = (event, sessionData) => {
  const {userId, msgId, text} = event.data;


  Object.entries(sessionData.deleteCounters).map(([counterUserId, deleteCounterData]) => {
    if(counterUserId === userId) {
      deleteCounterData.messageIds[msgId] = true;
    }
  })

  if([KDAWG_USER_ID, FATED_USER_ID].includes(userId)) {
    handleDevMessage(text.toLowerCase().trim(), sessionData);
  }
}
