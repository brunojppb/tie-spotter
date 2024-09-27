export async function sendMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
      }),
    });

    if (resp.ok) {
      return Promise.resolve();
    }

    return Promise.reject(await resp.text());
  } catch (e: unknown) {
    console.error("Could not notify telegram", e);
  }
}
