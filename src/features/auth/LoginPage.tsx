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
  const [showPassword, setShowPassword] = useState(false);

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
        <div className={styles.header}>
          <div className={styles.logo} aria-hidden="true">
            <BanknoteIcon />
          </div>
          <h1 className={styles.title}>Ventas</h1>
          <p className={styles.subtitle}>Iniciá sesión para continuar</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.usernameField}>
            <Input
              label="Usuario"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.passwordField}>
            <Input
              label="Contraseña"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Overlay invisible que replica label+gap del Input para poder
                centrar el botón de mostrar/ocultar exactamente sobre el
                input real, sin depender de valores en px adivinados. */}
            <div className={styles.passwordOverlay}>
              <span className={styles.overlayLabel} aria-hidden="true">
                Contraseña
              </span>
              <div className={styles.overlayInputRow}>
                <button
                  type="button"
                  className={styles.toggleButton}
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </div>
          {loginError && (
            <p className={styles.error} role="alert">
              {loginError}
            </p>
          )}
          <Button type="submit" loading={loginLoading} className={styles.submit}>
            Ingresar
            <ArrowRightIcon />
          </Button>
        </form>
      </Card>
    </div>
  );
}

function BanknoteIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01" />
      <path d="M18 12h.01" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a17.7 17.7 0 0 1-2.16 3.19M6.61 6.61A17.87 17.87 0 0 0 1 12s4 8 11 8a9.26 9.26 0 0 0 5.39-1.61M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
