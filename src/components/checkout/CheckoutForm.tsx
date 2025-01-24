import { actions, isInputError } from "astro:actions";
import { navigate } from "astro:transitions/client";
import { useActionState } from "react";
import { experimental_withState as withState } from "@astrojs/react/actions";

import CheckoutProductsInput from "@/components/checkout/CheckoutProductsInput";
import FormInputError from "@/components/checkout/FormInputError";
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
      <div className="grid grid-cols-2 gap-4">
        <label htmlFor="nombre" className="mb-4">
          Nombre
          {inputErrors.nombre && (
            <FormInputError error={inputErrors.nombre} name="nombre" />
          )}
          <input
            type="text"
            name="nombre"
            id="nombre"
            aria-describedby="error-nombre"
            placeholder="John"
            className="mt-1 min-h-5 w-full rounded-md border border-light/15 bg-transparent px-3 py-2 leading-none text-light placeholder:text-light/35 hover:bg-light/5 focus:outline focus:outline-1 focus:outline-light/25"
          />
        </label>
        <label htmlFor="apellido" className="mb-4">
          Apellido
          {inputErrors.nombre && (
            <FormInputError error={inputErrors.nombre} name="apellido" />
          )}
          <input
            type="text"
            name="apellido"
            id="apellido"
            aria-describedby="error-apellido"
            placeholder="Doe"
            className="mt-1 min-h-5 w-full rounded-md border border-light/15 bg-transparent px-3 py-2 leading-none text-light placeholder:text-light/35 hover:bg-light/5 focus:outline focus:outline-1 focus:outline-light/25"
          />
        </label>
      </div>
      <label htmlFor="tel" className="mb-4">
        Teléfono
        {inputErrors.tel && (
          <FormInputError error={inputErrors.tel} name="tel" />
        )}
        <input
          type="tel"
          name="tel"
          id="tel"
          aria-describedby="error-tel"
          placeholder="8112345678"
          className="mt-1 min-h-5 w-full rounded-md border border-light/15 bg-transparent px-3 py-2 leading-none text-light placeholder:text-light/35 hover:bg-light/5 focus:outline focus:outline-1 focus:outline-light/25"
        />
      </label>
      <label htmlFor="sucursal" className="mb-4">
        Sucursal
        {inputErrors.sucursal && (
          <FormInputError error={inputErrors.sucursal} name="sucursal" />
        )}
        <select
          name="sucursal"
          id="sucursal"
          aria-describedby="error-sucursal"
          className="mt-1 min-h-5 w-full rounded-md border border-light/15 bg-transparent px-3 py-2 leading-none text-light placeholder:text-light/35 hover:bg-light/5 focus:outline focus:outline-1 focus:outline-light/25"
          defaultValue=""
          required
        >
          {sucursales.map((sucursal) => (
            <option value={sucursal.id} key={sucursal.id}>
              {sucursal.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label htmlFor="fecha" className="mb-4">
          Fecha
          {inputErrors.fecha && (
            <FormInputError error={inputErrors.fecha} name="fecha" />
          )}
          <input
            type="date"
            name="fecha"
            id="fecha"
            aria-describedby="error-fecha"
            className="mt-1 min-h-5 w-full rounded-md border border-light/15 bg-transparent px-3 py-2 leading-none text-light placeholder:text-light/35 hover:bg-light/5 focus:outline focus:outline-1 focus:outline-light/25"
            min={new Date().toISOString().slice(0, 16)}
            required
          />
        </label>
        <label htmlFor="hora" className="mb-4">
          Hora
          {inputErrors.fecha && (
            <FormInputError error={inputErrors.fecha} name="hora" />
          )}
          <input
            type="time"
            name="hora"
            id="hora"
            aria-describedby="error-hora"
            className="mt-1 min-h-5 w-full rounded-md border border-light/15 bg-transparent px-3 py-2 leading-none text-light placeholder:text-light/35 hover:bg-light/5 focus:outline focus:outline-1 focus:outline-light/25"
            min="12:00"
            max="20:00"
            required
          />
        </label>
      </div>
      {actionError?.message && (
        <FormInputError error={actionError.message} name="form" />
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
