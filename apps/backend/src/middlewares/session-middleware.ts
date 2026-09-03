import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth";

export type HonoEnv = {
  Variables: {
    session: typeof auth.$Infer.Session;
  };
};

export const sessionMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  c.set("session", session);
  await next();
});
