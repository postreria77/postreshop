import { actions, isInputError } from "astro:actions";
import { navigate } from "astro:transitions/client";
import { useActionState } from "react";
import { experimental_withState as withState } from "@astrojs/react/actions";

import CheckoutProductsInput from "@/components/checkout/CheckoutProductsInput";
import FormInputError from "@/components/checkout/FormInputError";
import type { Sucursal } from "db/config";

import {
  Input,
  Select,
  SelectItem,
  DatePicker,
  TimeInput,
} from "@heroui/react";
import { today, getLocalTimeZone, Time } from "@internationalized/date";

export function CheckoutForm({ sucursales }: { sucursales: Sucursal[] }) {
  // const [{ data, error }, action, isPending] = useActionState(
  //   withState(actions.orders.create),
  //   {
  //     data: { message: "", url: "" },
  //     error: undefined,
  //   },
  // );
  //
  // const inputErrors = isInputError(error) ? error.fields : {};
  // const actionError = !isInputError(error) ? error : undefined;
  //
  // if (data?.url && !error) {
  //   return navigate(data.url);
  // }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    console.log(data);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <CheckoutProductsInput />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            type="text"
            name="nombre"
            id="nombre"
            aria-describedby="error-nombre"
            label="Nombre"
            isRequired
          />
          {/* {inputErrors.nombre && ( */}
          {/*   <FormInputError error={inputErrors.nombre} name="nombre" /> */}
          {/* )} */}
        </div>
        <div>
          <Input
            type="text"
            name="apellido"
            id="apellido"
            aria-describedby="error-apellido"
            label="Apellido"
          />
          {/* {inputErrors.nombre && ( */}
          {/*   <FormInputError error={inputErrors.nombre} name="apellido" /> */}
          {/* )} */}
        </div>
      </div>
      <div>
        <Input
          type="tel"
          name="tel"
          id="tel"
          aria-describedby="error-tel"
          label="Teléfono"
          isRequired
        />
        {/* {inputErrors.tel && ( */}
        {/*   <FormInputError error={inputErrors.tel} name="tel" /> */}
        {/* )} */}
      </div>
      <div>
        <Select name="sucursal" label="Selecciona una Sucursal" isRequired>
          {sucursales.map((sucursal) => (
            <SelectItem value={sucursal.id} key={sucursal.id}>
              {sucursal.name}
            </SelectItem>
          ))}
        </Select>
        {/* {inputErrors.sucursal && ( */}
        {/*   <FormInputError error={inputErrors.sucursal} name="sucursal" /> */}
        {/* )} */}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <DatePicker
            name="fecha"
            id="fecha"
            label="Fecha"
            maxValue={today(getLocalTimeZone()).add({ days: 30 })}
            minValue={today(getLocalTimeZone()).add({ days: 2 })}
            isRequired
          />
          {/* {inputErrors.fecha && ( */}
          {/*   <FormInputError error={inputErrors.fecha} name="fecha" /> */}
          {/* )} */}
        </div>
        <div>
          <TimeInput
            name="hora"
            id="hora"
            aria-describedby="error-hora"
            label="Hora"
            minValue={new Time(12)}
            maxValue={new Time(22)}
            granularity="hour"
            defaultValue={new Time(12)}
            isRequired
          />
        </div>
      </div>
      {/* {actionError?.message && ( */}
      {/*   <FormInputError error={actionError.message} name="form" /> */}
      {/* )} */}

      <button
        type="submit"
        // className={`${isPending ? "bg-brand bg-opacity-25" : "bg-light bg-opacity-5"} relative mt-4 w-full rounded-sm border border-light border-opacity-25 py-2 text-center leading-none transition duration-75 ease-out ~px-2/4 hover:border-brand hover:border-opacity-50 hover:bg-brand hover:bg-opacity-15 hover:text-brand-2 focus:outline-brand`}
        className="relative mt-4 w-full border border-light"
      >
        {/* {isPending ? <span>Procesando...</span> : <span>Proceder Al Pago</span>} */}
        <span>Proceder Al Pago</span>
      </button>
    </form>
  );
}
