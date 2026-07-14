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
        <ClienteForm onSuccess={onSuccess} onCancel={vi.fn()} />
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

  it("campos vacíos muestran mensajes propios en español, no el popover nativo del navegador", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    const { container } = render(
      <MockedProvider mocks={[]}>
        <ClienteForm onSuccess={onSuccess} onCancel={vi.fn()} />
      </MockedProvider>
    );

    expect(container.querySelector("form")).toHaveAttribute("novalidate");

    await user.click(screen.getByRole("button", { name: "Crear cliente" }));

    expect(await screen.findByText("Ingresá el nombre.")).toBeInTheDocument();
    expect(screen.getByText("Ingresá el apellido.")).toBeInTheDocument();
    expect(screen.getByText("Ingresá un correo con formato válido.")).toBeInTheDocument();
    expect(screen.getByText("Ingresá el teléfono.")).toBeInTheDocument();
    expect(screen.getByText("Ingresá la dirección.")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("el mensaje de error de un campo se borra apenas se empieza a corregir, sin esperar a un nuevo submit", async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider mocks={[]}>
        <ClienteForm onSuccess={vi.fn()} onCancel={vi.fn()} />
      </MockedProvider>
    );

    await user.click(screen.getByRole("button", { name: "Crear cliente" }));
    expect(await screen.findByText("Ingresá el nombre.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Nombre"), "A");

    expect(screen.queryByText("Ingresá el nombre.")).not.toBeInTheDocument();
    expect(screen.getByText("Ingresá el apellido.")).toBeInTheDocument();
  });

  it('botón "Cancelar" llama a onCancel sin intentar crear el cliente', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onCancel = vi.fn();

    render(
      <MockedProvider mocks={[]}>
        <ClienteForm onSuccess={onSuccess} onCancel={onCancel} />
      </MockedProvider>
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
