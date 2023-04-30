import {FATED_USER_ID, KDAWG_USER_ID, ACCESS_TOKEN, APPLICATION_ID} from './consts.js';
import {gameLoop} from './gameLoop.js';
import {getRandomColor} from './utils.js';

const canvas = document.getElementById('game_board');
const context = canvas.getContext('2d');

const hexToDecimal = hex => parseInt(hex, 16);

const addHypeUser = (user, sessionData) => {
  const text = [user.display_name];

  let i = 0, 
    complete = false;

  while(!complete) {
    const {width} = context.measureText(text[i]);
    if(width < 74) {
      if(text[i+1]) {
        i++
      } else {
        complete = true;
      }
    } else {
      const finalLetter = text[i][text[i].length - 1];
      text[i+1] = finalLetter + (text[i+1] || '');
      text[i] = text[i].slice(0, text[i].length - 1);
    }
  }

  const hypes = [];
  let r, g, b;
  if(!user.color) {
    const rgb = getRandomColor();
    r = rgb.r;
    g = rgb.g;
    b = rgb.b;
  } else {
    const hexColor = user.color.slice(1);
    r = hexToDecimal(hexColor.slice(0, 2))
    g = hexToDecimal(hexColor.slice(2, 4))
    b = hexToDecimal(hexColor.slice(4, 6))
  }

  const textColor = (r + b + g) > 124 ? 'dimgrey' : 'white';
  
  const tailStartPosition = Math.round(Math.random() * 100);

  const color = `rgb(${r}, ${g}, ${b})`;
  sessionData.hypeTrain.users[user.id] = { hypes, color, text, textColor, tailStartPosition };
}

const getRequestHeaders = () => new Headers({
  "Authorization": `Bearer ${ACCESS_TOKEN}`,
  "Client-Id": APPLICATION_ID,
})

export const getHypeTrainEvents = async () => {
  const url = `https://api.twitch.tv/helix/hypetrain/events?broadcaster_id=${KDAWG_USER_ID}&first=10`;
  const fetchRes = await fetch(url, {headers: getRequestHeaders()});
  return fetchRes.json();
}

const getUsersColors = async (ids) => {
  const url = `https://api.twitch.tv/helix/chat/color?${ids.map(id => `user_id=${id}`)}`;
  const fetchedUserColorRes = await fetch(url, {
    headers: getRequestHeaders(),
  })
  return fetchedUserColorRes.json();
}

const getUsers = async (ids) => {
  const {data: userColors} = await getUsersColors(ids);
  const url = `https://api.twitch.tv/helix/users?${ids.map(id => `id=${id}`)}`;
  const fetchUsersRes = await fetch(url, {
    headers: getRequestHeaders(),
  });

  const parsedUsersRes = await fetchUsersRes.json();

  const finalUsers = parsedUsersRes.data.map(user => {
    const userColor = userColors.find(userColor => userColor.user_id === user.id);
    return {
      ...user,
      ...userColor,
    }
  });

  return finalUsers;
}

const rfcToUnix = (rfcDate) => (new Date(rfcDate)).getTime();

export const updateHypeTrain = async (sessionData) => {
  const {data} = await getHypeTrainEvents();

  let i = data.length;
  let shouldRunTrain = false;
  while(i--) {
    const hypeProgressEvent = data[i];
    const isExpired = rfcToUnix(hypeProgressEvent.event_data.expires_at) < Date.now();
    const isNewEvent = !sessionData.hypeTrain.events[hypeProgressEvent.id];
    if(!isExpired && isNewEvent) {
      const {started_at, level, total, goal} = hypeProgressEvent.event_data;
      const isNewTrain = (
        sessionData.hypeTrain.startedAt !== started_at
        && rfcToUnix(started_at) > rfcToUnix(sessionData.hypeTrain.startedAt)
      );

      if(isNewTrain) {
        sessionData.hypeTrain = {
          startedAt: hypeProgressEvent.event_data.started_at,
          events: {},
          users: {},
          isRunning: false,
          level: 0,
          total: 0,
          goal: 0,
        }
      }

      const latestHypeUserId = hypeProgressEvent.event_data.last_contribution.user;
      let user = sessionData.users[latestHypeUserId];
      if(!user) {
        const users = await getUsers([latestHypeUserId]);
        user = users[0];
        sessionData.users[latestHypeUserId] = user;
      }

      addHypeUser(user, sessionData);

      if(total > sessionData.hypeTrain.total) {
        sessionData.hypeTrain.total = total;
      }

      if(level > sessionData.hypeTrain.level && !sessionData.hypeTrain.isRunning) {
        shouldRunTrain = true;
        sessionData.hypeTrain.level = level;
        
      }
    }
  }
  if(shouldRunTrain) {
    sessionData.hypeTrain.isRunning = true;
    gameLoop(sessionData);
  }
}

