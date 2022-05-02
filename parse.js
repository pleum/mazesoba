const dayjs = require("dayjs");
const Keyv = require("keyv");

const keyv = new Keyv("sqlite://./database.sqlite");

const content = ``;

const couponMonth = dayjs().startOf("month").format("YYYY-MM-DD");
const coupons = [];

for (const line of content.split("\n")) {
  if (line.length !== 10) {
    continue;
  }

  let type = null;
  if (line.startsWith("FL") || line.startsWith("FW")) {
    type = "FOOD_DISCOUNT";
  }
  if (line.startsWith("TL") || line.startsWith("TW")) {
    type = "TAXI_DISCOUNT";
  }
  if (line.startsWith("DL") || line.startsWith("DW")) {
    type = "FOOD_DELIVERY_DISCOUNT";
  }
  if (line.startsWith("ML") || line.startsWith("MW")) {
    type = "MESSENGER_DISCOUNT";
  }
  if (line.startsWith("MAL") || line.startsWith("MAW")) {
    type = "MART_DISCOUNT";
  }
  if (type === null) {
    continue;
  }

  coupons.push({
    type,
    code: line.trim(),
  });
}

keyv.set("coupon", { date: couponMonth, items: coupons });
