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
import type { OrderProductDetalle } from "@/pages/api/dashboard/orders/[page].json";
import { formatDateTimeString } from "@/lib/format";

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [buscar, setBuscar] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (fecha) params.set("fecha", fecha);
    if (buscar) params.set("buscar", buscar);
    params.set("sort", sort);
    const response = await fetch(`/api/dashboard/orders/${currentPage}.json?${params.toString()}`);
    const data = await response.json();
    setOrders(data.orders);
    setTotalPages(data.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [fecha, sort, buscar]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, fecha, sort, buscar]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-64 rounded-md border border-light/20 bg-transparent px-3 py-1.5 text-xs text-white placeholder-light/40 focus:outline-none focus:border-brand"
        />
        {buscar && (
          <button
            onClick={() => setBuscar("")}
            className="rounded-md border border-light/20 px-3 py-1.5 text-xs text-light/60 hover:text-white"
          >
            Limpiar
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="rounded-md border border-light/20 bg-transparent px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand"
        />
        {fecha && (
          <button
            onClick={() => setFecha("")}
            className="rounded-md border border-light/20 px-3 py-1.5 text-xs text-light/60 hover:text-white"
          >
            Limpiar
          </button>
        )}
        <button
          onClick={() => setSort(sort === "desc" ? "asc" : "desc")}
          className="rounded-md border border-light/20 px-3 py-1.5 text-xs text-light/60 hover:text-white"
        >
          Fecha entrega: {sort === "desc" ? "↓ Más reciente" : "↑ Más antigua"}
        </button>
      </div>

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
            <TableColumn>Productos</TableColumn>
            <TableColumn>Teléfono</TableColumn>
            <TableColumn>Email</TableColumn>
            <TableColumn>Estado</TableColumn>
            <TableColumn>Sucursal</TableColumn>
            <TableColumn>Fecha entrega</TableColumn>
            <TableColumn>Pedido creado</TableColumn>
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
                <TableCell className="~text-xs/sm">
                  <div className="flex flex-col gap-0.5">
                    {((order as any).productosDetalle as OrderProductDetalle[])?.map((p, i) => (
                      <span key={i} className="capitalize">
                        {p.nombre} ×{p.cantidad}{" "}
                        <span className="text-light/50">({p.presentacion})</span>
                      </span>
                    ))}
                  </div>
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
                  {formatDateTimeString(order.fecha)}
                </TableCell>
                <TableCell className="~text-xs/sm">
                  {formatDateTimeString(order.creado)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
