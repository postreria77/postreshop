import {
  db,
  Pasteles,
  Productos,
  Sucursales,
  DisabledDateTimes,
  Users,
} from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Pasteles).values([
    {
      id: "358",
      id_pasteleria: "98",
      nombre: "Ferrero",
      descripcion:
        "Pan de chocolate relleno de Nutella, betún de chocolate y ganache. Decorado con Ferrero Rocher.",
      precio: "price_1Qg3bS2N0hejjjHDX8EYDGH1",
      precioAnytime: "price_1Qg3cY2N0hejjjHDbNwNqE3v",
      imagen: "https://lapasteleriadelapostreria.com/images/menu/ferrero.webp",
      imagenAnytime:
        "https://files.stripe.com/links/MDB8YWNjdF8xUVJCeWlCMkc3Z0xWcXZQfGZsX3Rlc3RfcXNLS2NQT0dqdnBiaUFFUm9JQWxVRDh500OyUsFR1a",
      categoria: "Pasteles",
      nuevo: false,
      archived: false,
    },
    {
      id: "1219",
      id_pasteleria: "299",
      nombre: "Mostachón de Fresa y Plátano",
      descripcion:
        "Mostachón de nuez, arándanos y un toque de pistaches, con una capa de New York style cheesecake, platano y fresa fresca, decorado con un betún cremoso de caramelo, mousse de queso crema con lechera, nuez y arándanos.",
      precio: "price_1Qg5Dw2N0hejjjHDiY16NYda",
      imagen: "/images/pasteles/mostachon-platano.webp",
      categoria: "pasteles",
      nuevo: false,
      archived: false,
    },
    {
      id: "565",
      id_pasteleria: "103",
      nombre: "Red Velvet",
      descripcion:
        "Pan de vainilla con relleno de pie de nuez, betün de vainilla, capa de dulce de leche y nuez caramelizada.",
      precio: "price_1Qg57s2N0hejjjHD6e1l5fyx",
      imagen:
        "https://lapasteleriadelapostreria.com/images/menu/red-velvet.webp",
      precioAnytime: "price_1QiMwU2N0hejjjHDrE8YOXqF",
      imagenAnytime: "/images/pasteles/red-velvet-anytime.webp",
      precioGift: "price_1QnMhv2N0hejjjHD3dcETUfG",
      imagenGift: "/images/pasteles/red-velvet-gift.webp",
      categoria: "pasteles",
      nuevo: false,
      archived: false,
    },
  ]);
  await db.insert(Sucursales).values([
    {
      id: "106",
      name: "Villa de Santiago",
      address: "Av. La Postrería 77, Buenos Aires, Argentina",
      connectedStripeAccount: "acct_1QiyF92KiO5HpTFD",
    },
    {
      id: "44",
      name: "Serena",
      address: "Something here",
      connectedStripeAccount: "acct_1Qg3Dy2N0hejjjHD",
    },
    {
      id: "109",
      name: "Parque Centro (Saltillo)",
      address:
        "Edificio MAIA, Blvd. Parque Centro #1425 local CM-A Parque Centro, 25240. Saltillo, Coahuila.",
      connectedStripeAccount: "acct_1Qg3Dy2N0hejjjHD",
    },
  ]);
  await db.insert(DisabledDateTimes).values([
    {
      id: "2025-06-20",
      date: "2025-06-20",
      dayDisabled: true,
    },
    {
      id: "2025-06-21-sucursales",
      date: "2025-06-21",
      dayDisabled: false,
      sucursales: ["44"],
    },
    {
      id: "2025-06-22",
      date: "2025-06-22",
      time: "12:00,13:00,14:00",
    },
    {
      id: "2025-06-23-sucursales-productos",
      date: "2025-06-23",
      dayDisabled: false,
      sucursales: ["44"],
      productos: ["price_1Qg5Dw2N0hejjjHDiY16NYda"],
    },
    // Block multiple sucursales for June 24th
    {
      id: "2025-06-24-sucursales",
      date: "2025-06-24",
      dayDisabled: false,
      sucursales: ["106", "109"],
    },
    // Block multiple products globally for June 25th
    {
      id: "2025-06-25-productos",
      date: "2025-06-25",
      dayDisabled: false,
      productos: [
        "price_1Qg57s2N0hejjjHD6e1l5fyx",
        "price_1Qg3bS2N0hejjjHDX8EYDGH1",
      ],
    },
    // Block specific products for specific sucursales on June 26th
    {
      id: "2025-06-26-sucursales-productos",
      date: "2025-06-26",
      dayDisabled: false,
      sucursales: ["44", "109"],
      productos: ["price_1Qg3bS2N0hejjjHDX8EYDGH1"],
    },
  ]);
  await db.insert(Users).values([
    {
      id: 1001,
      nombre: "Erick",
      apellido: "Mireles",
      telefono: "9983736200",
      email: "emireles.rosas@gmail.com",
      contraseña:
        "$2a$10$x3LjWklO84gXSCL/lKxqruITSe9FK2O6CSlS2cpGTWM3uNf1qbJGW",
      admin: true,
    },
  ]);
}
