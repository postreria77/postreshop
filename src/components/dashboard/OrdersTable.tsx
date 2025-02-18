import {
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import Button from "../ui/Button";
import { useEffect, useState } from "react";
import type { Order } from "db/config";

const columns = [
  { key: "id", label: "ID" },
  { key: "nombre", label: "Nombre" },
  { key: "tel", label: "Teléfono" },
  { key: "sucursal", label: "Sucursal" },
  { key: "fecha", label: "Fecha" },
];

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

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  return (
    <div>
      {loading ? (
        <Spinner color="white" />
      ) : (
        <Table aria-label="Orders table" removeWrapper>
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Nombre</TableColumn>
            <TableColumn>Teléfono</TableColumn>
            <TableColumn>Email</TableColumn>
            <TableColumn>Sucursal</TableColumn>
            <TableColumn>Fecha</TableColumn>
          </TableHeader>
          <TableBody>
            {orders.map((order: Order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.nombre}</TableCell>
                <TableCell>{order.tel}</TableCell>
                <TableCell>{order.email}</TableCell>
                <TableCell>{order.sucursal}</TableCell>
                <TableCell>{order.fecha}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="mt-4 flex justify-between pb-4">
        <div className="flex gap-4">
          <button
            className="relative rounded-sm border border-light border-opacity-25 bg-light/5 py-3 text-center leading-none transition duration-75 ease-out ~px-2/4 hover:border-brand hover:border-opacity-50 hover:bg-brand hover:bg-opacity-15 hover:text-brand-2 focus:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleFirstPage}
            disabled={currentPage === 1}
          >
            Inicio
          </button>
          <button
            className="relative rounded-sm border border-light border-opacity-25 bg-light/5 py-3 text-center leading-none transition duration-75 ease-out ~px-2/4 hover:border-brand hover:border-opacity-50 hover:bg-brand hover:bg-opacity-15 hover:text-brand-2 focus:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
        </div>
        <div className="flex gap-4">
          <button
            className="relative rounded-sm border border-light border-opacity-25 bg-light/5 py-3 text-center leading-none transition duration-75 ease-out ~px-2/4 hover:border-brand hover:border-opacity-50 hover:bg-brand hover:bg-opacity-15 hover:text-brand-2 focus:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
          <button
            className="relative rounded-sm border border-light border-opacity-25 bg-light/5 py-3 text-center leading-none transition duration-75 ease-out ~px-2/4 hover:border-brand hover:border-opacity-50 hover:bg-brand hover:bg-opacity-15 hover:text-brand-2 focus:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
          >
            Último
          </button>
        </div>
      </div>
    </div>
  );
}
