import axios from "axios";
import https from "https";

const RESOURCES_URL = `${process.env.PAM_BASE_URL}/rest/prvcrdvlt/Resources`;

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const incomingCookie = body?.cookie;

    if (!incomingCookie || typeof incomingCookie !== "string") {
      return Response.json(
        { message: "Request body must include a valid cookie string" },
        { status: 400 },
      );
    }

    const response = await axios.get(RESOURCES_URL, {
      headers: {
        Cookie: incomingCookie,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 15000,
    });

    return Response.json(response.data, { status: response.status });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return Response.json(
        {
          message: "Upstream API returned an error",
          status: error.response.status,
          data: error.response.data,
        },
        { status: error.response.status },
      );
    }

    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return Response.json(
      {
        message: "Failed to call upstream API",
        error: message,
      },
      { status: 500 },
    );
  }
}
