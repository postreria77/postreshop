import { DatePicker, Spinner } from "@heroui/react";
import type { CalendarDate } from "@heroui/react";
import { getLocalTimeZone, today } from "@internationalized/date";

import { actions, isInputError } from "astro:actions";
import { useActionState } from "react";
import { experimental_withState as withState } from "@astrojs/react/actions";
import FormInputError from "../checkout/FormInputError";

export default function BlockDateForm() {
  const [{ data, error }, action, isPending] = useActionState(
    withState(actions.orders.lockDate),
    {
      data: { message: "" },
      error: undefined,
    },
  );

  data?.message && console.log(data.message);

  const inputErrors = isInputError(error) ? error.fields : {};
  const actionError = !isInputError(error) ? error : undefined;

  return (
    <form action={action} method="POST">
      <DatePicker
        name="fecha"
        id="fecha"
        label="Fecha"
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
      {actionError?.message && (
        <FormInputError error={actionError.message} name="form" />
      )}
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
          <span>Bloquear Fecha</span>
        )}
      </button>
    </form>
  );
}
