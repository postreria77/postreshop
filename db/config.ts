import { defineDb, defineTable, column } from "astro:db";

// https://astro.build/db/config

const Orders = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    productos: column.json(),
    tel: column.text(),
    nombre: column.text(),
    sucursal: column.number(),
    fecha: column.text(),
  },
});

export type Order = {
  id: string;
  productos: string;
  tel: string;
  nombre: string;
  sucursal: number;
  fecha: string;
};

export type OrderProduct = {
  id: number | string;
  cantidad: number;
  stripePriceId: string;
  presentacion: string;
};

export type SystemOrder = {
  productos: [
    {
      producto: string; //id,
      cantidad: number;
      presentacion: string; //id,
      precioProducto: number; // 0,
      precioPresentacion: number; // precio real,
      comentarios: string;
    },
  ];
  telefono: string;
  nombre: string;
  sucursalId: number;
  fechaPedido: string;
  direccion: string; //empty,
  calle: string; //empty,
  numeroExterior: string; //empty,
  numeroInterior: string; //empty,
  colonia: string; //empty,
  municipio: string; //empty,
  referencia: string; //empty,
};

export default defineDb({
  tables: {
    Orders,
  },
});
