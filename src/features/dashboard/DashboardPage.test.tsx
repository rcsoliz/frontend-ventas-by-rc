import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing/react";
import { VentasDocument } from "../../graphql/generated/graphql";
import { DashboardPage } from "./DashboardPage";

const HACE_2_DIAS = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
const HACE_200_DIAS = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();

function renderDashboard(ventas: unknown[]) {
  return render(
    <MockedProvider mocks={[{ request: { query: VentasDocument }, result: { data: { ventas } } }]}>
      <MemoryRouter initialEntries={["/panel"]}>
        <Routes>
          <Route path="/panel" element={<DashboardPage />} />
          <Route path="/ventas/nueva" element={<div>Nueva venta (carrito)</div>} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
}

const ventaReciente = {
  idVenta: "v-reciente",
  fechaVenta: HACE_2_DIAS,
  total: "200.00",
  cliente: { idCliente: "c1", nombreCompleto: "Ana Gomez" },
  vendedor: { idVendedor: "vd1", nombreCompleto: "Luis Perez" },
  detalles: [
    {
      cantidad: 2,
      subtotal: "200.00",
      producto: { idProducto: "p1", nombreProducto: "Camisa" },
    },
  ],
};

const ventaVieja = {
  idVenta: "v-vieja",
  fechaVenta: HACE_200_DIAS,
  total: "500.00",
  cliente: { idCliente: "c2", nombreCompleto: "Beto Ruiz" },
  vendedor: { idVendedor: "vd1", nombreCompleto: "Luis Perez" },
  detalles: [
    {
      cantidad: 1,
      subtotal: "500.00",
      producto: { idProducto: "p2", nombreProducto: "Pantalón" },
    },
  ],
};

describe("DashboardPage", () => {
  it("con el rango por defecto (30 días) solo cuenta las ventas dentro de la ventana", async () => {
    renderDashboard([ventaReciente, ventaVieja]);

    expect(await screen.findByTestId("kpi-ingresos-totales")).toHaveTextContent("Bs 200,00");
    expect(screen.getByTestId("kpi-cantidad-ventas")).toHaveTextContent("1");
    // "Camisa" también aparece en el callout "Dato clave" (mismo producto, insight
    // calculado a partir de topProductos) — se usa `getByTitle` para apuntar
    // puntualmente a la fila del gráfico "Productos más vendidos".
    expect(screen.getByTitle("Camisa")).toBeInTheDocument();
  });

  it('cambiar el período a "Todo" incluye las ventas fuera de la ventana de 30 días', async () => {
    const user = userEvent.setup();
    renderDashboard([ventaReciente, ventaVieja]);

    await screen.findByTestId("kpi-ingresos-totales");
    await user.selectOptions(screen.getByLabelText("Período"), "todo");

    expect(await screen.findByTestId("kpi-ingresos-totales")).toHaveTextContent("Bs 700,00");
    expect(screen.getByTestId("kpi-cantidad-ventas")).toHaveTextContent("2");
  });

  it('el toggle "Ver tabla" cambia el gráfico de ingresos por una tabla accesible', async () => {
    const user = userEvent.setup();
    renderDashboard([ventaReciente]);

    await screen.findByTestId("kpi-ingresos-totales");
    expect(screen.getByRole("img", { name: /Ingresos por día/i })).toBeInTheDocument();

    const tarjetaIngresos = screen.getByText("Ingresos por día").closest("div")!.parentElement as HTMLElement;
    await user.click(within(tarjetaIngresos).getByRole("button", { name: "Ver tabla" }));

    expect(screen.queryByRole("img", { name: /Ingresos por día/i })).not.toBeInTheDocument();
    const tabla = screen.getByRole("table");
    expect(within(tabla).getByText("Ingresos")).toBeInTheDocument();
  });

  it("sin ventas registradas muestra un EmptyState que navega a Nueva venta", async () => {
    const user = userEvent.setup();
    renderDashboard([]);

    expect(await screen.findByText("Aún no hay datos para mostrar")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Nueva venta" }));

    expect(await screen.findByText("Nueva venta (carrito)")).toBeInTheDocument();
  });
});
