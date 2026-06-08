import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocationBanner } from "../../../components/location/LocationBanner";
import * as LocationContext from "../../../context/LocationContext";
import * as AnonymousStorage from "../../../services/anonymousAddressStorage";

vi.mock("../../../context/LocationContext", () => ({
  useLocationContext: vi.fn(),
}));

vi.mock("../../../services/anonymousAddressStorage", () => ({
  anonymousAddressStorage: {
    exists: vi.fn(),
    load: vi.fn(),
    save: vi.fn(),
    clear: vi.fn(),
  },
}));

describe("LocationBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (
      AnonymousStorage.anonymousAddressStorage.exists as ReturnType<
        typeof vi.fn
      >
    ).mockReturnValue(false);
  });

  it("deve renderizar no estado IDLE", () => {
    (
      LocationContext.useLocationContext as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      city: null,
      coordinates: null,
      loading: false,
      error: null,
      status: "IDLE",
      requestLocation: vi.fn(),
      source: null,
    });

    render(<LocationBanner />);
    expect(screen.getByText("Onde você está?")).toBeDefined();
    expect(screen.getByText("Usar minha localização")).toBeDefined();
    expect(screen.getByText("Digitar endereço")).toBeDefined();
  });

  it("deve renderizar no estado REQUESTING", () => {
    (
      LocationContext.useLocationContext as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      city: null,
      coordinates: null,
      loading: true,
      error: null,
      status: "REQUESTING",
      requestLocation: vi.fn(),
      source: null,
    });

    render(<LocationBanner />);
    expect(screen.getByText("Detectando sua localização...")).toBeDefined();
  });

  it("deve renderizar no estado DENIED", () => {
    (
      LocationContext.useLocationContext as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      city: null,
      coordinates: null,
      loading: false,
      error: "Permissão negada",
      status: "DENIED",
      requestLocation: vi.fn(),
      source: null,
    });

    render(<LocationBanner />);
    expect(screen.getByText("Localização indisponível")).toBeDefined();
    expect(screen.getByText("Tentar novamente")).toBeDefined();
    expect(screen.getByText("Digitar endereço manualmente")).toBeDefined();
  });

  it("deve renderizar null quando tem GPS real ativo", () => {
    (
      LocationContext.useLocationContext as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      city: { name: "Franca", state: "SP" },
      coordinates: { latitude: -20.535, longitude: -47.395 },
      loading: false,
      error: null,
      status: "SUCCESS",
      requestLocation: vi.fn(),
      source: "gps",
    });

    const { container } = render(<LocationBanner />);
    expect(container.innerHTML).toBe("");
  });

  it("deve mostrar badge de cache anônimo quando existir", () => {
    (
      LocationContext.useLocationContext as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      city: null,
      coordinates: null,
      loading: false,
      error: null,
      status: "IDLE",
      requestLocation: vi.fn(),
      source: null,
    });
    (
      AnonymousStorage.anonymousAddressStorage.exists as ReturnType<
        typeof vi.fn
      >
    ).mockReturnValue(true);
    (
      AnonymousStorage.anonymousAddressStorage.load as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      city: "Franca",
      state: "SP",
      coordinates: { latitude: -20.535, longitude: -47.395 },
      source: "manual",
      timestamp: Date.now(),
    });

    render(<LocationBanner />);
    expect(screen.getByText("Localização salva")).toBeDefined();
  });
});
