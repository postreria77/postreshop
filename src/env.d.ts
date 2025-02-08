import type { Session, User } from "db/config";

declare global {
  declare namespace App {
    interface Locals {
      session: Session | null;
      user: User | null;
    }
  }
}

// declare namespace App {
//   interface Locals {
//     session: Session | null;
//     user: User | null;
//   }
// }
