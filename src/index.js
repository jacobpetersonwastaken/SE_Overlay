import {handleMessageDeleteEvent} from './eventHandlers/deleteMessage.js';
import {handleSubscriptionEvent} from './eventHandlers/sub.js'
import {handleTipEvent} from './eventHandlers/tip.js'
import {handleMessageEvent} from './eventHandlers/message.js'
import {resizePage, initSessionData, addUserMessageDeleteCounter} from './helpers/utils.js';
import {MAV_USER_ID} from './helpers/consts.js';

const sessionData = initSessionData();
addUserMessageDeleteCounter(sessionData, MAV_USER_ID, ['mav', 'maveric', 'maverick'])

window.addEventListener('load', resizePage);
window.addEventListener('resize', resizePage);

window.addEventListener('onEventReceived', event => {
  switch(event.detail.listener) {
    case('message'):
      handleMessageEvent(event.detail.event, sessionData);
      break;
    case('delete-message'):
      handleMessageDeleteEvent(event.detail.event, sessionData);
      break;
    case('subscriber-latest'):
      handleSubscriptionEvent(event.detail.event, sessionData);
      break;
    case('tip-latest'):
      handleTipEvent(event.detail.event, sessionData);
      break;
    case('cheer-latest'):
      handleTipEvent(event.detail.event, sessionData);
      break;
  }
});

