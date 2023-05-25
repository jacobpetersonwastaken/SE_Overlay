import {getRedemptions, getRedemptionEvets} from '../helpers/fetch.js';

export const getTtsRedemptionEventIds = async () => {
	const {data: redemptions} = await getRedemptions();
	const fr = redemptions?.filter(
		redemption => redemption.title.toLowerCase().includes('tts')
	)

	const redemptionIds = fr.map(redemption => redemption.id);
	const redemptionTitles = fr.map(redemption => redemption.title);


	return { redemptionIds, redemptionTitles};
};

export const loadTtsRedemptionEventIds = async (sessionData) => {
	const data = await getTtsRedemptionEventIds();
	sessionData.tts.eventIds = data.redemptionIds;
	sessionData.tts.eventTitles = data.redemptionTitles;
}
