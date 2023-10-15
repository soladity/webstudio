import type { ActionArgs } from "@remix-run/node";
import { z } from "zod";

const zTranscription = z.object({
  text: z.string().transform((value) => value.trim()),
});

// @todo: move to AI package
export const action = async ({ request }: ActionArgs) => {
  // @todo: validate request
  const formData = await request.formData();
  formData.append("model", "whisper-1");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      },
      body: formData,
    }
  );

  if (response.ok === false) {
    const message = await response.text();

    // eslint-disable-next-line no-console
    console.error("ERROR", response.status, message);

    return {
      success: false,
      error: {
        status: response.status,
        message,
      },
    } as const;
  }

  // @todo untyped
  const data = zTranscription.safeParse(await response.json());

  if (data.success === false) {
    // eslint-disable-next-line no-console
    console.error("ERROR openai transcriptions", data.error);
  }

  return data;
};
