import { actions } from "astro:actions";
import { useActionState } from "react";
import { experimental_withState as withState } from "@astrojs/react/actions";

import { Form, Input } from "@heroui/react";
import Button from "@/components/ui/Button";
import { navigate } from "astro:transitions/client";

export default function SignupForm() {
  const [{ data, error }, action, isPending] = useActionState(
    withState(actions.users.createUser),
    {
      data: { message: "", url: "" },
      error: undefined,
    },
  );

  if (error) console.log(error);

  if (data?.message) console.log(data.message);
  if (data?.url) navigate(data.url);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 mt-16 text-3xl font-medium tracking-tighter">
        Crear Cuenta
      </h1>
      <Form className="space-y-2" method="post" action={action}>
        <Input
          id="nombre"
          name="nombre"
          type="text"
          placeholder="John"
          label="Nombre"
          radius="sm"
          required
        />
        <Input
          id="apellido"
          name="apellido"
          type="apellido"
          placeholder="Doe"
          label="Apellido"
          radius="sm"
        />
        <Input
          id="telefono"
          name="telefono"
          type="tel"
          placeholder="8123456789"
          label="Teléfono"
          radius="sm"
          required
        />
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="acme@email.com"
          label="Email"
          radius="sm"
          required
        />
        <Input
          id="contraseña"
          name="contraseña"
          type="password"
          placeholder="********"
          label="Contraseña"
          radius="sm"
          required
        />
        <Button label="Crear Cuenta" isPending={isPending} />
        <p className="w-full text-center">
          <span className="opacity-60">Ya tienes una cuenta? </span>
          <a href="/login" className="text-brand hover:underline">
            Inicia Sesión
          </a>
        </p>
      </Form>
    </div>
  );
}
