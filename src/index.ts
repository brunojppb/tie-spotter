import "dotenv/config";
import { checkAppointment, cleanUp } from "./checkAppointment";
import * as logger from "./logger";

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

  for (const attempt of attempts) {
    logger.info(`attempt ${attempt}`);
    try {
      await checkAppointment();
    } catch (e: unknown) {
      logger.error(`Attempt ${attempt} failed with `, e);
    }
    logger.info(`awaiting ${fifteenMinInMills} mills for the next attempt`);
    await sleep();
  }
}

main()
  .then(() => {
    logger.info("done");
    cleanUp()?.finally(() => process.exit(0));
    
  })
  .catch((error) => {
    logger.error("Could not complete appointment check: ", error);
    cleanUp()?.finally(() => process.exit(1));
  });

function sleep() {
  return new Promise((resolve, _reject) =>
    setTimeout(resolve, fifteenMinInMills)
  );
}
