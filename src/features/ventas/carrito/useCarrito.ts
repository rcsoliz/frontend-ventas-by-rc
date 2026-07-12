import { useState } from "react";
import type { ProductosQuery } from "../../../graphql/generated/graphql";

type Producto = ProductosQuery["productos"][number];

export interface LineaCarrito {
  producto: Producto;
  cantidad: number;
}

export function useCarrito() {
  const [lineas, setLineas] = useState<LineaCarrito[]>([]);

  function agregarLinea(producto: Producto, cantidad: number) {
    setLineas((prev) => {
      const existente = prev.find((l) => l.producto.idProducto === producto.idProducto);
      if (existente) {
        // El backend rechaza líneas duplicadas (LineaDuplicadaError) — mejor
        // sumar la cantidad a la línea existente que dejar que falle al enviar.
        return prev.map((l) =>
          l.producto.idProducto === producto.idProducto
            ? { ...l, cantidad: l.cantidad + cantidad }
            : l
        );
      }
      return [...prev, { producto, cantidad }];
    });
  }

  function quitarLinea(idProducto: string) {
    setLineas((prev) => prev.filter((l) => l.producto.idProducto !== idProducto));
  }

  function vaciar() {
    setLineas([]);
  }

  const total = lineas.reduce(
    (acc, l) => acc + Number(l.producto.precio) * l.cantidad,
    0
  );

  return { lineas, agregarLinea, quitarLinea, vaciar, total };
}
