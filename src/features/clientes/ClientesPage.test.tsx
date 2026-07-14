import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { ToastProvider } from "../../components/Toast";
import { ClientesDocument, CrearClienteDocument } from "../../graphql/generated/graphql";
import { ClientesPage } from "./ClientesPage";

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

describe("ClientesPage", () => {
  it("crear un cliente exitosamente muestra el toast de éxito y cierra el modal", async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider mocks={[clientesVaciosMock, crearClienteMock, clientesVaciosMockRefetch]}>
        <ToastProvider>
          <ClientesPage />
        </ToastProvider>
      </MockedProvider>
    );

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
});
