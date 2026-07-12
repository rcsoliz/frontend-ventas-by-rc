import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { CrearClienteDocument } from "../../graphql/generated/graphql";
import { ClienteForm } from "./ClienteForm";

const mocks = [
  {
    request: {
      query: CrearClienteDocument,
      variables: {
        datos: {
          nombre: "Ana",
          apellido: "Gomez",
          correo: "dup@test.com",
          telefono: "123",
          direccion: "Calle 1",
        },
      },
    },
    result: {
      errors: [{ message: 'Ya existe un cliente con el correo "dup@test.com".' }],
    },
  },
];

describe("ClienteForm", () => {
  it("correo duplicado muestra el error del backend en el campo correo, no un toast desconectado", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <MockedProvider mocks={mocks}>
        <ClienteForm onSuccess={onSuccess} />
      </MockedProvider>
    );

    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("Apellido"), "Gomez");
    await user.type(screen.getByLabelText("Correo"), "dup@test.com");
    await user.type(screen.getByLabelText("Teléfono"), "123");
    await user.type(screen.getByLabelText("Dirección"), "Calle 1");
    await user.click(screen.getByRole("button", { name: "Crear cliente" }));

    expect(
      await screen.findByText('Ya existe un cliente con el correo "dup@test.com".')
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Correo")).toHaveAttribute("aria-invalid", "true");
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
