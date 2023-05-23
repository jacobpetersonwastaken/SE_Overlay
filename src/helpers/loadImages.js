import {IMAGE_LINKS} from './consts.js';

export const loadImage = (url) => new Promise((resolve) => {
	const img = new Image();
	img.onload = () => resolve(img);
	img.src = url;
})

let isLoading = false,
	isLoaded = false;
export const loadImages = async (sessionData) => {
	if(isLoading || isLoaded) {
		return;
	}
	isLoading = true;
	const images = await Promise.all(IMAGE_LINKS.map(loadImage));
	sessionData.images = images.reduce((acc, el, i) => {
		acc[IMAGE_LINKS[i]] = el;
		return acc;
	}, {});
	isLoading = false;
	isLoaded = true;
}