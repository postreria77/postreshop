import { db, Pasteles, Sucursales, DisabledDateTimes, Users } from "astro:db";

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
      precio: "price_1Qg57s2N0hejjjHD6e1l5fyx",
      imagen:
        "https://lapasteleriadelapostreria.com/images/menu/red-velvet.webp",
      precioAnytime: "price_1QiMwU2N0hejjjHDrE8YOXqF",
      imagenAnytime: "/images/pasteles/red-velvet-anytime.webp",
      precioGift: "price_1QnMhv2N0hejjjHD3dcETUfG",
      imagenGift: "/images/pasteles/red-velvet-gift.webp",
      categoria: "Pasteles",
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
  await db.insert(Users).values([
    {
      id: 1001,
      nombre: "Erick",
      apellido: "Mireles",
      telefono: "1234567890",
      email: "user@email.com",
      contraseña:
        "$2a$10$W8WQDhZMmRG/d5r596S4ceizQIkpCqd4fW7uYwM3zBzFEA6Q9y5q6",
    },
  ]);
}
