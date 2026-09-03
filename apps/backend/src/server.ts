import bundled from "../dist/api.js";
import { Hono } from "hono";

const app = new Hono();

app.all("/*", (c) => bundled.fetch(c.req.raw));
export default app;
