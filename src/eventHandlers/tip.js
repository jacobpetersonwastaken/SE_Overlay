import {updateHypeTrain} from '../helpers/getHypeTrainEvents.js';

export const handleTipEvent = (event, sessionData) => {
  updateHypeTrain(sessionData);
}