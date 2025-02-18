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

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
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
      <div className="mt-4 flex justify-between">
        <button
          className="relative rounded-sm border border-light border-opacity-25 bg-light/5 py-3 text-center leading-none transition duration-75 ease-out ~px-2/4 hover:border-brand hover:border-opacity-50 hover:bg-brand hover:bg-opacity-15 hover:text-brand-2 focus:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          className="relative rounded-sm border border-light border-opacity-25 bg-light/5 py-3 text-center leading-none transition duration-75 ease-out ~px-2/4 hover:border-brand hover:border-opacity-50 hover:bg-brand hover:bg-opacity-15 hover:text-brand-2 focus:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

{
  /* <table className="border border-light/15"> */
}
{
  /*   <thead> */
}
{
  /*     <tr className="border border-light/15 bg-dark-2"> */
}
{
  /*       <th className="px-4 py-2 font-normal">ID</th> */
}
{
  /*       <th className="px-4 py-2 font-normal">Nombre</th> */
}
{
  /*       <th className="px-4 py-2 font-normal">Teléfono</th> */
}
{
  /*       <th className="px-4 py-2 font-normal">Email</th> */
}
{
  /*       <th className="px-4 py-2 font-normal">Sucursal</th> */
}
{
  /*       <th className="px-4 py-2 font-normal">Fecha</th> */
}
{
  /*     </tr> */
}
{
  /*   </thead> */
}
{
  /*   <tbody> */
}
{
  /*     {orders && */
}
{
  /*       orders.map((order: Order) => ( */
}
{
  /*         <tr key={order.id}> */
}
{
  /*           <td className="border-y border-light/5 px-4 py-2"> */
}
{
  /*             {order.id} */
}
{
  /*           </td> */
}
{
  /*           <td className="border-y border-light/5 px-4 py-2"> */
}
{
  /*             {order.nombre} */
}
{
  /*           </td> */
}
{
  /*           <td className="border-y border-light/5 px-4 py-2"> */
}
{
  /*             {order.tel} */
}
{
  /*           </td> */
}
{
  /*           <td className="border-y border-light/5 px-4 py-2"> */
}
{
  /*             {order.email} */
}
{
  /*           </td> */
}
{
  /*           <td className="border-y border-light/5 px-4 py-2"> */
}
{
  /*             {order.sucursal} */
}
{
  /*           </td> */
}
{
  /*           <td className="border-y border-light/5 px-4 py-2"> */
}
{
  /*             {order.fecha} */
}
{
  /*           </td> */
}
{
  /*         </tr> */
}
{
  /*       ))} */
}
{
  /*   </tbody> */
}
{
  /* </table> */
}
