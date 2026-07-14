import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("atrapa el foco: Tab desde el último elemento vuelve al primero, y viceversa", async () => {
    const user = userEvent.setup();

    render(
      <Modal open onClose={vi.fn()} title="Título">
        <button>Uno</button>
        <button>Dos</button>
      </Modal>
    );

    const closeButton = screen.getByRole("button", { name: "Cerrar" });
    const uno = screen.getByRole("button", { name: "Uno" });
    const dos = screen.getByRole("button", { name: "Dos" });

    dos.focus();
    expect(document.activeElement).toBe(dos);

    await user.tab();
    expect(document.activeElement).toBe(closeButton);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(dos);

    uno.focus();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(closeButton);
  });
});
