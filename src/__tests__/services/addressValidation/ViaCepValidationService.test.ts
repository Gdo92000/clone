import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type {
  ViaCepResponse,
} from "../../../services/addressValidation/ViaCepValidationService";
import {
  ViaCepValidationService,
} from "../../../services/addressValidation/ViaCepValidationService";
import * as httpClient from "../../../api/httpClient";

describe("ViaCepValidationService", () => {
  let service: ViaCepValidationService;
  let mockGet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGet = vi.fn();
    vi.spyOn(httpClient, "get").mockImplementation(mockGet);
    service = new ViaCepValidationService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    service.clearCache();
  });

  describe("validateByCep", () => {
    it("deve retornar erro para CEP com menos de 8 dígitos", async () => {
      const result = await service.validateByCep("123");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("CEP deve conter 8 dígitos");
    });

    it("deve consultar ViaCEP e retornar dados normalizados", async () => {
      const mockResponse: ViaCepResponse = {
        cep: "14400-320",
        logradouro: "Avenida Champagnat",
        complemento: "",
        unidade: "",
        bairro: "Centro",
        localidade: "Franca",
        uf: "SP",
        estado: "São Paulo",
        regiao: "Sudeste",
        ibge: "3516200",
        gia: "1234",
        ddd: "16",
        siafi: "6789",
        erro: false,
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.validateByCep("14400320");

      expect(result.isValid).toBe(true);
      expect(result.cep).toBe("14400-320");
      expect(result.street).toBe("avenida champagnat");
      expect(result.neighborhood).toBe("Centro");
      expect(result.city).toBe("Franca");
      expect(result.state).toBe("SP");
    });

    it("deve retornar erro se ViaCEP responder com erro", async () => {
      const mockResponse: ViaCepResponse = {
        cep: "00000-000",
        logradouro: "",
        complemento: "",
        unidade: "",
        bairro: "",
        localidade: "",
        uf: "",
        estado: "",
        regiao: "",
        ibge: "",
        gia: "",
        ddd: "",
        siafi: "",
        erro: true,
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.validateByCep("00000000");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("CEP não encontrado");
    });

    it("deve funcionar em cache", async () => {
      const mockResponse: ViaCepResponse = {
        cep: "14400-320",
        logradouro: "Avenida Champagnat",
        complemento: "",
        unidade: "",
        bairro: "Centro",
        localidade: "Franca",
        uf: "SP",
        estado: "São Paulo",
        regiao: "Sudeste",
        ibge: "3516200",
        gia: "1234",
        ddd: "16",
        siafi: "6789",
        erro: false,
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const first = await service.validateByCep("14400320");
      expect(first).not.toBeNull();

      const start = Date.now();
      const second = await service.validateByCep("14400320");
      const elapsed = Date.now() - start;

      expect(second).not.toBeNull();
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(elapsed).toBeLessThan(100);
    });
  });

  describe("validateByAddress", () => {
    it("deve retornar erro se faltar campos obrigatórios", async () => {
      const result = await service.validateByAddress({
        uf: "SP",
        localidade: "Franca",
        logradouro: "",
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("UF, cidade e logradouro são obrigatórios");
    });

    it("deve consultar ViaCEP por endereço e retornar dados", async () => {
      const mockResponse: ViaCepResponse[] = [
        {
          cep: "14400-320",
          logradouro: "Avenida Champagnat",
          complemento: "",
          unidade: "",
          bairro: "Centro",
          localidade: "Franca",
          uf: "SP",
          estado: "São Paulo",
          regiao: "Sudeste",
          ibge: "3516200",
          gia: "1234",
          ddd: "16",
          siafi: "6789",
          erro: false,
        },
      ];

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.validateByAddress({
        uf: "SP",
        localidade: "Franca",
        logradouro: "Avenida Champagnat",
      });

      expect(result.isValid).toBe(true);
      expect(result.cep).toBe("14400-320");
      expect(result.street).toBe("avenida champagnat");
      expect(result.city).toBe("Franca");
      expect(result.state).toBe("SP");
    });

    it("deve retornar sugestões se houver múltiplos CEPs", async () => {
      const mockResponse: ViaCepResponse[] = [
        {
          cep: "14400-320",
          logradouro: "Avenida Champagnat",
          complemento: "",
          unidade: "",
          bairro: "Centro",
          localidade: "Franca",
          uf: "SP",
          estado: "São Paulo",
          regiao: "Sudeste",
          ibge: "3516200",
          gia: "1234",
          ddd: "16",
          siafi: "6789",
          erro: false,
        },
        {
          cep: "14400-321",
          logradouro: "Avenida Champagnat",
          complemento: "",
          unidade: "",
          bairro: "Centro",
          localidade: "Franca",
          uf: "SP",
          estado: "São Paulo",
          regiao: "Sudeste",
          ibge: "3516200",
          gia: "1234",
          ddd: "16",
          siafi: "6789",
          erro: false,
        },
      ];

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.validateByAddress({
        uf: "SP",
        localidade: "Franca",
        logradouro: "Avenida Champagnat",
      });

      expect(result.isValid).toBe(true);
      expect(result.suggestions).toEqual(["14400-320", "14400-321"]);
    });
  });

  describe("validateFullAddress", () => {
    it("deve validar por CEP quando fornecido", async () => {
      const mockResponse: ViaCepResponse = {
        cep: "14400-320",
        logradouro: "Avenida Champagnat",
        complemento: "",
        unidade: "",
        bairro: "Centro",
        localidade: "Franca",
        uf: "SP",
        estado: "São Paulo",
        regiao: "Sudeste",
        ibge: "3516200",
        gia: "1234",
        ddd: "16",
        siafi: "6789",
        erro: false,
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.validateFullAddress({
        cep: "14400320",
        street: "Avenida Champagnat",
        city: "Franca",
        state: "SP",
      });

      expect(result.isValid).toBe(true);
      expect(result.cep).toBe("14400-320");
    });

    it("deve validar por endereço completo quando CEP ausente", async () => {
      const mockResponse: ViaCepResponse[] = [
        {
          cep: "14400-320",
          logradouro: "Avenida Champagnat",
          complemento: "",
          unidade: "",
          bairro: "Centro",
          localidade: "Franca",
          uf: "SP",
          estado: "São Paulo",
          regiao: "Sudeste",
          ibge: "3516200",
          gia: "1234",
          ddd: "16",
          siafi: "6789",
          erro: false,
        },
      ];

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.validateFullAddress({
        street: "Avenida Champagnat",
        city: "Franca",
        state: "SP",
      });

      expect(result.isValid).toBe(true);
      expect(result.cep).toBe("14400-320");
    });

    it("deve detectar inconsistência entre CEP e outros campos", async () => {
      const mockResponse: ViaCepResponse = {
        cep: "14400-320",
        logradouro: "Avenida Champagnat",
        complemento: "",
        unidade: "",
        bairro: "Centro",
        localidade: "Franca",
        uf: "SP",
        estado: "São Paulo",
        regiao: "Sudeste",
        ibge: "3516200",
        gia: "1234",
        ddd: "16",
        siafi: "6789",
        erro: false,
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.validateFullAddress({
        cep: "14400320",
        street: "Rua Alegre",
        city: "Franca",
        state: "SP",
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("não correspondem");
      const suggestion = result.suggestions.find(
        (s) => s.includes("avenida champagnat") && s.includes("Rua Alegre"),
      );
      expect(suggestion).toBeDefined();
    });

    it("deve retornar erro se faltar dados suficientes", async () => {
      const result = await service.validateFullAddress({});
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Forneça CEP ou endereço completo");
    });
  });

  describe("clearCache", () => {
    it("deve limpar cache do localStorage", async () => {
      const mockResponse: ViaCepResponse = {
        cep: "14400-320",
        logradouro: "Avenida Champagnat",
        complemento: "",
        unidade: "",
        bairro: "Centro",
        localidade: "Franca",
        uf: "SP",
        estado: "São Paulo",
        regiao: "Sudeste",
        ibge: "3516200",
        gia: "1234",
        ddd: "16",
        siafi: "6789",
        erro: false,
      };

      mockGet.mockResolvedValueOnce(mockResponse);
      await service.validateByCep("14400320");
      expect(mockGet).toHaveBeenCalledTimes(1);

      service.clearCache();

      mockGet.mockResolvedValueOnce(mockResponse);
      await service.validateByCep("14400320");
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });
});