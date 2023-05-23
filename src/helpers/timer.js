import {selfCorrectingTimer} from './utils.js';

export const runTimer = (sessionData, options={}) => {
	const {seconds=5, onComplete} = options;

	const timerState = {
		gameTicks: 0,
		ticks: 0,
		totalTicks: seconds * 100,
		progress: 0,
		remaining: seconds,
		pause: ()=>{},
		isPaused: false,
		isDone: false,
		onComplete: onComplete || (()=>{}),
	}

	const {start, pause} = selfCorrectingTimer({
		onUpdate: ticks => {
			timerState.ticks++;
			timerState.progress = timerState.ticks / timerState.totalTicks;
			if(ticks % 100 === 0 && timerState.remaining) {
				timerState.remaining--;
			}
		},
		interval: 10,
	});
	start();
	timerState.pause = pause;
	drawLoop(sessionData, timerState);
};

const drawLoop = (sessionData, timerState) => {
	const {context, canvas} = sessionData.timer;
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.lineWidth = 6;
	context.font = 'bold 42px Karla';

	const r = 220 * Math.min(timerState.progress * 2, 1);
	const g = 220 * (1 - Math.max((timerState.progress - 0.5) * 2, 0));
	const color = `rgb(${r},${g},30)`;
	context.strokeStyle = color;

	timerState.gameTicks++;

	if(timerState.ticks >= timerState.totalTicks && !timerState.isPaused) {
		timerState.pause();
		timerState.isPaused = true;
		setTimeout(() => {
			timerState.isDone = true;
			timerState.onComplete()
		}, 2000)
	};

	context.beginPath();
	context.fillStyle = 'lightgrey';
	context.arc(110, 110, 80, 0, Math.PI * 2);
	context.fill();

	if(timerState.ticks >= timerState.totalTicks) {
		context.fillStyle = color;
		context.beginPath();
		context.arc(110, 110, 80, 0, 2 * Math.PI);
		context.stroke();
		if((timerState.gameTicks % 100) <= 60) {
			context.fillText(timerState.remaining, 100, 120);
		}
	} else {
		const start = -Math.PI / 2;
		const range = 2 * Math.PI;
		const end = start + range;
		const currentStart = start + (range * timerState.progress);
		context.fillStyle = 'darkgrey';

		context.moveTo(110, 110);
		context.beginPath();
		context.lineTo(110, 10);

		context.arc(110, 110, 80, start, (timerState.progress * Math.PI * 2) + start, true);

		context.lineTo(110, 110);
		context.closePath()
		context.fill();

		context.fillStyle = color;

		context.beginPath();
		context.arc(110, 110, 80, currentStart, end);
		context.stroke();

		context.fillText(timerState.remaining, 100 - ((`${timerState.remaining}`.length-1) * 10), 120);
	}

	if(!timerState.isDone) {
		window.requestAnimationFrame(() => drawLoop(sessionData, timerState))
	}
};