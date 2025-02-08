import { actions } from "astro:actions";
import { useActionState } from "react";
import { experimental_withState as withState } from "@astrojs/react/actions";

import { Form, Input } from "@heroui/react";
import Button from "@/components/ui/Button";

export default function LoginForm() {
  const [{ data, error }, action, isPending] = useActionState(
    withState(actions.users.iniciarSesion),
    {
      data: { message: "" },
      error: undefined,
    },
  );

  if (error) console.log(error);

  if (data?.message) console.log(data.message);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 mt-16 text-3xl font-medium tracking-tighter">
        Iniciar Sesión
      </h1>
      <Form className="space-y-2" method="post" action={action}>
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
        <Button label="Iniciar Sesión" isPending={isPending} />
        <p className="w-full text-center">
          <span className="opacity-60">Todavía no tienes cuenta? </span>
          <a href="/signup" className="text-brand hover:underline">
            Crear Cuenta
          </a>
        </p>
      </Form>
    </div>
  );
}
