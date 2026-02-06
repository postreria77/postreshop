import type {
  ProductCategoryTypes,
  ProductPresentacionesType,
} from "@/lib/pricesConfig";
import { defineDb, defineTable, column } from "astro:db";

// https://astro.build/db/config
const Pasteles = defineTable({
  columns: {
    id: column.text({ primaryKey: true, autoIncrement: true }),
    id_pasteleria: column.text({ default: "0" }),
    id_especiales: column.json({ optional: true, default: {} }),
    nombre: column.text(),
    descripcion: column.text(),
    precio: column.text(),
    precio_descuentos: column.json({ optional: true, default: {} }),
    imagen: column.text(),
    precioAnytime: column.text({ optional: true }),
    imagenAnytime: column.text({ optional: true }),
    precioGift: column.text({ optional: true }),
    imagenGift: column.text({ optional: true }),
    categoria: column.text({ default: "pasteles" }),
    nuevo: column.boolean({ default: false }),
    archived: column.boolean({ default: false }),
  },
});

export type Pastel = {
  id: string;
  id_pasteleria: string;
  id_especiales: unknown;
  nombre: string;
  descripcion: string;
  precio: string;
  precio_descuentos: unknown;
  imagen: string;
  precioAnytime?: string;
  imagenAnytime?: string;
  precioGift?: string;
  imagenGift?: string;
  categoria: string;
  nuevo: boolean;
  archived: boolean;
};

export type PastelIdsEspeciales = {
  postreria: {
    1: string;
    2: string;
  };
  pasteleria: {
    1: string;
    2: string;
  };
};

export type PastelPrecioDescuentos = {
  tradicional: string;
  anytime: string;
};

const Productos = defineTable({
  columns: {
    id: column.text({ primaryKey: true, autoIncrement: true }),
    ids_sistema: column.json({ optional: true, default: {} }),
    nombre: column.text(),
    presentacion: column.text(),
    descripcion: column.text(),
    imagen: column.text(),
    categoria: column.text({ default: "otro" }),
    precioStripe: column.text(),
    nuevo: column.boolean({ default: false }),
    archived: column.boolean({ default: false }),
    detalles: column.json({ optional: true, default: {} }),
  },
});

export type Producto = {
  id: string;
  ids_sistema: unknown;
  nombre: string;
  presentacion: string;
  descripcion: string;
  imagen: string;
  categoria: string;
  precioStripe: string;
  nuevo: boolean;
  archived: boolean;
  detalles: unknown;
};

export type ProductosIdsSistema = {
  postreria: string;
  pasteleria: string;
};

export type ProductoDetalles = string[];

const Orders = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    productos: column.json(),
    tel: column.text(),
    email: column.text({ default: "" }),
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
  productos: unknown;
  tel: string;
  email: string;
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
  discountedStripePriceId?: string;
  precio: number;
  categoria: ProductCategoryTypes;
  presentacion:
    | ProductPresentacionesType<"pasteles">
    | ProductPresentacionesType<"roscas">;
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

const DisabledDateTimes = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    date: column.text(),
    dayDisabled: column.boolean({ default: false }),
    time: column.text({ optional: true }),
    sucursales: column.json({ optional: true }),
    productos: column.json({ optional: true }),
  },
});

export type DisabledDateTime = {
  id: string;
  date: string;
  dayDisabled: boolean;
  time: string | null;
  sucursales: unknown;
  productos: unknown;
};

const SpecialOrderDates = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    date: column.text(),
    type: column.text({ default: "1" }),
  },
});

export type SpecialOrderDate = {
  id: string;
  date: string;
  type: "1" | "2";
};

const Users = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true, unique: true }),
    nombre: column.text(),
    apellido: column.text({ optional: true }),
    telefono: column.text({ unique: true }),
    email: column.text({ unique: true }),
    contraseña: column.text(),
    admin: column.boolean({ default: false }),
  },
});

export type User = {
  id: number;
  nombre: string;
  apellido?: string;
  telefono: string;
  email: string;
  contraseña: string;
  admin: boolean;
};

const Sessions = defineTable({
  columns: {
    id: column.text({ primaryKey: true, unique: true }),
    userId: column.number({ references: () => Users.columns.id }),
    expiresAt: column.date(),
  },
});

export type Session = {
  id: string;
  userId: number;
  expiresAt: Date;
};

export default defineDb({
  tables: {
    Orders,
    Pasteles,
    Productos,
    Sucursales,
    DisabledDateTimes,
    SpecialOrderDates,
    Users,
    Sessions,
  },
});
