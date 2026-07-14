import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table } from "./Table";
import type { TableColumn } from "./Table";

interface Fila {
  id: string;
  nombre: string;
}

const columns: TableColumn<Fila>[] = [
  { key: "nombre", header: "Nombre", render: (f) => f.nombre, sortable: true },
  { key: "id", header: "ID", render: (f) => f.id },
];

const rows: Fila[] = [{ id: "1", nombre: "Ana" }];

describe("Table - ordenamiento", () => {
  it("clickear un encabezado ordenable llama a onSortChange con esa columna", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    render(
      <Table columns={columns} rows={rows} getRowKey={(f) => f.id} onSortChange={onSortChange} />
    );

    await user.click(screen.getByRole("columnheader", { name: /Nombre/ }));
    expect(onSortChange).toHaveBeenCalledWith("nombre");
  });

  it("una columna no marcada como sortable no reacciona al click", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    render(
      <Table columns={columns} rows={rows} getRowKey={(f) => f.id} onSortChange={onSortChange} />
    );

    await user.click(screen.getByRole("columnheader", { name: "ID" }));
    expect(onSortChange).not.toHaveBeenCalled();
  });

  it("muestra aria-sort y la flecha en la columna activa", () => {
    render(
      <Table
        columns={columns}
        rows={rows}
        getRowKey={(f) => f.id}
        sortKey="nombre"
        sortDirection="desc"
        onSortChange={vi.fn()}
      />
    );

    const encabezado = screen.getByRole("columnheader", { name: /Nombre/ });
    expect(encabezado).toHaveAttribute("aria-sort", "descending");
    expect(encabezado).toHaveTextContent("↓");
  });
});
