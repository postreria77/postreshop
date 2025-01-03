import { defineDb, defineTable, column } from "astro:db";

// https://astro.build/db/config
const Pasteles = defineTable({
  columns: {
    id: column.text({ primaryKey: true, autoIncrement: true }),
    nombre: column.text(),
    descripcion: column.text(),
    precio: column.text(),
    imagen: column.text(),
    precioAnytime: column.text({ optional: true }),
    imagenAnytime: column.text({ optional: true }),
    categoria: column.text({ default: "Pasteles" }),
    nuevo: column.boolean({ default: false }),
    archived: column.boolean({ default: false }),
  },
});

export type Pastel = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  imagen: string;
  precioAnytime?: string;
  imagenAnytime?: string;
  categoria: string;
  nuevo: boolean;
  archived: boolean;
};

const Orders = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    productos: column.json(),
    tel: column.text(),
    nombre: column.text(),
    sucursal: column.number(),
    fecha: column.text(),
    estado: column.text(),
    creado: column.text(),
    modificado: column.text(),
  },
});

export type Order = {
  id: number;
  productos: string;
  tel: string;
  nombre: string;
  sucursal: number;
  fecha: string;
  estado: string;
  creado: string;
  modificado: string;
};

export type OrderProduct = {
  id: string;
  cantidad: number;
  stripePriceId: string;
  presentacion: string;
};

export type SystemOrderProduct = {
  producto: string; //id,
  cantidad: number;
  presentacion: string; //id,
  precioProducto: number; // 0,
  precioPresentacion: number; // precio real,
  comentarios: string;
};

export type SystemOrder = {
  productos: SystemOrderProduct[];
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
    Pasteles,
  },
});
