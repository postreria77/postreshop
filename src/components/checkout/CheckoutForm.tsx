import { actions, isInputError } from "astro:actions";
import { navigate } from "astro:transitions/client";
import { useActionState, useState } from "react";
import { experimental_withState as withState } from "@astrojs/react/actions";

import CheckoutProductsInput from "@/components/checkout/CheckoutProductsInput";
import FormInputError from "@/components/checkout/FormInputError";
import { DateTimeSelector } from "@/components/checkout/DateTimeSelector";
import type { Sucursal, DisabledDateTime } from "db/config";

import { Input, Select, SelectItem, Spinner } from "@heroui/react";
import {
  PRESENTACIONES_DISCOUNT,
  PRESENTACIONES_PRICE,
} from "@/lib/pricesConfig";

type CheckoutFormProps = {
  sucursales: Sucursal[];
  disabledDates: DisabledDateTime[];
  test?: Boolean;
};

export function CheckoutForm({
  sucursales,
  disabledDates,
  test = false,
}: CheckoutFormProps) {
  const [{ data, error }, action, isPending] = useActionState(
    withState(actions.orders.create),
    {
      data: { message: "", url: "" },
      error: undefined,
    },
  );

  const [selectedSucursal, setSelectedSucursal] = useState<string>("");

  // Form state to persist values on error
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tel: "",
    email: "",
  });

  const handleSucursalChange = (keys: "all" | Set<React.Key>) => {
    if (keys !== "all" && keys.size > 0) {
      const sucursalId = Array.from(keys)[0] as string;
      setSelectedSucursal(sucursalId);
    } else {
      setSelectedSucursal("");
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const inputErrors = isInputError(error) ? error.fields : {};
  const actionError = !isInputError(error) ? error : undefined;

  if (data?.url && !error) {
    return navigate(data.url);
  }

  return (
    <form className="sticky top-32 space-y-4" method="POST" action={action}>
      {test ? (
        <input
          type="hidden"
          hidden
          name="productos"
          value={JSON.stringify([
            {
              id: "358",
              id_pasteleria: "98",
              cantidad: 1,
              precio:
                PRESENTACIONES_PRICE.tradicional -
                PRESENTACIONES_DISCOUNT.tradicional,
              stripePriceId: "price_1R1ZPq2N0hejjjHDsXDKhJbn",
              presentacion: "gift",
            },
          ])}
        />
      ) : (
        <CheckoutProductsInput />
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            type="text"
            name="nombre"
            id="nombre"
            aria-describedby="error-nombre"
            label="Nombre"
            isRequired
            radius="sm"
            errorMessage={"Ingresa un nombre"}
            value={formData.nombre}
            onChange={(e) => handleInputChange("nombre", e.target.value)}
          />
          {inputErrors.nombre && (
            <FormInputError error={inputErrors.nombre} name="nombre" />
          )}
        </div>
        <div>
          <Input
            type="text"
            name="apellido"
            id="apellido"
            aria-describedby="error-apellido"
            label="Apellido"
            radius="sm"
            value={formData.apellido}
            onChange={(e) => handleInputChange("apellido", e.target.value)}
          />
          {inputErrors.apellido && (
            <FormInputError error={inputErrors.apellido} name="apellido" />
          )}
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
          radius="sm"
          errorMessage={"Ingresa un teléfono"}
          value={formData.tel}
          onChange={(e) => handleInputChange("tel", e.target.value)}
        />
        {inputErrors.tel && (
          <FormInputError error={inputErrors.tel} name="tel" />
        )}
      </div>
      <div>
        <Input
          type="email"
          name="email"
          id="email"
          aria-describedby="error-email"
          label="Email"
          isRequired
          radius="sm"
          errorMessage={"Ingresa un email"}
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
        />
        {inputErrors.email && (
          <FormInputError error={inputErrors.email} name="email" />
        )}
      </div>
      <div>
        <Select
          name="sucursal"
          label="Selecciona una Sucursal"
          isRequired
          radius="sm"
          errorMessage={"Selecciona una sucursal"}
          onSelectionChange={handleSucursalChange}
        >
          {sucursales.map((sucursal) => (
            <SelectItem value={sucursal.id} key={sucursal.id}>
              {sucursal.name}
            </SelectItem>
          ))}
        </Select>
        {inputErrors.sucursal && (
          <FormInputError error={inputErrors.sucursal} name="sucursal" />
        )}
      </div>
      <DateTimeSelector
        disabledDates={disabledDates}
        inputErrors={inputErrors}
        selectedSucursalId={selectedSucursal}
      />
      {actionError?.message && (
        <FormInputError error={actionError.message} name="form" />
      )}
      <button
        type="submit"
        className={`${
          isPending ? "bg-brand bg-opacity-25" : "bg-light bg-opacity-5"
        } relative mt-4 w-full rounded-sm border border-light border-opacity-25 py-3 text-center leading-none transition duration-75 ease-out ~px-2/4 hover:border-brand hover:border-opacity-50 hover:bg-brand hover:bg-opacity-15 hover:text-brand-2 focus:outline-brand`}
      >
        {isPending ? (
          <div className="mr-4 flex items-center justify-center gap-2">
            <Spinner size="sm" color="current" />
            <span>Procesando...</span>
          </div>
        ) : (
          <span>Proceder Al Pago</span>
        )}
      </button>
    </form>
  );
}
