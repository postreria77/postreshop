import { useState } from "react";
import { DatePicker, TimeInput } from "@heroui/react";
import {
  today,
  getLocalTimeZone,
  Time,
  type DateValue,
  type TimeInputValue,
} from "@internationalized/date";
import type { DisabledDateTime } from "db/config";
import FormInputError from "@/components/checkout/FormInputError";

type DateTimeSelectorProps = {
  disabledDates: DisabledDateTime[];
  inputErrors: Record<string, string[]>;
  selectedSucursalId?: string;
  onDateChange?: (date: DateValue | Date | null) => void;
  onTimeChange?: (time: TimeInputValue | null) => void;
};

export function DateTimeSelector({
  disabledDates,
  inputErrors,
  selectedSucursalId,
  onDateChange,
  onTimeChange,
}: DateTimeSelectorProps) {
  const [date, setDate] = useState<DateValue | Date | null>(null);
  const [time, setTime] = useState<TimeInputValue | null>(new Time(13));

  const formatDateToString = (date: DateValue | Date): string => {
    if (date instanceof Date) {
      return date.toISOString().split("T")[0];
    } else {
      // Handle DateValue from @internationalized/date
      // Ensure month is padded with leading zero if needed
      const month = date.month.toString().padStart(2, "0");
      // Ensure day is padded with leading zero if needed
      const day = date.day.toString().padStart(2, "0");
      return `${date.year}-${month}-${day}`;
    }
  };

  const isDateUnavailable = (date: DateValue | Date): boolean => {
    const formattedSelectedDate = formatDateToString(date);

    return disabledDates.some((disabledDate) => {
      // Check if this date matches
      if (disabledDate.date !== formattedSelectedDate) {
        return false;
      }

      // If the entire day is disabled, disable it regardless of sucursal
      if (disabledDate.dayDisabled === true) {
        return true;
      }

      // If there's a sucursal restriction and a sucursal is selected
      if (disabledDate.sucursales && selectedSucursalId) {
        let sucursalesArray;
        if (Array.isArray(disabledDate.sucursales)) {
          sucursalesArray = disabledDate.sucursales;
        } else if (typeof disabledDate.sucursales === "string") {
          try {
            sucursalesArray = JSON.parse(disabledDate.sucursales);
          } catch {
            sucursalesArray = [];
          }
        } else {
          sucursalesArray = [];
        }

        // Disable if the selected sucursal is in the disabled sucursales list
        return sucursalesArray.includes(selectedSucursalId);
      }

      return false;
    });
  };

  const validateTime = (value: TimeInputValue): true | string | string[] => {
    if (!date) {
      return true;
    }

    const formattedSelectedDate = formatDateToString(date);

    const matchingDateEntry = disabledDates.find(
      (dt) => dt.date === formattedSelectedDate,
    );

    if (!matchingDateEntry) return true;

    if (matchingDateEntry.dayDisabled) {
      return "La fecha está agotada";
    }

    if (matchingDateEntry.time) {
      const disabledTimes = matchingDateEntry.time.split(",");
      const selectedTimeStr = `${value.hour}:00`;
      if (disabledTimes.includes(selectedTimeStr)) {
        return "La hora está agotada";
      }
    }
    return true;
  };

  const handleDateChange = (newDate: DateValue | Date | null) => {
    setDate(newDate);
    onDateChange?.(newDate);
  };

  const handleTimeChange = (newTime: TimeInputValue | null) => {
    setTime(newTime);
    onTimeChange?.(newTime);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <DatePicker
          name="fecha"
          id="fecha"
          label="Fecha"
          value={date}
          onChange={handleDateChange}
          maxValue={today(getLocalTimeZone()).add({ days: 30 })}
          minValue={today(getLocalTimeZone()).add({ days: 2 })}
          isDateUnavailable={isDateUnavailable}
          isRequired
          radius="sm"
          errorMessage={"Selecciona una fecha"}
        />
        {inputErrors.fecha && (
          <FormInputError error={inputErrors.fecha} name="fecha" />
        )}
      </div>
      <div>
        <TimeInput
          name="hora"
          id="hora"
          aria-describedby="error-hora"
          label="Hora"
          value={time}
          onChange={handleTimeChange}
          minValue={new Time(13)}
          maxValue={new Time(22)}
          granularity="hour"
          defaultValue={new Time(13)}
          isRequired
          radius="sm"
          validate={validateTime}
        />
      </div>
    </div>
  );
}
