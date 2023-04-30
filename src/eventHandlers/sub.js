import {updateHypeTrain} from '../helpers/getHypeTrainEvents.js';

export const handleSubscriptionEvent = (event, sessionData) => {
  updateHypeTrain(sessionData)
}