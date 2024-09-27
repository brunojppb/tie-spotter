import "dotenv/config";
import { checkAppointment } from "./checkAppointment";

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

  await checkAppointment();
}

main()
  .then(() => {
    console.log("done");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Could not complete appointment check: ", error);
  });
