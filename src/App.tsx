import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./features/auth/LoginPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { useAuth } from "./features/auth/AuthContext";
import { esAdministrador } from "./features/auth/grupos";
import { AppLayout } from "./app/AppLayout";
import { ClientesPage } from "./features/clientes/ClientesPage";
import { ProductosPage } from "./features/productos/ProductosPage";
import { HistorialVentasPage } from "./features/ventas/historial/HistorialVentasPage";
import { DetalleVentaPage } from "./features/ventas/historial/DetalleVentaPage";
import { CarritoPage } from "./features/ventas/carrito/CarritoPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";

/** Los Administradores aterrizan en el panel de analíticas; los Vendedores, en Ventas. */
function IndexRedirect() {
  const { vendedor } = useAuth();
  return <Navigate to={esAdministrador(vendedor) ? "/panel" : "/ventas"} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route index element={<IndexRedirect />} />
                <Route path="panel" element={<DashboardPage />} />
                <Route path="clientes" element={<ClientesPage />} />
                <Route path="productos" element={<ProductosPage />} />
                <Route path="ventas" element={<HistorialVentasPage />} />
                <Route path="ventas/nueva" element={<CarritoPage />} />
                <Route path="ventas/:idVenta" element={<DetalleVentaPage />} />
                <Route path="*" element={<Navigate to="/ventas" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
