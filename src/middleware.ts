import { defineMiddleware, sequence } from "astro:middleware";
import { validateSessionToken } from "./lib/server/sessions";
import {
  setSessionTokenCookie,
  deleteSessionTokenCookie,
} from "./lib/server/cookies";
import { getActionContext } from "astro:actions";

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

// const actionMiddleware = defineMiddleware(async (context, next) => {
//   const { action, setActionResult, serializeActionResult } =
//     getActionContext(context);
//   if (action?.calledFrom === "form") {
//     const result = await action.handler();
//     // TODO: Handle action
//     setActionResult(action.name, serializeActionResult(result));
//   }
//   return next();
// });

export const onRequest = sequence(authMiddleware);
