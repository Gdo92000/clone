import { describe, it, expect, beforeEach, vi } from "vitest";
import { anonymousAddressStorage } from "../../services/anonymousAddressStorage";

const { mockGet, mockSet, mockRemove } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockSet: vi.fn(),
  mockRemove: vi.fn(),
}));

vi.mock("../../storage/storageService", () => ({
  storageService: {
    get: mockGet,
    set: mockSet,
    remove: mockRemove,
  },
}));

describe("anonymousAddressStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockData = {
    coordinates: { latitude: -20.535, longitude: -47.395 },
    city: "Franca",
    state: "SP",
    neighborhood: "Centro",
    formattedAddress: "Rua Teste, Centro, Franca - SP",
    source: "manual" as const,
  };

  it("deve salvar dados com timestamp", () => {
    anonymousAddressStorage.save(mockData);
    expect(mockSet).toHaveBeenCalledTimes(1);

    const callArg = mockSet.mock
      .calls[0]?.[1] as Record<string, unknown>;
    expect(callArg.city).toBe("Franca");
    expect(callArg.timestamp).toBeGreaterThan(0);
    expect(callArg.source).toBe("manual");
  });

  it("deve carregar dados válidos dentro do TTL", () => {
    const saved = {
      ...mockData,
      timestamp: Date.now(),
    };
    mockGet.mockReturnValue(saved);

    const result = anonymousAddressStorage.load();
    expect(result).toEqual(saved);
  });

  it("deve retornar null para cache expirado", () => {
    const expired = {
      ...mockData,
      timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25h atrás
    };
    mockGet.mockReturnValue(expired);

    const result = anonymousAddressStorage.load();
    expect(result).toBeNull();
    expect(mockRemove).toHaveBeenCalled();
  });

  it("deve retornar null quando não há cache", () => {
    mockGet.mockReturnValue(null);

    const result = anonymousAddressStorage.load();
    expect(result).toBeNull();
  });

  it("exists() deve retornar true para cache válido", () => {
    const saved = {
      ...mockData,
      timestamp: Date.now(),
    };
    mockGet.mockReturnValue(saved);

    expect(anonymousAddressStorage.exists()).toBe(true);
  });

  it("exists() deve retornar false para cache vazio", () => {
    mockGet.mockReturnValue(null);
    expect(anonymousAddressStorage.exists()).toBe(false);
  });

  it("clear() deve remover do storage", () => {
    anonymousAddressStorage.clear();
    expect(mockRemove).toHaveBeenCalled();
  });

  it("deve salvar dados sem neighborhood", () => {
    const withoutNeighborhood = {
      coordinates: { latitude: -20.535, longitude: -47.395 },
      city: "Franca",
      state: "SP",
      formattedAddress: "Franca - SP",
      source: "gps" as const,
    };
    anonymousAddressStorage.save(withoutNeighborhood);

    const callArg = mockSet.mock
      .calls[0]?.[1] as Record<string, unknown>;
    expect(callArg.city).toBe("Franca");
    expect(callArg.source).toBe("gps");
    expect(callArg.neighborhood).toBeUndefined();
  });

  it("deve carregar com TTL personalizado", () => {
    const saved = {
      ...mockData,
      timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2h atrás
    };
    mockGet.mockReturnValue(saved);

    // TTL de 1h deve expirar
    expect(anonymousAddressStorage.load(3600000)).toBeNull();
    // TTL de 3h deve manter
    expect(anonymousAddressStorage.load(10800000)).toEqual(saved);
  });
});
