import {FIVE_MINUTES} from './consts.js';
import {gameLoop} from './gameLoop.js';
import {getUsers, getHypeTrainEvents} from './fetch.js'
import {addHypeUser} from './addHypeUser.js';
import {rfcToUnix} from './utils.js';
import {resetHypeTrainData} from './sessionState.js';
import {debounce} from 'lodash';

const _updateHypeTrain = async (sessionData, showExpired=false) => {
  const {data} = await getHypeTrainEvents();

  let i = data.length;
  let shouldRunTrain = false;
  while(i--) {
    const hypeProgressEvent = data[i];
    const isExpired = (
      showExpired ? 
      false : 
      Date.now() > rfcToUnix(hypeProgressEvent.event_data.expires_at)
    );

    const isNewEvent = !sessionData.hypeTrain.events[hypeProgressEvent.id];
    
    if(!isExpired && isNewEvent) {
      sessionData.hypeTrain.events[hypeProgressEvent.id] = true;
      const trainId = hypeProgressEvent.event_data.id;
      const {started_at, level, total, goal} = hypeProgressEvent.event_data;
      const startedAt = rfcToUnix(started_at);
      const isNewTrain = (
        startedAt !== sessionData.hypeTrain.startedAt &&
        startedAt > sessionData.hypeTrain.startedAt
      );

      if(isNewTrain) {
        resetHypeTrainData(sessionData, startedAt);
      }

      const latestHypeUserId = hypeProgressEvent.event_data.last_contribution.user;
      let user = sessionData.users[latestHypeUserId];
      
      if(!user) {
        const users = await getUsers(sessionData, [latestHypeUserId]);
        if(!users?.length) {
          return;
        }
        user = users[0];
      }

      addHypeUser(user, sessionData);

      if(total > sessionData.hypeTrain.total) {
        sessionData.hypeTrain.total = total;
      }

      if(level > sessionData.hypeTrain.level) {
        shouldRunTrain = true;
        sessionData.hypeTrain.level = level;
      }
    }
  }

  if(shouldRunTrain && !sessionData.hypeTrain.isRunning) {
    sessionData.hypeTrain.isRunning = true;
    await updateHypeEventUsers(sessionData);
    gameLoop(sessionData);
  }
}

export const updateHypeTrain = debounce(_updateHypeTrain, 100);

const updateHypeEventUsers = async (sessionData) => {
  const hypeEvents = sessionData.events;

  const usernames = new Set();

  hypeEvents.forEach(event => {
    const {name, sender} = event;
    usernames.add(name);
    if(sender && sender !== name) {
      usernames.add(sender);
    }
  })

  sessionData.events = [];
  const users = await getUsers(sessionData, [], [...usernames]);
  users?.forEach(user => user && addHypeUser(user, sessionData));
}
