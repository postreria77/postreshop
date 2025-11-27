import { useState, useMemo } from "react";
import { DatePicker, TimeInput } from "@heroui/react";
import { today, getLocalTimeZone, Time } from "@internationalized/date";
import type { DisabledDateTime } from "db/config";
import FormInputError from "@/components/checkout/FormInputError";

type DateTimeSelectorProps = {
  disabledDates: DisabledDateTime[];
  inputErrors: Record<string, string[]>;
  selectedSucursalId?: string;
  onDateChange?: (date: any) => void;
  onTimeChange?: (time: any) => void;
};

export function DateTimeSelector({
  disabledDates,
  inputErrors,
  selectedSucursalId,
  onDateChange,
  onTimeChange,
}: DateTimeSelectorProps) {
  const [date, setDate] = useState<any>(null);
  const [time, setTime] = useState<any>(new Time(13));

  // Memoized minimum date that reacts to selectedSucursalId changes
  const minimumDate = useMemo(() => {
    const monterreyTimeZone = "America/Monterrey";
    const now = new Date();

    // Get current time in Monterrey timezone
    const monterreyTime = new Intl.DateTimeFormat("en-CA", {
      timeZone: monterreyTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const currentHour = parseInt(
      monterreyTime.find((part) => part.type === "hour")?.value || "0",
    );

    const currentMinute = parseInt(
      monterreyTime.find((part) => part.type === "minute")?.value || "0",
    );

    // Get current day of week in Monterrey timezone (0 = Sunday, 1 = Monday, etc.)
    const monterreyDate = new Date().toLocaleDateString("en-CA", {
      timeZone: monterreyTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [year, month, day] = monterreyDate.split("-").map(Number);
    const monterreyDateObj = new Date(year, month - 1, day);
    const isSunday = monterreyDateObj.getDay() === 0;

    let extraDays = 1;

    switch (selectedSucursalId) {
      case "536":
      case "49":
        extraDays = currentHour >= 20 ? 2 : 1;
        break;
      case "109":
      case "50":
      case "520":
        if (isSunday) {
          extraDays = 2;
        } else {
          extraDays = currentHour >= 15 ? 2 : 1;
        }
        break;
      default:
        extraDays =
          currentHour > 21 || (currentHour === 21 && currentMinute >= 30)
            ? 2
            : 1;
        break;
    }
    return today(getLocalTimeZone()).add({ days: extraDays });
  }, [selectedSucursalId]);

  const formatDateToString = (date: any): string => {
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
  const getSpecialTimeWindow = (selectedDate: any):
    | { min: Time; max: Time }
    | null => {
    if (!selectedDate) return null;

    const formattedSelectedDate = formatDateToString(selectedDate);
    const [, month, day] = formattedSelectedDate.split("-");
    const mmdd = `${month}-${day}`;

    // 24 y 31 de diciembre → 1 pm a 5 pm
    if (mmdd === "12-24" || mmdd === "12-31") {
      return { min: new Time(13), max: new Time(17) };
    }

    // 25 de diciembre y 1 de enero → 3 pm a 7 pm
    if (mmdd === "12-25" || mmdd === "01-01") {
      return { min: new Time(15), max: new Time(19) };
    }

    return null;
  };

  const isDateUnavailable = (date: any): boolean => {
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
      if (
        disabledDate.sucursales &&
        !disabledDate.productos &&
        selectedSucursalId
      ) {
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

  const validateTime = (value: any): true | string | string[] => {
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

  const handleDateChange = (newDate: any) => {
    setDate(newDate);
    onDateChange?.(newDate);
    
  };

  const handleTimeChange = (newTime: any) => {
    setTime(newTime);
    onTimeChange?.(newTime);
  };
 // 🔔 Calcular ventana de horarios según la fecha seleccionada
  const specialTimeWindow = getSpecialTimeWindow(date);
  const minTime = specialTimeWindow ? specialTimeWindow.min : new Time(13);
  const maxTime = specialTimeWindow ? specialTimeWindow.max : new Time(22);
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <DatePicker
          name="fecha"
          id="fecha"
          label="Fecha"
          value={date}
          onChange={handleDateChange}
          maxValue={today(getLocalTimeZone()).add({ days: 30 }) as any}
          minValue={minimumDate as any}
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
        minValue={minTime as any}        // 👉 antes: new Time(13)
          maxValue={maxTime as any}        // 👉 antes: new Time(22)
          granularity="hour"
defaultValue={minTime as any}    // 👉 antes: new Time(13)          isRequired
          radius="sm"
          validate={validateTime}
        />
      </div>
    </div>
  );
}
