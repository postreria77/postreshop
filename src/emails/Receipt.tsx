import type { ReceiptInformation } from "@/lib/orders";
import {
  Html,
  Head,
  Heading,
  Container,
  Tailwind,
  Section,
  Row,
  Body,
  Text,
  Img,
  Column,
  Preview,
  Hr,
} from "@react-email/components";

interface ReceiptProps {
  order: ReceiptInformation;
}
const baseUrl = "https://shop.lapostreria77.com";

export function Receipt({ order }: ReceiptProps) {
  return (
    <Tailwind>
      <Html>
        <Head>
          <title>Recibo de compra</title>
        </Head>
        <Preview>
          Recibo de compra de La Postre Shop para {order.nombre}
        </Preview>
        <Body className="bg-light pb-8 pt-6 font-sans text-dark">
          <Container>
            <Section>
              <Row className="mt-4">
                <Column>
                  <Img
                    src="https://shop.lapostreria77.com/favicon.svg"
                    alt="logo"
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                </Column>
                <Column className="flex flex-col items-end">
                  <Text className="m-0">
                    <b className="font-medium">
                      {new Date(order.fecha).toLocaleDateString()}
                    </b>
                  </Text>
                  <Text className="m-0 text-xs opacity-60">ID: {order.id}</Text>
                </Column>
              </Row>
              <Heading
                className="mb-4 mt-4 text-2xl font-medium capitalize tracking-tight"
                as="h1"
              >
                {order.nombre}
              </Heading>
              <Row className="m-0 font-medium">
                <Text className="m-0">
                  <b className="font-medium">Teléfono:</b> {order.tel}
                </Text>
              </Row>
              <Row className="m-0 font-medium">
                <Text className="m-0">
                  <b className="font-medium">Fecha de Entrega:</b>{" "}
                  {new Date(order.fecha).toLocaleDateString()}
                </Text>
              </Row>
              <Row className="m-0 font-medium">
                <Text className="m-0">
                  <b className="font-medium">Hora de Entrega:</b>{" "}
                  {order.fecha.split("T")[1].split(":")[0] + ":00"}
                </Text>
              </Row>
              <Row className="m-0 font-medium">
                <Text className="m-0">
                  <b className="font-medium">Sucursal de Entrega:</b>{" "}
                  {order.sucursal.name}
                </Text>
              </Row>
            </Section>
            <Section className="mt-4">
              <Hr />
              {order.productos.map((p, i) => (
                <Row
                  className={`${i === order.productos.length - 1 ? "" : "border-b border-dashed border-dark/15"}`}
                  key={p.id}
                >
                  <Column className="w-16 py-4">
                    <Img
                      src={baseUrl + p.imagen}
                      alt={p.nombre}
                      width={64}
                      height={64}
                      className="rounded-md"
                    />
                  </Column>
                  <Column className="px-4">
                    <Text className="m-0 font-medium capitalize">
                      {p.nombre}
                    </Text>
                    <Text className="m-0 font-light capitalize leading-none opacity-60">
                      {p.presentacion}
                    </Text>
                  </Column>
                  <Column align="right">
                    <Text>
                      {p.cantidad}x{" "}
                      <b className="text-base font-medium">${p.importe}</b>
                    </Text>
                  </Column>
                </Row>
              ))}
              <Hr />
            </Section>
            <Row>
              <Column>
                <Text className="text-2xl font-medium tracking-tight">
                  Total
                </Text>
              </Column>
              <Column align="right">
                <Text className="text-right text-2xl font-medium">
                  {order.total}
                </Text>
              </Column>
            </Row>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export default Receipt;
