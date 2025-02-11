import { actions, isInputError } from "astro:actions";
import { useActionState } from "react";
import { experimental_withState as withState } from "@astrojs/react/actions";

import { Form, Input } from "@heroui/react";
import Button from "@/components/ui/Button";
import { navigate } from "astro:transitions/client";
import FormInputError from "../checkout/FormInputError";

export default function SignupForm() {
  const [{ data, error }, action, isPending] = useActionState(
    withState(actions.users.createUser),
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
        Crear Cuenta
      </h1>
      <form className="space-y-2" method="POST" action={action}>
        <Input
          id="nombre"
          name="nombre"
          type="text"
          placeholder="John"
          label="Nombre"
          radius="sm"
          required
          aria-describedby="error-nombre"
        />
        {inputErrors?.nombre && (
          <FormInputError error={inputErrors?.nombre} name="nombre" />
        )}
        <Input
          id="apellido"
          name="apellido"
          type="apellido"
          placeholder="Doe"
          label="Apellido"
          radius="sm"
          aria-describedby="error-apellido"
        />
        {inputErrors?.apellido && (
          <FormInputError error={inputErrors?.apellido} name="apellido" />
        )}
        <Input
          id="telefono"
          name="telefono"
          type="tel"
          placeholder="8123456789"
          label="Teléfono"
          radius="sm"
          required
          aria-describedby="error-telefono"
        />
        {inputErrors?.telefono && (
          <FormInputError error={inputErrors?.telefono} name="telefono" />
        )}
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
        {actionError && <FormInputError error={actionError.message} name="form" />}
        <Button label="Crear Cuenta" isPending={isPending} />
        <p className="w-full text-center">
          <span className="opacity-60">Ya tienes una cuenta? </span>
          <a href="/login" className="text-brand hover:underline">
            Inicia Sesión
          </a>
        </p>
      </form>
    </div>
  );
}
