export function checkSaltilloTime(date: string, sucursalId: string): boolean {
  const blockedSucursales = [{ id: "109" }, { id: "520" }, { id: "50" }];

  if (blockedSucursales.some((sucursal) => sucursal.id === sucursalId)) {
    const inputDate = new Date(date);

    if (isNaN(inputDate.getTime())) {
      throw new Error("Invalid date format");
    }

    if (inputDate.getDay() === 0) {
      return false;
    }

    return true;
  }

  return true;
}
