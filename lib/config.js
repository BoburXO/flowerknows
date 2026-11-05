// Client-safe constants (can be imported from both server and client code)

export const SITE_NAME = "Flower Knows Uzbekistan";

export const TELEGRAM_USERNAME = "flowerknowsuzb";
export const TELEGRAM_URL = `https://t.me/${TELEGRAM_USERNAME}`;

export const INSTAGRAM_USERNAME = "flowerknows.uzb";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_USERNAME}/`;

export const PHONE_DISPLAY = "+998 (94) 111-71-13";
export const PHONE_E164 = "+998941117113";

// Shipping rules (used by the cart UI AND re-checked on the server)
export const FREE_SHIPPING_THRESHOLD = 300000;
export const SHIPPING_COST = 25000;

export const ORDER_STATUSES = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

export const BADGE_CODES = ["YANGI", "BESTSELLER", "HIT", "TAVSIYA", "EKSKLYUZIV", "CHEKLANGAN"];
