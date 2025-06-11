import { Card, CardBody, CardHeader, Button, Spinner } from "@heroui/react";
import type { DisabledDateTime } from "db/config";
import { actions, isInputError } from "astro:actions";
import { useActionState } from "react";
import { experimental_withState as withState } from "@astrojs/react/actions";
import { useState } from "react";

type BlockedDatesListProps = {
  blockedDates: DisabledDateTime[];
};

export default function BlockedDatesList({
  blockedDates,
}: BlockedDatesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [{ data, error }, deleteAction] = useActionState(
    withState(actions.orders.deleteBlockedDate),
    {
      data: { message: "" },
      error: undefined,
    },
  );

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de que desea eliminar este bloqueo?")) {
      setDeletingId(id);
      const formData = new FormData();
      formData.set("id", id);
      await deleteAction(formData);
      setDeletingId(null);
      // Refresh the page to show updated list
      window.location.reload();
    }
  };
  if (blockedDates.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-medium">Fechas Bloqueadas</h3>
        <p className="text-gray-500">No hay fechas bloqueadas actualmente.</p>
      </div>
    );
  }

  const formatBlockedDate = (blockedDate: DisabledDateTime) => {
    if (blockedDate.dayDisabled) {
      return {
        type: "Día completo",
        description: "Todas las entregas bloqueadas",
        color: "bg-red-300 bg-opacity-5 border-red-300",
      };
    }

    let sucursales: string[] = [];
    let productos: string[] = [];

    // Parse sucursales
    if (blockedDate.sucursales) {
      if (Array.isArray(blockedDate.sucursales)) {
        sucursales = blockedDate.sucursales as string[];
      } else if (typeof blockedDate.sucursales === "string") {
        try {
          sucursales = JSON.parse(blockedDate.sucursales);
        } catch {
          sucursales = [];
        }
      }
    }

    // Parse productos
    if (blockedDate.productos) {
      if (Array.isArray(blockedDate.productos)) {
        productos = blockedDate.productos as string[];
      } else if (typeof blockedDate.productos === "string") {
        try {
          productos = JSON.parse(blockedDate.productos);
        } catch {
          productos = [];
        }
      }
    }

    if (sucursales.length > 0 && productos.length > 0) {
      return {
        type: "Productos específicos para sucursales específicas",
        description: `${productos.length} producto(s) bloqueado(s) para ${sucursales.length} sucursal(es)`,
        color: "bg-orange-300 bg-opacity-5 border-orange-300",
        details: { sucursales, productos },
      };
    } else if (sucursales.length > 0) {
      return {
        type: "Sucursales específicas",
        description: `${sucursales.length} sucursal(es) bloqueada(s)`,
        color: "bg-yellow-300 bg-opacity-5 border-yellow-300",
        details: { sucursales },
      };
    } else if (productos.length > 0) {
      return {
        type: "Productos específicos (global)",
        description: `${productos.length} producto(s) bloqueado(s) globalmente`,
        color: "bg-blue-300 bg-opacity-5 border-blue-300",
        details: { productos },
      };
    }

    return {
      type: "Restricción de tiempo",
      description: blockedDate.time
        ? `Horarios bloqueados: ${blockedDate.time}`
        : "Restricción personalizada",
      color: "bg-purple-300 bg-opacity-5 border-purple-300",
    };
  };

  // Group by date
  const groupedByDate = blockedDates.reduce(
    (acc, blockedDate) => {
      if (!acc[blockedDate.date]) {
        acc[blockedDate.date] = [];
      }
      acc[blockedDate.date].push(blockedDate);
      return acc;
    },
    {} as Record<string, DisabledDateTime[]>,
  );

  // Sort dates
  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div className="mt-8 pb-8">
      <h3 className="mb-4 text-lg font-medium">Fechas Bloqueadas</h3>
      {data?.message && (
        <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-3">
          <p className="text-sm text-green-700">{data.message}</p>
        </div>
      )}
      {error && !isInputError(error) && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error.message}</p>
        </div>
      )}
      <div className="space-y-4">
        {sortedDates.map((date) => (
          <Card key={date} className="border">
            <CardHeader className="pb-2">
              <h4 className="text-md font-semibold capitalize">
                {new Date(date + "T00:00:00").toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h4>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-2">
                {groupedByDate[date].map((blockedDate, index) => {
                  const format = formatBlockedDate(blockedDate);
                  return (
                    <div
                      key={`${date}-${index}`}
                      className={`rounded-lg border p-3 ${format.color}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium capitalize">
                            {format.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format.description}
                          </p>
                          {format.details && (
                            <div className="mt-2 text-xs">
                              {format.details.sucursales && (
                                <p>
                                  <strong>Sucursales:</strong>{" "}
                                  {format.details.sucursales.join(", ")}
                                </p>
                              )}
                              {format.details.productos && (
                                <p>
                                  <strong>Productos:</strong>{" "}
                                  {format.details.productos.join(", ")}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-gray-400">
                            ID: {blockedDate.id}
                          </span>
                          <Button
                            size="sm"
                            color="danger"
                            variant="ghost"
                            onClick={() => handleDelete(blockedDate.id)}
                            disabled={deletingId === blockedDate.id}
                            className="h-6 min-w-16 text-xs"
                          >
                            {deletingId === blockedDate.id ? (
                              <Spinner size="sm" color="current" />
                            ) : (
                              "Eliminar"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
