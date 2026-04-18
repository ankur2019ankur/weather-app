import axios from "axios";
import https from "https";

const SPF_BASE = process.env.SPF_BASE_URL ?? "https://192.168.1.209";
const SPF_UTIL = `${SPF_BASE.replace(/\/$/, "")}/SPF.Util`;

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body?.name;
    const password = body?.password;

    if (
      typeof name !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !password
    ) {
      return Response.json(
        { message: "Username and password are required" },
        { status: 400 },
      );
    }

    const payload = {
      method: "callModuleEx",
      params: {
        pkt: {
          module: "auth",
          method: "login",
          Credentials: {
            name: name.trim(),
            passwd: password,
          },
        },
        svc_name: null,
      },
    };

    const response = await axios.post(SPF_UTIL, payload, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Origin: SPF_BASE,
        Referer: `${SPF_BASE}/pam/`,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 30000,
    });

    const data = response.data as {
      status?: number;
      message?: string;
      User?: { name?: string };
      Identity?: { content?: string };
    };

    if (data?.status !== 0) {
      const msg =
        typeof data?.message === "string" && data.message.trim()
          ? data.message
          : "Login failed";
      return Response.json({ message: msg, status: data?.status }, { status: 401 });
    }

    const identityContent = data?.Identity?.content;
    const userName = data?.User?.name ?? name.trim();

    if (!identityContent || typeof identityContent !== "string") {
      return Response.json(
        { message: "Invalid response: missing Identity.content" },
        { status: 502 },
      );
    }

    return Response.json({
      name: userName,
      identityContent,
      message:
        typeof data.message === "string" ? data.message : "Authenticated",
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const upstream = error.response.data;
      const message =
        typeof upstream?.message === "string"
          ? upstream.message
          : "Upstream login failed";
      return Response.json(
        {
          message,
          status: error.response.status,
          data: upstream,
        },
        { status: error.response.status >= 400 ? error.response.status : 502 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return Response.json(
      {
        message: "Failed to reach authentication service",
        error: message,
      },
      { status: 502 },
    );
  }
}
