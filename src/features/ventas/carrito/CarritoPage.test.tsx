import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing/react";
import { ToastProvider } from "../../../components/Toast";
import {
  ClientesDocument,
  ProductosDocument,
  RegistrarVentaDocument,
} from "../../../graphql/generated/graphql";
import { CarritoPage } from "./CarritoPage";

const clientesMock = {
  request: { query: ClientesDocument, variables: { soloActivos: true } },
  result: {
    data: {
      clientes: [
        {
          idCliente: "1",
          nombre: "Ana",
          apellido: "Gomez",
          nombreCompleto: "Ana Gomez",
          correo: "a@a.com",
          telefono: "1",
          direccion: "x",
          estado: true,
        },
      ],
    },
  },
};

const productosMock = {
  request: { query: ProductosDocument, variables: { soloActivos: true } },
  result: {
    data: {
      productos: [
        {
          idProducto: "10",
          nombreProducto: "Producto X",
          descripcion: "d",
          precio: "100.00",
          stock: 5,
          estado: true,
        },
      ],
    },
  },
};

const registrarVentaMock = {
  request: {
    query: RegistrarVentaDocument,
    variables: { datos: { idCliente: "1", lineas: [{ idProducto: "10", cantidad: 2 }] } },
  },
  result: {
    errors: [{ message: 'Stock insuficiente para "Producto X": disponible 5, solicitado 2.' }],
  },
};

describe("CarritoPage", () => {
  it("stock insuficiente muestra el error y no navega como si hubiera tenido éxito", async () => {
    const user = userEvent.setup();
    render(
      <MockedProvider mocks={[clientesMock, productosMock, registrarVentaMock]}>
        <ToastProvider>
          <MemoryRouter initialEntries={["/ventas/nueva"]}>
            <Routes>
              <Route path="/ventas/nueva" element={<CarritoPage />} />
              <Route
                path="/ventas/:idVenta"
                element={<div>No debería llegar acá</div>}
              />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </MockedProvider>
    );

    await screen.findByText("Ana Gomez");
    await user.selectOptions(screen.getByLabelText("Cliente"), "1");
    await user.selectOptions(screen.getByLabelText("Producto"), "10");
    await user.clear(screen.getByLabelText("Cantidad"));
    await user.type(screen.getByLabelText("Cantidad"), "2");
    await user.click(screen.getByRole("button", { name: "Agregar" }));

    await user.click(screen.getByRole("button", { name: "Confirmar venta" }));

    expect(await screen.findByText(/Stock insuficiente/)).toBeInTheDocument();
    expect(screen.queryByText("No debería llegar acá")).not.toBeInTheDocument();
    // El carrito no debe quedar en un estado inconsistente: la línea sigue ahí.
    expect(screen.getByText("Producto X")).toBeInTheDocument();
  });
});
