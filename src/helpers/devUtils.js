import {updateHypeTrain} from './getHypeTrainEvents.js';
import {gameLoop} from './gameLoop.js';

const textUsers = ['jenna_jjj', 'helpicantsee_', 'botdawg0', 'ThryTis1', 'RandomKittyLover', 'Treycicle', 'KenzieLxv', 'HyperWarrior93'];

export const runTestTrain = (sessionData) => {
  if(sessionData.hypeTrain.isRunning) {
    return;
  }

  gameLoop(sessionData)
};
