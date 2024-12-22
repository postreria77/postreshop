import { atom, map } from "nanostores";

export const cartOpen = atom(false);

export type CartItem = {
  id: string;
  price: {
    id: string;
    amount: number;
  };
  name: string;
  size: string;
  image: string;
  quantity: number;
};

export const cartItems = map<Record<string, CartItem>>({
  initial: {
    id: "1",
    name: "Pasteles",
    price: { id: "1", amount: 0 },
    image: "https://placekitten.com/200/300",
    quantity: 0,
    size: "Grande",
  },
});

type ItemDisplayInfo = Pick<
  CartItem,
  "id" | "name" | "image" | "quantity" | "price" | "size"
>;
export function addCartItem({
  id,
  name,
  image,
  quantity,
  price,
  size,
}: ItemDisplayInfo) {
  const existingEntry = cartItems.get()[id];
  if (existingEntry) {
    cartItems.setKey(id, {
      ...existingEntry,
      quantity: existingEntry.quantity + quantity,
    });
  } else {
    cartItems.setKey(id, { id, name, image, quantity, price, size });
  }
}
