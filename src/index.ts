import "dotenv/config";
import Keyv from "keyv";
import { Telegraf } from "telegraf";
import dayjs from 'dayjs'

const keyv = new Keyv("sqlite://./database.sqlite");

const BOT_TOKEN = process.env.BOT_TOKEN as string;
const OWNER_IDS = process.env.OWNER_IDS as string

const bot = new Telegraf(BOT_TOKEN);
const ownerIds = OWNER_IDS.split(",").filter(id => (id !== "")).map(id => parseInt(id, 10))

const getFullType = (type: string) => {
  if (type === "FL" || type === "FW") {
    return "FOOD_DISCOUNT";
  }
  if (type === "TL" || type === "TW") {
    return "TAXI_DISCOUNT";
  }
  if (type === "DL" || type === "DW") {
    return "FOOD_DELIVERY_DISCOUNT";
  }
  if (type === "ML" || type === "MW") {
    return "MESSENGER_DISCOUNT";
  }
  if (type === "MAL" || type === "MAW") {
    return "MART_DISCOUNT";
  }

  return "INVALID"
}

const availableTypes = ["FL", "FW", "TL", "TW", "DL", "DW", "ML", "MW", "MAL", "MAW"]
bot.command("coupon", async (ctx) => {
  if (!ownerIds.includes(ctx.from.id)) {
    return ctx.reply("No permission")
  }

  const [_type] = ctx.message.text.replace("/coupon ", "").split(" ")

  let type = _type.toLocaleUpperCase()
  if (!availableTypes.includes(type)) {
    return ctx.reply("Invalid coupon type")
  }
  type = getFullType(type)

  const couponData = await keyv.get("coupon")
  let foundCoupon = null

  for (const coupon of couponData.items) {
    if (coupon.type !== type) {
      continue
    }

    if (coupon.used_at) {
      continue
    }

    foundCoupon = coupon
    break
  }

  if (foundCoupon === null) {
    return ctx.reply("Coupon not found")
  }

  foundCoupon.used_at = dayjs().valueOf()
  await keyv.set("coupon", couponData)

  return ctx.reply(foundCoupon.code)
})

bot.launch();

// Graceful shutdown.
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
