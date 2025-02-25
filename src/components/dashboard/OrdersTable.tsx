import {
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Pagination,
} from "@heroui/react";
import { useEffect, useState } from "react";
import type { Order } from "db/config";
import { formatDateString } from "@/lib/format";

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const response = await fetch(`/api/dashboard/orders/${currentPage}.json`);
    const data = await response.json();
    setOrders(data.orders);
    setTotalPages(data.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  return (
    <div>
      {loading ? (
        <Spinner color="white" />
      ) : (
        <Table
          aria-label="Orders table"
          removeWrapper
          className="w-full overflow-scroll text-xs"
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                color="primary"
                page={currentPage}
                total={totalPages}
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          }
        >
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Nombre</TableColumn>
            <TableColumn>Teléfono</TableColumn>
            <TableColumn>Email</TableColumn>
            <TableColumn>Estado</TableColumn>
            <TableColumn>Sucursal</TableColumn>
            <TableColumn>Fecha</TableColumn>
          </TableHeader>
          <TableBody className="overflow-x-scroll">
            {orders.map((order: Order) => (
              <TableRow
                key={order.id}
                className="group cursor-pointer border-y border-light/5 first:border-t-0 hover:bg-light/5"
              >
                <TableCell className="">
                  <div className="rounded-full border border-brand/50 px-[0.35rem] py-1 text-center leading-none group-hover:bg-brand/15">
                    {order.id}
                  </div>
                </TableCell>
                <TableCell className="capitalize ~text-xs/sm">
                  {order.nombre}
                </TableCell>
                <TableCell className="~text-xs/sm">{order.tel}</TableCell>
                <TableCell className="~text-xs/sm">{order.email}</TableCell>
                <TableCell className="~text-xs/sm">
                  <div
                    className={`rounded-full border px-2 py-1 text-center leading-none ${order.estado === "Pagado" ? "border-green-600 text-green-600 group-hover:bg-green-600/15" : "border-yellow-600 text-yellow-600 group-hover:bg-yellow-600/15"}`}
                  >
                    {order.estado}
                  </div>
                </TableCell>
                <TableCell className="~text-xs/sm">{order.sucursal}</TableCell>
                <TableCell className="~text-xs/sm">
                  {formatDateString(order.fecha)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
