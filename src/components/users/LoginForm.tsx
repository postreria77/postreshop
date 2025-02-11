import { actions, isInputError } from "astro:actions";
import { useActionState } from "react";
import { experimental_withState as withState } from "@astrojs/react/actions";

import { Form, Input } from "@heroui/react";
import Button from "@/components/ui/Button";
import { navigate } from "astro:transitions/client";
import FormInputError from "../checkout/FormInputError";

export default function LoginForm() {
  const [{ data, error }, action, isPending] = useActionState(
    withState(actions.users.iniciarSesion),
    {
      data: { message: "", url: "" },
      error: undefined,
    },
  );

  const inputErrors = isInputError(error) ? error.fields : {};
  const actionError = !isInputError(error) ? error : undefined;

  if (data?.message) console.log(data.message);
  if (data?.url) navigate(data.url);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 mt-16 text-3xl font-medium tracking-tighter">
        Iniciar Sesión
      </h1>
      <form className="space-y-2" method="POST" action={action}>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="acme@email.com"
          label="Email"
          radius="sm"
          required
          aria-describedby="error-email"
        />
        {inputErrors?.email && (
          <FormInputError error={inputErrors?.email} name="email" />
        )}
        <Input
          id="contraseña"
          name="contraseña"
          type="password"
          placeholder="********"
          label="Contraseña"
          radius="sm"
          required
          aria-describedby="error-contraseña"
        />
        {inputErrors?.contraseña && (
          <FormInputError error={inputErrors?.contraseña} name="contraseña" />
        )}
        <Button label="Iniciar Sesión" isPending={isPending} />
        {actionError?.message && (
          <FormInputError error={actionError?.message} name="form" />
        )}
        <p className="w-full text-center">
          <span className="opacity-60">Todavía no tienes cuenta? </span>
          <a href="/signup" className="text-brand hover:underline">
            Crear Cuenta
          </a>
        </p>
      </form>
    </div>
  );
}
