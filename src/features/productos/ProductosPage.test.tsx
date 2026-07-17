import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing/react";
import { AuthProvider } from "../auth/AuthContext";
import { ToastProvider } from "../../components/Toast";
import {
  ActualizarProductoDocument,
  CambiarEstadoProductoDocument,
  ProductosDocument,
} from "../../graphql/generated/graphql";
import { ProductosPage } from "./ProductosPage";

function seedVendedor(grupos: string[]) {
  localStorage.setItem("ventas_token", "fake-token");
  localStorage.setItem(
    "ventas_vendedor",
    JSON.stringify({
      id: "1",
      username: "u",
      nombreCompleto: "Test",
      email: "t@test.com",
      grupos,
    })
  );
}

function renderProductosPage(mocks: unknown[]) {
  return render(
    <MemoryRouter>
      <MockedProvider mocks={mocks as never}>
        <AuthProvider>
          <ToastProvider>
            <ProductosPage />
          </ToastProvider>
        </AuthProvider>
      </MockedProvider>
    </MemoryRouter>
  );
}

const mocksVacio = [
  {
    request: { query: ProductosDocument, variables: { soloActivos: true } },
    result: { data: { productos: [] } },
  },
];

const monitorActivo = {
  idProducto: "9",
  nombreProducto: "Monitor",
  descripcion: "Full HD",
  precio: "500.00",
  stock: 3,
  estado: true,
};

describe("ProductosPage - gating por grupo", () => {
  beforeEach(() => localStorage.clear());

  it('un usuario del grupo "Vendedores" no ve "Nuevo producto"', async () => {
    seedVendedor(["Vendedores"]);
    renderProductosPage(mocksVacio);

    expect(await screen.findByText("Productos")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Nuevo producto" })
    ).not.toBeInTheDocument();
  });

  it('un usuario del grupo "Administradores" sí ve "Nuevo producto"', async () => {
    seedVendedor(["Administradores"]);
    renderProductosPage(mocksVacio);

    expect(
      await screen.findByRole("button", { name: "Nuevo producto" })
    ).toBeInTheDocument();
  });

  it('un usuario del grupo "Vendedores" no ve las acciones de Editar/Desactivar en la tabla', async () => {
    seedVendedor(["Vendedores"]);
    renderProductosPage([
      {
        request: { query: ProductosDocument, variables: { soloActivos: true } },
        result: { data: { productos: [monitorActivo] } },
      },
    ]);

    expect(await screen.findByText("Monitor")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Desactivar" })).not.toBeInTheDocument();
  });
});

describe("ProductosPage - editar y desactivar", () => {
  beforeEach(() => localStorage.clear());

  it("un Administrador puede editar un producto desde la tabla y ve el toast de actualización", async () => {
    seedVendedor(["Administradores"]);
    const user = userEvent.setup();

    const productosInicial = {
      request: { query: ProductosDocument, variables: { soloActivos: true } },
      result: { data: { productos: [monitorActivo] } },
    };
    const actualizarMock = {
      request: {
        query: ActualizarProductoDocument,
        variables: {
          idProducto: "9",
          datos: { nombreProducto: "Monitor 4K", descripcion: "Full HD", precio: 500, stock: 3 },
        },
      },
      result: {
        data: {
          actualizarProducto: { ...monitorActivo, nombreProducto: "Monitor 4K" },
        },
      },
    };
    const productosRefetch = {
      request: { query: ProductosDocument, variables: { soloActivos: true } },
      result: { data: { productos: [{ ...monitorActivo, nombreProducto: "Monitor 4K" }] } },
    };

    renderProductosPage([productosInicial, actualizarMock, productosRefetch]);

    await user.click(await screen.findByRole("button", { name: "Editar" }));

    const campoNombre = await screen.findByLabelText("Nombre");
    expect(campoNombre).toHaveValue("Monitor");
    await user.clear(campoNombre);
    await user.type(campoNombre, "Monitor 4K");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByText("Producto actualizado correctamente.")).toBeInTheDocument();
    expect(await screen.findByText("Monitor 4K")).toBeInTheDocument();
  });

  it("un Administrador puede desactivar un producto y desaparece del listado de activos", async () => {
    seedVendedor(["Administradores"]);
    const user = userEvent.setup();

    const productosInicial = {
      request: { query: ProductosDocument, variables: { soloActivos: true } },
      result: { data: { productos: [monitorActivo] } },
    };
    const cambiarEstadoMock = {
      request: {
        query: CambiarEstadoProductoDocument,
        variables: { idProducto: "9", estado: false },
      },
      result: { data: { cambiarEstadoProducto: { ...monitorActivo, estado: false } } },
    };
    const productosRefetchVacio = {
      request: { query: ProductosDocument, variables: { soloActivos: true } },
      result: { data: { productos: [] } },
    };

    renderProductosPage([productosInicial, cambiarEstadoMock, productosRefetchVacio]);

    await user.click(await screen.findByRole("button", { name: "Desactivar" }));
    expect(await screen.findByRole("button", { name: "¿Confirmar?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "¿Confirmar?" }));

    expect(await screen.findByText('"Monitor" fue desactivado.')).toBeInTheDocument();
    expect(await screen.findByText("Todavía no hay productos en el catálogo")).toBeInTheDocument();
  });
});
