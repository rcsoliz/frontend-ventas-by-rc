import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing/react";
import { VentaDocument } from "../../../graphql/generated/graphql";
import { DetalleVentaPage } from "./DetalleVentaPage";

const ventaNoEncontradaMock = {
  request: { query: VentaDocument, variables: { idVenta: "sin-datos" } },
  result: { data: { venta: null } },
};

const ventaMock = {
  idVenta: "v1",
  fechaVenta: "2026-07-01T10:00:00Z",
  total: "150.00",
  cliente: { idCliente: "c1", nombreCompleto: "Ana Gomez", correo: "a@a.com", telefono: "1" },
  vendedor: { idVendedor: "vd1", nombreCompleto: "Luis Perez" },
  detalles: [
    {
      idDetalle: "d1",
      cantidad: 2,
      precioUnitario: "75.00",
      subtotal: "150.00",
      producto: { idProducto: "p1", nombreProducto: "Producto X" },
    },
  ],
};

describe("DetalleVentaPage", () => {
  it('error de red muestra "Reintentar" y recuperar la venta al hacer clic', async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider
        mocks={[
          {
            request: { query: VentaDocument, variables: { idVenta: "v1" } },
            error: new Error("Network error"),
          },
          {
            request: { query: VentaDocument, variables: { idVenta: "v1" } },
            result: { data: { venta: ventaMock } },
          },
        ]}
      >
        <MemoryRouter initialEntries={["/ventas/v1"]}>
          <Routes>
            <Route path="/ventas/:idVenta" element={<DetalleVentaPage />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    const reintentar = await screen.findByRole("button", { name: "Reintentar" });
    await user.click(reintentar);

    expect(await screen.findByText("Ana Gomez")).toBeInTheDocument();
  });

  it("venta inexistente muestra un EmptyState anunciado y un botón para volver, no un <p> mudo", async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider mocks={[ventaNoEncontradaMock]}>
        <MemoryRouter initialEntries={["/ventas/sin-datos"]}>
          <Routes>
            <Route path="/ventas/:idVenta" element={<DetalleVentaPage />} />
            <Route path="/ventas" element={<div>Historial de ventas</div>} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(await screen.findByText("Venta no encontrada")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Venta no encontrada");

    await user.click(screen.getByRole("button", { name: "Volver al historial" }));

    expect(await screen.findByText("Historial de ventas")).toBeInTheDocument();
  });
});
