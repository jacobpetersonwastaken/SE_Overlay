import {drawWheel} from './wheel.js';
import {createHiDPICanvas} from '../utils.js';

const drawCartBody = (context, gameState, options) => {
  const {x, y, text, color} = options;
  const width = 80;
  const height = 50;
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x, y);

  const opp = Math.tan(4 * (Math.PI / 180)) * height

  context.lineTo(x + opp, y + height);
  context.lineTo(x + width + opp, y + height);
  context.lineTo(x + width + opp + opp, y);
  context.closePath();

  context.fill();

  context.fillStyle = options.textColor || 'white';

  text.forEach((txt, i) => {
  	const metrics = context.measureText(txt);
  	const textWidth = metrics.width;
  	const extraSpace = width - textWidth - 5;

  	context.fillText(txt, x + opp + opp + extraSpace / 2, y + (height / 2) + (i * 12));
  });
}

export const drawCart = (context, gameState, options) => {
	drawCartBody(context, gameState, {...options, y: options.y + 20});

	const wheelProps = {
		x: options.x + 20,
		y: options.y + 82,
		lineWidth: 2, radius: 12, rotationSpeed: -5
	};

	drawWheel(context, gameState, wheelProps);
	drawWheel(context, gameState, {...wheelProps, x: wheelProps.x + 58});
}





