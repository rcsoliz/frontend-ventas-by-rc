import { useEffect, useState } from "react";

export type Tema = "claro" | "oscuro";

const STORAGE_KEY = "ventas:tema";

function obtenerTemaInicial(): Tema {
  if (typeof document === "undefined") return "claro";
  // El script inline de index.html ya fijó data-theme en <html> antes del
  // primer paint (evita el flash de tema incorrecto) — se lee de ahí en vez
  // de repetir la lógica de localStorage/matchMedia.
  return document.documentElement.dataset.theme === "dark" ? "oscuro" : "claro";
}

export function useTheme() {
  const [tema, setTema] = useState<Tema>(obtenerTemaInicial);

  useEffect(() => {
    document.documentElement.dataset.theme = tema === "oscuro" ? "dark" : "light";
    window.localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  function alternarTema() {
    setTema((actual) => (actual === "oscuro" ? "claro" : "oscuro"));
  }

  return { tema, alternarTema };
}
