import { defineMiddleware, sequence } from "astro:middleware";
import { validateSessionToken } from "./lib/server/sessions";
import {
  setSessionTokenCookie,
  deleteSessionTokenCookie,
} from "./lib/server/cookies";

const authMiddleware = defineMiddleware(async (context, next) => {
  const token = context.cookies.get("session")?.value ?? null;
  if (token === null) {
    context.locals.session = null;
    context.locals.user = null;
    return next();
  }
  const { user, session } = await validateSessionToken(token);
  if (session !== null) {
    setSessionTokenCookie(context, token, session.expiresAt);
  } else {
    deleteSessionTokenCookie(context);
  }
  context.locals.session = session;
  context.locals.user = user;
  return next();
});

export const onRequest = sequence(authMiddleware);
