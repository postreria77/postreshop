import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  TableColumn,
  Pagination,
} from "@heroui/react";

import type { Order } from "db/config";
import { useMemo, useState } from "react";

const rows = [
  {
    key: 1,
    id: 1,
    nombre: "John Doe",
    estado: "Pagado",
    fecha: "2025-02-14",
  },
];

const columns = [
  { key: "id", label: "ID" },
  { key: "nombre", label: "Nombre" },
  { key: "tel", label: "Teléfono" },
  { key: "sucursal", label: "Sucursal" },
  { key: "fecha", label: "Fecha" },
];

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const pages = Math.ceil(orders.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return orders.slice(start, end);
  }, [page, orders]);

  return (
    <Table aria-label="Future Orders" selectionMode="single"
      bottomContent={
        <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="secondary"
            page={page}
            total={pages}
            onChange={(page) => setPage(page)}
          />
        </div>
      }>
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={items}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{getKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
