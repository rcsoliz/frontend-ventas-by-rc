import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing/react";
import { LoginDocument } from "../../graphql/generated/graphql";
import { AuthProvider } from "./AuthContext";
import { LoginPage } from "./LoginPage";

const mocks = [
  {
    request: {
      query: LoginDocument,
      variables: { username: "baduser", password: "badpass" },
    },
    result: {
      errors: [{ message: "Usuario o contraseña incorrectos." }],
    },
  },
];

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("credenciales inválidas muestran el mensaje del backend y no persisten token", async () => {
    const user = userEvent.setup();
    render(
      <MockedProvider mocks={mocks}>
        <AuthProvider>
          <MemoryRouter initialEntries={["/login"]}>
            <LoginPage />
          </MemoryRouter>
        </AuthProvider>
      </MockedProvider>
    );

    await user.type(screen.getByLabelText("Usuario"), "baduser");
    await user.type(screen.getByLabelText("Contraseña"), "badpass");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(
      await screen.findByText("Usuario o contraseña incorrectos.")
    ).toBeInTheDocument();
    expect(localStorage.getItem("ventas_token")).toBeNull();
  });
});
