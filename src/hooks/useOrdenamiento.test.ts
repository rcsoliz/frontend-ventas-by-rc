import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOrdenamiento, ordenarPor } from "./useOrdenamiento";

describe("useOrdenamiento", () => {
  it("el primer clic en una columna ordena ascendente; el segundo invierte a descendente", () => {
    const { result } = renderHook(() => useOrdenamiento());

    expect(result.current.sortKey).toBeNull();

    act(() => result.current.alternarOrden("nombre"));
    expect(result.current.sortKey).toBe("nombre");
    expect(result.current.sortDirection).toBe("asc");

    act(() => result.current.alternarOrden("nombre"));
    expect(result.current.sortDirection).toBe("desc");
  });

  it("cambiar a otra columna reinicia en ascendente", () => {
    const { result } = renderHook(() => useOrdenamiento());

    act(() => result.current.alternarOrden("nombre"));
    act(() => result.current.alternarOrden("nombre"));
    expect(result.current.sortDirection).toBe("desc");

    act(() => result.current.alternarOrden("correo"));
    expect(result.current.sortKey).toBe("correo");
    expect(result.current.sortDirection).toBe("asc");
  });
});

describe("ordenarPor", () => {
  const items = [
    { nombre: "Carlos", edad: 40 },
    { nombre: "Ana", edad: 25 },
    { nombre: "Bruno", edad: 30 },
  ];
  const obtenerValor = (item: (typeof items)[number], key: string) =>
    key === "edad" ? item.edad : item.nombre;

  it("sin sortKey devuelve el arreglo sin tocar", () => {
    expect(ordenarPor(items, null, "asc", obtenerValor)).toEqual(items);
  });

  it("ordena strings alfabéticamente", () => {
    const resultado = ordenarPor(items, "nombre", "asc", obtenerValor);
    expect(resultado.map((i) => i.nombre)).toEqual(["Ana", "Bruno", "Carlos"]);
  });

  it("ordena números y respeta la dirección descendente", () => {
    const resultado = ordenarPor(items, "edad", "desc", obtenerValor);
    expect(resultado.map((i) => i.edad)).toEqual([40, 30, 25]);
  });

  it("no muta el arreglo original", () => {
    const original = [...items];
    ordenarPor(items, "nombre", "asc", obtenerValor);
    expect(items).toEqual(original);
  });
});
