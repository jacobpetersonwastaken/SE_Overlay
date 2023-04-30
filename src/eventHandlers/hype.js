import {updateHypeTrain} from '../helpers/getHypeTrainEvents.js';

export const handleHypeEvent = (sessionData) => {
  updateHypeTrain(sessionData);
}