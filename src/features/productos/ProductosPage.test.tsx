import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing/react";
import { AuthProvider } from "../auth/AuthContext";
import { ToastProvider } from "../../components/Toast";
import { ProductosDocument } from "../../graphql/generated/graphql";
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

const mocks = [
  {
    request: { query: ProductosDocument, variables: { soloActivos: true } },
    result: { data: { productos: [] } },
  },
];

describe("ProductosPage - gating por grupo", () => {
  beforeEach(() => localStorage.clear());

  it('un usuario del grupo "Vendedores" no ve "Nuevo producto"', async () => {
    seedVendedor(["Vendedores"]);
    render(
      <MockedProvider mocks={mocks}>
        <AuthProvider>
          <ToastProvider>
            <ProductosPage />
          </ToastProvider>
        </AuthProvider>
      </MockedProvider>
    );

    expect(await screen.findByText("Productos")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Nuevo producto" })
    ).not.toBeInTheDocument();
  });

  it('un usuario del grupo "Administradores" sí ve "Nuevo producto"', async () => {
    seedVendedor(["Administradores"]);
    render(
      <MockedProvider mocks={mocks}>
        <AuthProvider>
          <ToastProvider>
            <ProductosPage />
          </ToastProvider>
        </AuthProvider>
      </MockedProvider>
    );

    expect(
      await screen.findByRole("button", { name: "Nuevo producto" })
    ).toBeInTheDocument();
  });
});
