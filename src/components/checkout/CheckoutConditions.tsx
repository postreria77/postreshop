import { Popover, PopoverTrigger, PopoverContent, Button } from "@heroui/react";

export default function CheckoutConditions() {
  return (
    <>
      <Popover
        placement="bottom"
        size="sm"
        radius="sm"
        containerPadding={16}
        showArrow={true}
      >
        <PopoverTrigger>
          <button className="mt-4 text-xs opacity-40">
            Al realizar una orden, aceptas nuestros{" "}
            <span className="underline">Términos y Condiciones</span>
          </button>
          {/* <Button variant="light" className="w-full text-xs mt-2">✓ Ver Términos y Condiciones</Button> */}
        </PopoverTrigger>
        <PopoverContent className="max-w-[95vw] py-4 pl-5 pr-4">
          <ol className="list-decimal space-y-4 opacity-60">
            <li>
              <strong> Compras y pagos: </strong>
              Todas las compras realizadas a través de nuestra tienda en línea
              son finales. No se aceptan cancelaciones una vez confirmado el
              pedido.
            </li>
            <li>
              <strong>Entrega y Recepción de Pedidos: </strong>
              Todos los pedidos deben ser recolectados por el cliente en la
              fecha, hora y sucursal seleccionadas al momento de la compra. No
              se permiten cambios de fecha ni de sucursal una vez realizado el
              pedido.
            </li>
            <li>
              <strong>Política de Cambios y Devoluciones: </strong>
              No se realizan cambios ni devoluciones bajo ninguna circunstancia.
              Te recomendamos verificar bien tu pedido antes de finalizar la
              compra.
            </li>
            <li>
              <strong>Responsabilidad del Cliente: </strong>
              <ul>
                Es responsabilidad del cliente recolectar el pedido en la fecha,
                lugar y horario acordados. Si el pedido no es recolectado por el
                cliente en el día especificado, se considerará como entregado y
                no habrá reembolso. Al realizar una compra en nuestra tienda en
                línea, el cliente acepta estos términos y condiciones.
              </ul>
            </li>
          </ol>
        </PopoverContent>
      </Popover>
    </>
  );
}
