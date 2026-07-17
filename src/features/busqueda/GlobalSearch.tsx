import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconSearch } from "../../components/icons";
import { useBusquedaGlobal } from "./useBusquedaGlobal";
import type { ResultadoBusqueda } from "./useBusquedaGlobal";
import layoutStyles from "../../app/AppLayout.module.css";
import styles from "./GlobalSearch.module.css";

const ETIQUETAS_GRUPO: Record<ResultadoBusqueda["tipo"], string> = {
  cliente: "Clientes",
  producto: "Productos",
  venta: "Ventas",
};

function agrupar(resultados: ResultadoBusqueda[]) {
  const grupos = new Map<ResultadoBusqueda["tipo"], ResultadoBusqueda[]>();
  for (const resultado of resultados) {
    const lista = grupos.get(resultado.tipo) ?? [];
    lista.push(resultado);
    grupos.set(resultado.tipo, lista);
  }
  return grupos;
}

/** Buscador general del topbar: cruza clientes, productos y ventas (ver useBusquedaGlobal). */
export function GlobalSearch() {
  const [termino, setTermino] = useState("");
  const [tocado, setTocado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { resultados, cargando } = useBusquedaGlobal(termino, tocado);
  const grupos = agrupar(resultados);
  const mostrarPanel = abierto && termino.trim().length > 0;

  useEffect(() => {
    if (!mostrarPanel) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    function onPointerDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [mostrarPanel]);

  function seleccionar(resultado: ResultadoBusqueda) {
    setAbierto(false);
    setTermino("");
    if (resultado.tipo === "cliente") {
      navigate("/clientes", { state: { busqueda: resultado.titulo } });
    } else if (resultado.tipo === "producto") {
      navigate("/productos", { state: { busqueda: resultado.titulo } });
    } else {
      navigate(`/ventas/${resultado.id}`);
    }
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={layoutStyles.searchField}>
        <IconSearch />
        <label htmlFor="app-search" className={layoutStyles.srOnly}>
          Buscar en el sistema
        </label>
        <input
          id="app-search"
          type="search"
          className={layoutStyles.searchInput}
          placeholder="Buscar en el sistema..."
          value={termino}
          onFocus={() => {
            setTocado(true);
            setAbierto(true);
          }}
          onChange={(e) => {
            setTermino(e.target.value);
            setAbierto(true);
          }}
        />
      </div>
      {mostrarPanel && (
        <div className={styles.panel} role="listbox">
          {cargando && resultados.length === 0 && <p className={styles.mensaje}>Buscando...</p>}
          {!cargando && resultados.length === 0 && (
            <p className={styles.mensaje}>Sin resultados para "{termino.trim()}".</p>
          )}
          {[...grupos.entries()].map(([tipo, items]) => (
            <div key={tipo}>
              <div className={styles.groupLabel}>{ETIQUETAS_GRUPO[tipo]}</div>
              {items.map((item) => (
                <button
                  key={`${tipo}-${item.id}`}
                  type="button"
                  role="option"
                  aria-selected="false"
                  className={styles.item}
                  onClick={() => seleccionar(item)}
                >
                  <span className={styles.itemTitulo}>{item.titulo}</span>
                  <span className={styles.itemSubtitulo}>{item.subtitulo}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
