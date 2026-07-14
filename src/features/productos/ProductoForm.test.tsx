import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { ProductoForm } from "./ProductoForm";

describe("ProductoForm", () => {
  it("campos vacíos muestran mensajes propios en español, no el popover nativo del navegador", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    const { container } = render(
      <MockedProvider mocks={[]}>
        <ProductoForm onSuccess={onSuccess} onCancel={vi.fn()} />
      </MockedProvider>
    );

    expect(container.querySelector("form")).toHaveAttribute("novalidate");

    await user.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(await screen.findByText("Ingresá el nombre.")).toBeInTheDocument();
    expect(screen.getByText("Ingresá la descripción.")).toBeInTheDocument();
    expect(screen.getByText("Ingresá un precio válido.")).toBeInTheDocument();
    expect(screen.getByText("Ingresá un stock válido.")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("el mensaje de error de un campo se borra apenas se empieza a corregir, sin esperar a un nuevo submit", async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider mocks={[]}>
        <ProductoForm onSuccess={vi.fn()} onCancel={vi.fn()} />
      </MockedProvider>
    );

    await user.click(screen.getByRole("button", { name: "Crear producto" }));
    expect(await screen.findByText("Ingresá el nombre.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Nombre"), "A");

    expect(screen.queryByText("Ingresá el nombre.")).not.toBeInTheDocument();
    expect(screen.getByText("Ingresá la descripción.")).toBeInTheDocument();
  });

  it('botón "Cancelar" llama a onCancel sin intentar crear el producto', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onCancel = vi.fn();

    render(
      <MockedProvider mocks={[]}>
        <ProductoForm onSuccess={onSuccess} onCancel={onCancel} />
      </MockedProvider>
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("nombre que coincide con un producto existente muestra una pista de posible duplicado, sin bloquear el envío", async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider mocks={[]}>
        <ProductoForm onSuccess={vi.fn()} onCancel={vi.fn()} nombresExistentes={["Coca Cola 2L"]} />
      </MockedProvider>
    );

    await user.type(screen.getByLabelText("Nombre"), "coca cola 2l");

    expect(
      await screen.findByText("Ya existe un producto con este nombre.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).not.toHaveAttribute("aria-invalid", "true");
  });
});
