import { json } from "@remix-run/node";

export const loader = async () => {
    return json({ url: '/assets/images/zodiac_celestial_1780202066082.png' });
};
