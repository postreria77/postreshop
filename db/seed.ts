import { db, Pasteles } from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Pasteles).values({
    id: 1,
    nombre: "Pastel de Chocolate",
    descripcion: "Pastel de Chocolate",
    precio: "50",
    precioAnytime: "45",
    imagen:
      "https://img.freepik.com/foto-gratis/pastel-chocolate_23-2148357893.jpg?w=2000",
    categoria: "Pasteles",
    nuevo: true,
    archived: false,
  });
}
