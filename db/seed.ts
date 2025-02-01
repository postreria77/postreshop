import { db, Pasteles, Sucursales, DisabledDateTimes } from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Pasteles).values([
    {
      id: "358",
      id_pasteleria: "98",
      nombre: "Ferrero",
      descripcion:
        "Pan de chocolate relleno de Nutella, betún de chocolate y ganache. Decorado con Ferrero Rocher.",
      precio: "price_1QRC3nB2G7gLVqvPMv6x4Th2",
      precioAnytime: "price_1Qg3cY2N0hejjjHDbNwNqE3v",
      imagen: "https://lapasteleriadelapostreria.com/images/menu/ferrero.webp",
      imagenAnytime:
        "https://files.stripe.com/links/MDB8YWNjdF8xUVJCeWlCMkc3Z0xWcXZQfGZsX3Rlc3RfcXNLS2NQT0dqdnBiaUFFUm9JQWxVRDh500OyUsFR1a",
      categoria: "Pasteles",
      nuevo: false,
      archived: false,
    },
    {
      id: "484",
      id_pasteleria: "100",
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
    {
      id: "565",
      id_pasteleria: "103",
      nombre: "Red Velvet",
      descripcion:
        "Pan de vainilla con relleno de pie de nuez, betün de vainilla, capa de dulce de leche y nuez caramelizada.",
      precio: "price_1QdBI8B2G7gLVqvPcoxRrLqV",
      imagen:
        "https://lapasteleriadelapostreria.com/images/menu/red-velvet.webp",
      precioAnytime: "price_1QiMwU2N0hejjjHDrE8YOXqF",
      imagenAnytime: "/images/pasteles/red-velvet-anytime.webp",
      precioGift: "price_1QiMwU2N0hejjjHDrE8YOXqF",
      imagenGift: "/images/pasteles/red-velvet-gift.webp",
      categoria: "Pasteles",
      nuevo: false,
      archived: false,
    },
  ]);
  await db.insert(Sucursales).values([
    {
      id: "547",
      name: "Formula 1",
      address: "Av. La Postrería 77, Buenos Aires, Argentina",
      connectedStripeAccount: "acct_1QiyF92KiO5HpTFD",
    },
    {
      id: "44",
      name: "Serena",
      address:
        "Pueblo Serena, Carretera Nacional #500 Local F. Colonia Valle Alto, Monterrey, N.L.",
      connectedStripeAccount: "acct_1Qg3Dy2N0hejjjHD",
    },
  ]);
  await db.insert(DisabledDateTimes).values([
    {
      id: "1",
      date: "2025-02-13",
      dayDisabled: true,
    },
    {
      id: "2",
      date: "2025-02-14",
      time: "12:00,13:00,14:00",
    },
  ]);
}
