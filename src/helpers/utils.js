import {MAV_USER_ID, FATED_USER_ID, FATE_BOT_USER_ID} from './consts.js';

const canvas = document.getElementById('game_board');
const context = canvas.getContext('2d');

export const resizePage = () => {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
}

export const clearBoard = (context) => context.clearRect(0, 0, context.canvas.width, context.canvas.height);

export const getDefaultGameState = () => ({
  continue: true,
  progress: 0,
})

const calcPercentVal = (val1, val2, percent) => {
  return Math.min(val1, val2) + (Math.abs(val1 - val2) * percent);
}

export const arrayPartialTransformation = (arr1, arr2, percent) => {
  return arr1.map((val, i) => calcPercentVal(val, arr2[i], percent))
}

export const HSVtoRGB = (h, s, v) => {
    var r, g, b, i, f, p, q, t;
    if (h && !s && !v) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

export const getRandomColor = () => {
  const r1 = Math.random();
  const r2 = Math.random();
  const r3 = Math.random();

  const h = r1 * 360;
  const s = 50 + 50 * r2;
  const v = 40 + 40 * r2;

  return HSVtoRGB(h, s / 100, v / 100);
}

const initDeleteCounterData = async (nicknames) => {
  const counterEl = document.createElement('div');
  counterEl.innerHTML = '0';
  counterEl.classList.add('delete_counter');
  counterEl.classList.add('invisible');
  const root = document.getElementsByClassName('root')[0];
  root.appendChild(counterEl);

  return {
    deletedMessages: 0,
    messageIds: {},
    shouldDisplay: false,
    isFlashing: false,
    element: counterEl,
    nicknames,
  }
}

export const initSessionData = () => ({
  users: {},
  hypeTrain: {
    events: {},
    users: {},
    startedAt: null,
    isRunning: false,
    level: 0,
    total: 0,
    goal: 0,
  },
  deleteCounters: {},
});

export const addUserMessageDeleteCounter = async (sesssionData, userId, nicknames) => {
  sesssionData.deleteCounters[userId] = await initDeleteCounterData(nicknames);
};
