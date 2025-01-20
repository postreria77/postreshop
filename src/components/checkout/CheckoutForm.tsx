import { actions, isInputError } from "astro:actions";
import { navigate } from "astro:transitions/client";
import { useActionState } from "react";
import { experimental_withState as withState } from "@astrojs/react/actions";

import CheckoutProductsInput from "@/components/checkout/CheckoutProductsInput";
import type { Sucursal } from "db/config";

export function CheckoutForm({ sucursales }: { sucursales: Sucursal[] }) {
  const [{ data, error }, action, isPending] = useActionState(
    withState(actions.orders.create),
    {
      data: { message: "", url: "" },
      error: undefined,
    },
  );

  const inputErrors = isInputError(error) ? error.fields : {};
  const actionError = !isInputError(error) ? error : undefined;
  if (data?.url && !error) {
    return navigate(data.url);
  }

  return (
    <form className="flex flex-col" method="POST" action={action}>
      <CheckoutProductsInput />
      <label htmlFor="nombre" className="mb-4">
        Nombre
        {inputErrors.nombre && (
          <p
            id="error-nombre"
            className="ml-2 inline -translate-y-1 text-[8px] text-red-500"
          >
            <span className="mr-1 inline-flex size-[10px] items-center justify-center rounded-full bg-red-500 text-light">
              i
            </span>
            {inputErrors.nombre}
          </p>
        )}
        <input
          type="text"
          name="nombre"
          id="nombre"
          aria-describedby="error-nombre"
          className="mt-1 min-h-5 w-full rounded-sm border border-opacity-25 px-3 pb-[10px] pt-3 leading-none text-dark"
        />
      </label>
      <label htmlFor="tel" className="mb-4">
        Teléfono
        {inputErrors.tel && (
          <p
            id="error-tel"
            className="ml-2 inline -translate-y-1 text-[8px] text-red-500"
          >
            <span className="mr-1 inline-flex size-[10px] items-center justify-center rounded-full bg-red-500 text-light">
              i
            </span>
            {inputErrors.tel}
          </p>
        )}
        <input
          type="tel"
          name="tel"
          id="tel"
          aria-describedby="error-tel"
          className="mt-1 min-h-5 w-full rounded-sm border border-opacity-25 px-3 pb-[10px] pt-3 leading-none text-dark"
        />
      </label>
      <label htmlFor="sucursal" className="mb-4">
        Sucursal
        {inputErrors.sucursal && (
          <p
            id="error-sucursal"
            className="ml-2 inline -translate-y-1 text-[8px] text-red-500"
          >
            <span className="mr-1 inline-flex size-[10px] items-center justify-center rounded-full bg-red-500 text-light">
              i
            </span>
            {inputErrors.sucursal}
          </p>
        )}
        <select
          name="sucursal"
          id="sucursal"
          aria-describedby="error-sucursal"
          className="mt-1 min-h-5 w-full rounded-sm border border-opacity-25 px-3 pb-[10px] pt-3 leading-none text-dark"
          defaultValue=""
          required
        >
          {sucursales.map((sucursal) => (
            <option
              value={sucursal.id}
              key={sucursal.id}
              className="min-h-5 capitalize"
            >
              {sucursal.name}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="fecha" className="mb-4">
        Fecha
        {inputErrors.fecha && (
          <p
            id="error-fecha"
            className="ml-2 inline -translate-y-1 text-[8px] text-red-500"
          >
            <span className="mr-1 inline-flex size-[10px] items-center justify-center rounded-full bg-red-500 text-light">
              i
            </span>
            {inputErrors.fecha}
          </p>
        )}
        <input
          type="datetime-local"
          name="fecha"
          id="fecha"
          aria-describedby="error-fecha"
          className="mt-1 min-h-5 w-full rounded-sm border border-opacity-25 px-3 pb-[10px] pt-3 leading-none text-dark"
          min={new Date().toISOString().slice(0, 16)}
        />
      </label>
      {actionError?.message && (
        <p
          id="error-fecha"
          className="ml-2 inline -translate-y-1 text-[8px] text-red-500"
        >
          <span className="mr-1 inline-flex size-[10px] items-center justify-center rounded-full bg-red-500 text-light">
            i
          </span>
          {actionError.message}
        </p>
      )}

      <button
        type="submit"
        className={`${isPending ? "bg-brand bg-opacity-25" : "bg-light bg-opacity-5"} relative mt-4 rounded-sm border border-light border-opacity-25 text-center leading-none transition duration-75 ease-out ~px-2/4 ~pt-[.5rem]/[.625rem] ~pb-[.4rem]/2 hover:border-brand hover:border-opacity-50 hover:bg-brand hover:bg-opacity-15 hover:text-brand-2 focus:outline-brand`}
      >
        {isPending ? <span>Procesando...</span> : <span>Proceder Al Pago</span>}
      </button>
    </form>
  );
}
