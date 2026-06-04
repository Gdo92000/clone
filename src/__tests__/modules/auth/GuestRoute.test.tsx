import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GuestRoute } from "../../../modules/auth/GuestRoute";
import * as Auth from "../../../auth/hooks/useAuth";

vi.mock("../../../auth/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("GuestRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve permitir acesso de guest (sem currentUser)", () => {
    (Auth.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
    });

    render(
      <GuestRoute>
        <div>Conteúdo público</div>
      </GuestRoute>,
    );

    expect(screen.getByText("Conteúdo público")).toBeDefined();
  });

  it("deve permitir acesso de usuário logado (allowAuthenticated=true)", () => {
    (Auth.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "1", name: "User", role: "consumer" },
    });

    render(
      <GuestRoute allowAuthenticated>
        <div>Conteúdo para todos</div>
      </GuestRoute>,
    );

    expect(screen.getByText("Conteúdo para todos")).toBeDefined();
  });

  it("deve bloquear usuário logado quando allowAuthenticated=false", () => {
    (Auth.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "1", name: "User", role: "consumer" },
    });

    const { container } = render(
      <GuestRoute allowAuthenticated={false}>
        <div>Apenas guests</div>
      </GuestRoute>,
    );

    expect(container.innerHTML).toBe("");
  });

  it("deve permitir guest mesmo com allowAuthenticated=false", () => {
    (Auth.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
    });

    render(
      <GuestRoute allowAuthenticated={false}>
        <div>Apenas guests</div>
      </GuestRoute>,
    );

    expect(screen.getByText("Apenas guests")).toBeDefined();
  });
});
