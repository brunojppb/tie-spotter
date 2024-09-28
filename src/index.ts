import "dotenv/config";
import { checkAppointment } from "./checkAppointment";

const fifteenMinInMills = 15 * 60 * 1000;

async function main() {
  const requiredEnv = [
    "TELEGRAM_CHAT_ID",
    "TELEGRAM_TOKEN",
    "NIE",
    "COUNTRY_CODE_FROM_SELECT",
    "FULL_NAME",
  ];

  for (const envVar of requiredEnv) {
    if (typeof process.env[envVar] === "undefined") {
      throw new Error(`'${envVar}' must be provided.`);
    }
  }

  // Very arbitrary: Run this job for 4 days, every 15min then stop the container
  const attempts = Array.from(Array(384).keys());

  for (let attempt of attempts) {
    console.log(`attempt ${attempt}`);
    try {
      await checkAppointment();
    } catch (e: unknown) {
      console.error(`Attempt ${attempt} failed with `, e);
    }
    console.log(`awaiting ${fifteenMinInMills} mills for the next attempt`);
  }
}

main()
  .then(() => {
    console.log("done");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Could not complete appointment check: ", error);
  });

function sleep() {
  return new Promise((resolve, _reject) =>
    setTimeout(resolve, fifteenMinInMills)
  );
}
