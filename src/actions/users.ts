import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";
import { db, eq, Users } from "astro:db";
import bcrypt from "bcryptjs";
import {
  deleteSessionTokenCookie,
  setSessionTokenCookie,
} from "@/lib/server/cookies";
import {
  createSession,
  generateSessionToken,
  invalidateSession,
} from "@/lib/server/sessions";
import type { APIContext } from "astro";

export const users = {
  createUser: defineAction({
    accept: "form",
    input: z.object({
      nombre: z
        .string()
        .min(3, { message: "El nombre debe tener al menos 3 letras." })
        .max(48, { message: "El nombre debe tener menos de 48 letras." }),
      apellido: z.string().optional(),
      telefono: z
        .string()
        .min(10, { message: "El telefono debe tener 10 dígitos." })
        .max(10, { message: "El telefono debe tener 10 dígitos." }),
      email: z.string().email(),
      contraseña: z
        .string()
        .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
        .max(32, {
          message: "La contraseña debe tener menos de 32 caracteres.",
        }),
    }),
    handler: async (
      { nombre, apellido, telefono, email, contraseña },
      context,
    ) => {
      // Create a user, hash password and add it to db
      const hashedPassword = await bcrypt.hash(contraseña, 10);
      const newUser = await db
        .insert(Users)
        .values({
          nombre,
          apellido,
          telefono,
          email,
          contraseña: hashedPassword,
        })
        .returning();

      if (newUser.length < 1) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear el usuario. Intente nuevamente.",
        });
      }

      // Create a session for the new user
      const token = generateSessionToken();
      const session = await createSession(token, newUser[0].id);
      setSessionTokenCookie(context as APIContext, token, session.expiresAt);

      return {
        message: "Usuario registrado correctamente.",
        url: "/",
      };
    },
  }),
  iniciarSesion: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
      contraseña: z
        .string()
        .min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
    }),
    async handler({ email, contraseña }, context) {
      const user = await db
        .select()
        .from(Users)
        .where(eq(Users.email, email))
        .get();

      if (!user) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Email o contraseña incorrectos.",
        });
      }

      const isValidPassword = await bcrypt.compare(contraseña, user.contraseña);

      if (!isValidPassword) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Email o contraseña incorrectos.",
        });
      }

      context.cookies.set("session", generateSessionToken());
      const token = generateSessionToken();
      const session = await createSession(token, user.id);
      setSessionTokenCookie(context as APIContext, token, session.expiresAt);

      return { message: "Sesión iniciada correctamente.", url: "/" };
    },
  }),
  cerrarSesion: defineAction({
    input: z.object({
      session: z.string(),
    }),
    handler: async ({ session }, context) => {
      invalidateSession(session);
      deleteSessionTokenCookie(context as APIContext);

      return {
        message: "Sesión cerrada correctamente.",
        url: "/",
      };
    },
  }),
};
