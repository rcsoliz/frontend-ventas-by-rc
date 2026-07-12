import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Card } from "../../components/Card";
import { useAuth } from "./AuthContext";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const { login, loginLoading, loginError, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await login(username, password);
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h1 className={styles.title}>Ventas</h1>
        <p className={styles.subtitle}>Iniciá sesión para continuar</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Usuario"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {loginError && (
            <p className={styles.error} role="alert">
              {loginError}
            </p>
          )}
          <Button type="submit" loading={loginLoading} className={styles.submit}>
            Ingresar
          </Button>
        </form>
      </Card>
    </div>
  );
}
