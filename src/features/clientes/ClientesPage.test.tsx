import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing/react";
import { AuthProvider } from "../auth/AuthContext";
import { ToastProvider } from "../../components/Toast";
import {
  ActualizarClienteDocument,
  CambiarEstadoClienteDocument,
  ClientesDocument,
  CrearClienteDocument,
} from "../../graphql/generated/graphql";
import { ClientesPage } from "./ClientesPage";

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

function renderClientesPage(mocks: unknown[]) {
  return render(
    <MemoryRouter>
      <MockedProvider mocks={mocks as never}>
        <AuthProvider>
          <ToastProvider>
            <ClientesPage />
          </ToastProvider>
        </AuthProvider>
      </MockedProvider>
    </MemoryRouter>
  );
}

const clientesVaciosMock = {
  request: { query: ClientesDocument, variables: { soloActivos: true } },
  result: { data: { clientes: [] } },
};

// useCrearCliente refetches "Clientes" on success, so a second identical
// request needs its own mock entry — MockedProvider consumes each once.
const clientesVaciosMockRefetch = {
  request: { query: ClientesDocument, variables: { soloActivos: true } },
  result: { data: { clientes: [] } },
};

const crearClienteMock = {
  request: {
    query: CrearClienteDocument,
    variables: {
      datos: {
        nombre: "Ana",
        apellido: "Gomez",
        correo: "ana@test.com",
        telefono: "123",
        direccion: "Calle 1",
      },
    },
  },
  result: {
    data: {
      crearCliente: {
        idCliente: "1",
        nombre: "Ana",
        apellido: "Gomez",
        nombreCompleto: "Ana Gomez",
        correo: "ana@test.com",
        telefono: "123",
        direccion: "Calle 1",
        estado: true,
      },
    },
  },
};

const brunoActivo = {
  idCliente: "5",
  nombre: "Bruno",
  apellido: "Diaz",
  nombreCompleto: "Bruno Diaz",
  correo: "bruno@test.com",
  telefono: "111",
  direccion: "Av. Central",
  estado: true,
};

describe("ClientesPage", () => {
  beforeEach(() => localStorage.clear());

  it("crear un cliente exitosamente muestra el toast de éxito y cierra el modal", async () => {
    seedVendedor(["Vendedores"]);
    const user = userEvent.setup();

    renderClientesPage([clientesVaciosMock, crearClienteMock, clientesVaciosMockRefetch]);

    await user.click(await screen.findByRole("button", { name: "Nuevo cliente" }));

    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("Apellido"), "Gomez");
    await user.type(screen.getByLabelText("Correo"), "ana@test.com");
    await user.type(screen.getByLabelText("Teléfono"), "123");
    await user.type(screen.getByLabelText("Dirección"), "Calle 1");
    await user.click(screen.getByRole("button", { name: "Crear cliente" }));

    expect(await screen.findByText("Cliente creado correctamente.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Correo")).not.toBeInTheDocument();
  });

  it('un usuario del grupo "Vendedores" no ve las acciones de Editar/Desactivar', async () => {
    seedVendedor(["Vendedores"]);

    renderClientesPage([
      { request: { query: ClientesDocument, variables: { soloActivos: true } }, result: { data: { clientes: [brunoActivo] } } },
    ]);

    expect(await screen.findByText("Bruno Diaz")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Desactivar" })).not.toBeInTheDocument();
  });

  it('un Administrador puede editar un cliente desde la tabla y ve el toast de actualización', async () => {
    seedVendedor(["Administradores"]);
    const user = userEvent.setup();

    const clientesInicial = {
      request: { query: ClientesDocument, variables: { soloActivos: true } },
      result: { data: { clientes: [brunoActivo] } },
    };
    const actualizarMock = {
      request: {
        query: ActualizarClienteDocument,
        variables: {
          idCliente: "5",
          datos: {
            nombre: "Bruno",
            apellido: "Díaz López",
            correo: "bruno@test.com",
            telefono: "111",
            direccion: "Av. Central",
          },
        },
      },
      result: {
        data: {
          actualizarCliente: {
            ...brunoActivo,
            apellido: "Díaz López",
            nombreCompleto: "Bruno Díaz López",
          },
        },
      },
    };
    const clientesRefetch = {
      request: { query: ClientesDocument, variables: { soloActivos: true } },
      result: { data: { clientes: [{ ...brunoActivo, apellido: "Díaz López", nombreCompleto: "Bruno Díaz López" }] } },
    };

    renderClientesPage([clientesInicial, actualizarMock, clientesRefetch]);

    await user.click(await screen.findByRole("button", { name: "Editar" }));

    const campoApellido = await screen.findByLabelText("Apellido");
    expect(campoApellido).toHaveValue("Diaz");
    await user.clear(campoApellido);
    await user.type(campoApellido, "Díaz López");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByText("Cliente actualizado correctamente.")).toBeInTheDocument();
    expect(await screen.findByText("Bruno Díaz López")).toBeInTheDocument();
  });

  it('un Administrador puede desactivar un cliente y desaparece del listado de activos', async () => {
    seedVendedor(["Administradores"]);
    const user = userEvent.setup();

    const clientesInicial = {
      request: { query: ClientesDocument, variables: { soloActivos: true } },
      result: { data: { clientes: [brunoActivo] } },
    };
    const cambiarEstadoMock = {
      request: {
        query: CambiarEstadoClienteDocument,
        variables: { idCliente: "5", estado: false },
      },
      result: { data: { cambiarEstadoCliente: { ...brunoActivo, estado: false } } },
    };
    const clientesRefetchVacio = {
      request: { query: ClientesDocument, variables: { soloActivos: true } },
      result: { data: { clientes: [] } },
    };

    renderClientesPage([clientesInicial, cambiarEstadoMock, clientesRefetchVacio]);

    const botonDesactivar = await screen.findByRole("button", { name: "Desactivar" });
    await user.click(botonDesactivar);
    expect(await screen.findByRole("button", { name: "¿Confirmar?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "¿Confirmar?" }));

    expect(await screen.findByText('"Bruno Diaz" fue desactivado.')).toBeInTheDocument();
    expect(await screen.findByText("Todavía no registraste clientes")).toBeInTheDocument();
  });

  it('el primer clic en "Desactivar" solo arma la confirmación, no ejecuta la mutación', async () => {
    seedVendedor(["Administradores"]);
    const user = userEvent.setup();

    const clientesInicial = {
      request: { query: ClientesDocument, variables: { soloActivos: true } },
      result: { data: { clientes: [brunoActivo] } },
    };

    renderClientesPage([clientesInicial]);

    await user.click(await screen.findByRole("button", { name: "Desactivar" }));

    expect(await screen.findByRole("button", { name: "¿Confirmar?" })).toBeInTheDocument();
    expect(screen.queryByText(/fue desactivado/)).not.toBeInTheDocument();
  });
});
