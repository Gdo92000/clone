import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGuestCheckout } from "../../hooks/useGuestCheckout";

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

describe("useGuestCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve iniciar com valores vazios", () => {
    const { result } = renderHook(() => useGuestCheckout());

    expect(result.current.guestInfo).toEqual({
      name: "",
      phone: "",
      email: "",
    });
    expect(result.current.isValid).toBe(false);
  });

  it("deve atualizar campos", () => {
    const { result } = renderHook(() => useGuestCheckout());

    act(() => {
      result.current.updateField("name", "João Silva");
    });

    expect(result.current.guestInfo.name).toBe("João Silva");
  });

  it("deve persistir no localStorage quando houver dados", () => {
    const { result } = renderHook(() => useGuestCheckout());

    act(() => {
      result.current.updateField("name", "João");
    });

    expect(mockSet).toHaveBeenCalled();
  });

  it("deve carregar dados salvos do localStorage", () => {
    mockGet.mockReturnValue({
      name: "João",
      phone: "16999999999",
      email: "joao@email.com",
    });

    const { result } = renderHook(() => useGuestCheckout());
    expect(result.current.guestInfo.name).toBe("João");
  });

  it("deve validar dados corretos", () => {
    const { result } = renderHook(() => useGuestCheckout());

    act(() => {
      result.current.updateField("name", "João Silva");
      result.current.updateField("phone", "(16) 99999-9999");
      result.current.updateField("email", "joao@email.com");
    });

    expect(result.current.isValid).toBe(true);
  });

  it("deve invalidar nome curto", () => {
    const { result } = renderHook(() => useGuestCheckout());

    act(() => {
      result.current.updateField("name", "Jo");
      result.current.updateField("phone", "(16) 99999-9999");
      result.current.updateField("email", "joao@email.com");
    });

    expect(result.current.isValid).toBe(false);
  });

  it("deve invalidar telefone incompleto", () => {
    const { result } = renderHook(() => useGuestCheckout());

    act(() => {
      result.current.updateField("name", "João Silva");
      result.current.updateField("phone", "16");
      result.current.updateField("email", "joao@email.com");
    });

    expect(result.current.isValid).toBe(false);
  });

  it("deve invalidar email errado", () => {
    const { result } = renderHook(() => useGuestCheckout());

    act(() => {
      result.current.updateField("name", "João Silva");
      result.current.updateField("phone", "(16) 99999-9999");
      result.current.updateField("email", "email-invalido");
    });

    expect(result.current.isValid).toBe(false);
  });

  it("clear() deve limpar dados e storage", () => {
    const { result } = renderHook(() => useGuestCheckout());

    act(() => {
      result.current.updateField("name", "João");
      result.current.clear();
    });

    expect(result.current.guestInfo).toEqual({
      name: "",
      phone: "",
      email: "",
    });
    expect(mockRemove).toHaveBeenCalled();
  });
});
