import { defineDb, defineTable, column } from "astro:db";

// https://astro.build/db/config
const Pasteles = defineTable({
  columns: {
    id: column.text({ primaryKey: true, autoIncrement: true }),
    id_pasteleria: column.text({ optional: true }),
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
  id_pasteleria: string;
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
    sucursal: column.text(),
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
  sucursal: string;
  fecha: string;
  estado: string;
  creado: string;
  modificado: string;
};

export type OrderProduct = {
  id: string;
  id_pasteleria: string;
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
  sucursalId: string;
  fechaPedido: string;
  direccion: string; //empty,
  calle: string; //empty,
  numeroExterior: string; //empty,
  numeroInterior: string; //empty,
  colonia: string; //empty,
  municipio: string; //empty,
  referencia: string; //empty,
  forma_pago_id: string; //0 = visa, 1 = mastercard, 2 = amex,
};

const Sucursales = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    address: column.text(),
    connectedStripeAccount: column.text({ default: "acct_1Qg3Dy2N0hejjjHD" }),
  },
});

export type Sucursal = {
  id: string;
  name: string;
  address: string;
  connectedStripeAccount: string;
};

export default defineDb({
  tables: {
    Orders,
    Pasteles,
    Sucursales,
  },
});
