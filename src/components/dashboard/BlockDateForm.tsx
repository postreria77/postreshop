import {
  DatePicker,
  Spinner,
  Select,
  SelectItem,
  CheckboxGroup,
  Checkbox,
} from "@heroui/react";
import type { CalendarDate } from "@heroui/react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useState, useEffect } from "react";

import { actions, isInputError } from "astro:actions";
import { useActionState } from "react";
import { experimental_withState as withState } from "@astrojs/react/actions";
import FormInputError, { FormSuccessMessage } from "../checkout/FormInputError";
import type { Sucursal, Pastel } from "db/config";

type BlockDateFormProps = {
  sucursales: Sucursal[];
  pasteles: Pastel[];
};

export default function BlockDateForm({
  sucursales,
  pasteles,
}: BlockDateFormProps) {
  const [blockType, setBlockType] = useState<string>("day");
  const [selectedSucursales, setSelectedSucursales] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [{ data, error }, action, isPending] = useActionState(
    withState(actions.orders.blockDate),
    {
      data: { message: "" },
      error: undefined,
    },
  );

  data?.message && console.log(data.message);

  const inputErrors = isInputError(error) ? error.fields : {};
  const actionError = !isInputError(error) ? error : undefined;

  // Reset form after successful submission
  useEffect(() => {
    if (data?.message && !error) {
      setBlockType("day");
      setSelectedSucursales([]);
      setSelectedProducts([]);
    }
  }, [data?.message, error]);

  const handleFormSubmit = (formData: FormData) => {
    // Validate selections based on block type
    if (blockType === "sucursales" && selectedSucursales.length === 0) {
      alert(
        "Debe seleccionar al menos una sucursal para este tipo de bloqueo.",
      );
      return;
    }

    if (blockType === "productos" && selectedProducts.length === 0) {
      alert("Debe seleccionar al menos un producto para este tipo de bloqueo.");
      return;
    }

    if (blockType === "sucursales-productos") {
      if (selectedSucursales.length === 0) {
        alert(
          "Debe seleccionar al menos una sucursal para este tipo de bloqueo.",
        );
        return;
      }
      if (selectedProducts.length === 0) {
        alert(
          "Debe seleccionar al menos un producto para este tipo de bloqueo.",
        );
        return;
      }
    }

    // Add the selected data to form data
    formData.set("blockType", blockType);
    if (selectedSucursales.length > 0) {
      formData.set("sucursalIds", JSON.stringify(selectedSucursales));
    }
    if (selectedProducts.length > 0) {
      formData.set("productIds", JSON.stringify(selectedProducts));
    }
    action(formData);
  };

  const getButtonText = () => {
    switch (blockType) {
      case "day":
        return "Bloquear Día Completo";
      case "sucursales":
        return "Bloquear Sucursales";
      case "productos":
        return "Bloquear Productos";
      case "sucursales-productos":
        return "Bloquear Productos para Sucursales";
      default:
        return "Bloquear";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Administrar Bloqueos de Fechas</h2>

      <form action={handleFormSubmit} method="POST" className="space-y-4">
        <DatePicker
          name="fecha"
          id="fecha"
          label="Fecha a Bloquear"
          minValue={
            today(getLocalTimeZone()).add({
              days: 1,
            }) as unknown as CalendarDate
          }
          isRequired
          radius="sm"
        />
        {inputErrors.fecha && (
          <FormInputError error={inputErrors.fecha} name="fecha" />
        )}

        <Select
          label="Tipo de Bloqueo"
          selectedKeys={[blockType]}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string;
            setBlockType(key);
            setSelectedSucursales([]);
            setSelectedProducts([]);
          }}
          radius="sm"
        >
          <SelectItem key="day">Bloquear día completo</SelectItem>
          <SelectItem key="sucursales">
            Bloquear sucursales específicas
          </SelectItem>
          <SelectItem key="productos">
            Bloquear productos específicos (globalmente)
          </SelectItem>
          <SelectItem key="sucursales-productos">
            Bloquear productos para sucursales específicas
          </SelectItem>
        </Select>

        {(blockType === "sucursales" ||
          blockType === "sucursales-productos") && (
          <div>
            <label className="mb-2 block text-sm font-medium">
              Seleccionar Sucursales:
              <span className="ml-1 text-red-500">*</span>
              {selectedSucursales.length > 0 && (
                <span className="ml-2 text-xs text-green-600">
                  ({selectedSucursales.length} seleccionada
                  {selectedSucursales.length > 1 ? "s" : ""})
                </span>
              )}
            </label>
            <CheckboxGroup
              value={selectedSucursales}
              onValueChange={setSelectedSucursales}
              orientation="vertical"
            >
              {sucursales.map((sucursal) => (
                <Checkbox key={sucursal.id} value={sucursal.id}>
                  {sucursal.name}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </div>
        )}

        {(blockType === "productos" || blockType === "sucursales-productos") && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Seleccionar Productos:
              <span className="text-red-500 ml-1">*</span>
              {selectedProducts.length > 0 && (
                <span className="text-green-600 text-xs ml-2">
                  ({selectedProducts.length} seleccionado{selectedProducts.length > 1 ? 's' : ''})
                </span>
              )}
            </label>
            <CheckboxGroup
              value={selectedProducts}
              onValueChange={setSelectedProducts}
              orientation="vertical"
              className="max-h-60 overflow-y-auto"
            >
              {pasteles.map((pastel) => (
                <div key={pastel.id} className="space-y-1">
                  <Checkbox value={pastel.precio}>
                    {pastel.nombre}
                  </Checkbox>
                  {pastel.precioAnytime && (
                    <Checkbox value={pastel.precioAnytime} className="ml-4">
                      {pastel.nombre} - Anytime
                    </Checkbox>
                  )}
                  {pastel.precioGift && (
                    <Checkbox value={pastel.precioGift} className="ml-4">
                      {pastel.nombre} - Gift
                    </Checkbox>
                  )}
                </div>
              ))}
            </CheckboxGroup>
          </div>
        )}

        {inputErrors.blockType && (
          <FormInputError error={inputErrors.blockType} name="blockType" />
        )}
        {inputErrors.sucursalIds && (
          <FormInputError error={inputErrors.sucursalIds} name="sucursalIds" />
        )}
        {inputErrors.productIds && (
          <FormInputError error={inputErrors.productIds} name="productIds" />
        )}
        {actionError?.message && (
          <FormInputError error={actionError.message} name="form" />
        )}

        <button
          type="submit"
          disabled={isPending}
          className={`${isPending ? "bg-brand bg-opacity-25" : "bg-light bg-opacity-5"} relative mt-4 w-full rounded-sm border border-light border-opacity-25 py-3 text-center leading-none transition duration-75 ease-out ~px-2/4 hover:border-brand hover:border-opacity-50 hover:bg-brand hover:bg-opacity-15 hover:text-brand-2 focus:outline-brand disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {isPending ? (
            <div className="mr-4 flex items-center justify-center gap-2">
              <Spinner size="sm" color="current" />
              <span>Procesando...</span>
            </div>
          ) : (
            <span>{getButtonText()}</span>
          )}
        </button>

        {data?.message && <FormSuccessMessage message={data?.message} />}
      </form>

      <div className="mt-8 rounded-lg border border-light bg-light/5 p-4">
        <h3 className="mb-2 text-lg font-medium">
          Información sobre Tipos de Bloqueo
        </h3>
        <ul className="space-y-1 text-sm font-light">
          <li>
            <div className="mr-2 inline-block size-2 rounded-full bg-red-300" />
            <strong className="mr-1 text-base font-medium">
              Día completo:
            </strong>{" "}
            Bloquea todas las entregas para la fecha seleccionada
          </li>
          <li>
            <div className="mr-2 inline-block size-2 rounded-full bg-yellow-300" />
            <strong className="mr-1 text-base font-medium">
              Sucursales específicas:
            </strong>{" "}
            Bloquea solo las sucursales seleccionadas para la fecha
          </li>
          <li>
            <div className="mr-2 inline-block size-2 rounded-full bg-blue-300" />
            <strong className="mr-1 text-base font-medium">
              Productos específicos:
            </strong>{" "}
            Bloquea los productos seleccionados en todas las sucursales para la
            fecha
          </li>
          <li>
            <div className="mr-2 inline-block size-2 rounded-full bg-orange-300" />
            <strong className="mr-1 text-base font-medium">
              Productos para sucursales:
            </strong>{" "}
            Bloquea los productos seleccionados solo en las sucursales
            seleccionadas para la fecha
          </li>
        </ul>
      </div>
    </div>
  );
}
