import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";
import { db, Users } from "astro:db";
import bcrypt from "bcryptjs";
import { setSessionTokenCookie } from "@/lib/server/cookies";
import { createSession, generateSessionToken } from "@/lib/server/sessions";
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
      };
    },
  }),
};
