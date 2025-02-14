import { actions } from "astro:actions";
import { navigate } from "astro:transitions/client";
import { useActionState } from "react";
import { experimental_withState as withState } from "@astrojs/react/actions";
import { Input } from "@heroui/react";

import type { Session } from "db/config";
import { Spinner } from "@heroui/react";

interface SessionControlsProps {
  session: Session | boolean;
}

export default function SessionControls({ session }: SessionControlsProps) {
  const [{ data, error }, action, isPending] = useActionState(
    withState(actions.users.cerrarSesion),
    {
      data: { message: "", url: "" },
      error: undefined,
    },
  );

  data && navigate(data.url);
  error && alert(error.message);

  return typeof session === "object" && session !== null ? (
    <form action={action}>
      <Input hidden name="session" value={session.id} />
      <button
        type="submit"
        className={`${isPending ? "bg-brand bg-opacity-25" : "bg-light bg-opacity-5"} relative mt-4 w-full rounded-sm border border-light border-opacity-25 py-3 text-center leading-none transition duration-75 ease-out ~px-2/4 hover:border-brand hover:border-opacity-50 hover:bg-brand hover:bg-opacity-15 hover:text-brand-2 focus:outline-brand`}
      >
        {isPending ? (
          <div className="mr-4 flex items-center justify-center gap-2">
            <Spinner size="sm" color="current" />
            <span>Procesando...</span>
          </div>
        ) : (
          <span>Cerrar Sesión</span>
        )}
      </button>
    </form>
  ) : null;
}
