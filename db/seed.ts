import { db, Pasteles } from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Pasteles).values([
    {
      id: "358",
      nombre: "Ferrero",
      descripcion:
        "Pan de chocolate relleno de Nutella, betún de chocolate y ganache. Decorado con Ferrero Rocher.",
      precio: "price_1QRC3nB2G7gLVqvPMv6x4Th2",
      precioAnytime: "price_1QdBBoB2G7gLVqvPVjLm7s44",
      imagen: "https://lapasteleriadelapostreria.com/images/menu/ferrero.webp",
      imagenAnytime:
        "https://files.stripe.com/links/MDB8YWNjdF8xUVJCeWlCMkc3Z0xWcXZQfGZsX3Rlc3RfcXNLS2NQT0dqdnBiaUFFUm9JQWxVRDh500OyUsFR1a",
      categoria: "Pasteles",
      nuevo: false,
      archived: false,
    },
    {
      id: "565",
      nombre: "Pecan Pie Cake",
      descripcion:
        "Pan de vainilla con relleno de pie de nuez, betún de vainilla, capa de dulce de leche y nuez caramelizada.",
      precio: "price_1QdBI8B2G7gLVqvPcoxRrLqV",
      imagen:
        "https://lapasteleriadelapostreria.com/images/menu/pecan-pie.webp",
      categoria: "Pasteles",
      nuevo: false,
      archived: false,
    },
  ]);
}
