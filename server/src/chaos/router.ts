/**
 * Chaos Router — gerenciador de cenários de caos para testes de resiliência.
 *
 * Funcionalidade:
 *  - `initChaosRouter()`             → inicializa o store de cenários padrão
 *  - `updateChaosScenarios()`        → substitui/atualiza os cenários ativos
 *  - `getActiveChaosScenarios()`     → retorna todos os cenários ativos (imutável)
 *  - `isChaosEnabled()`              → retorna se algum cenário está ativo
 *  - `getChaosScenario()`            → retorna um cenário específico por chave
 *
 * Só ativo em modo memory (DATABASE_PROVIDER=memory → capabilities.hasChaos=true).
 * Em modo postgres: initChaosRouter() é no-op, todos os getters retornam valores neutros.
 *
 * Cenários suportados:
 *  | chave         | efeito                         |
 *  |---------------|-------------------------------|
 *  | `latency`     | atraso artificial em respostas |
 *  | `error_rate`  | % de requisições que falham    |
 *  | `timeout`     | simula timeout de conexão      |
 */

// ─── tipos ──────────────────────────────────────────────────────────────────────

/** Cenário de caos individual. */
export interface ChaosScenario {
  key: string;
  enabled: boolean;
  /** Atraso mínimo em ms (valores negativos removem delay). */
  latencyMs: number;
  /** 0–1: fração de requisições que devem falhar (0 = sem erro). */
  errorRate: number;
  /** true: simula erro de timeout em vez de erro genérico. */
  simulateTimeout: boolean;
}

/** Opções de atualização — campos parcialmente opcionais. */
export type UpdateChaosOptions = Partial<{
  latencyMs: number;
  errorRate: number;
  simulateTimeout: boolean;
}>;

// ─── cenários padrão ─────────────────────────────────────────────────────────────

const DEFAULT_SCENARIOS: Record<string, ChaosScenario> = {
  latency: { key: 'latency', enabled: true, latencyMs: 200, errorRate: 0, simulateTimeout: false },
  error_rate: { key: 'error_rate', enabled: true, latencyMs: 0, errorRate: 0, simulateTimeout: false },
  timeout: { key: 'timeout', enabled: false, latencyMs: 0, errorRate: 0, simulateTimeout: true },
};

// ─── store ──────────────────────────────────────────────────────────────────────

let _scenarios: Record<string, ChaosScenario> = { ...DEFAULT_SCENARIOS };
let _chaosInitialized = false;

/** Atualiza/insere um cenário específico. */
export function updateChaosScenarios(opts: UpdateChaosOptions): void {
  // Se recebeu opções sem chave (ex: só { latencyMs: 300 }) aplica ao cenário padrão
  const hasErrorRate = Object.prototype.hasOwnProperty.call(opts, 'errorRate');
  const key = Object.prototype.hasOwnProperty.call(opts, 'latencyMs') || hasErrorRate
    ? (hasErrorRate ? 'error_rate' : 'latency')
    : (Object.prototype.hasOwnProperty.call(opts, 'simulateTimeout') ? 'timeout' : 'latency');

  const existing = _scenarios[key];
  _scenarios = {
    ..._scenarios,
    [key]: { ...existing, ...(opts as ChaosScenario) },
  };
}

/** Retorna todos os cenários ativos como cópia imutável. */
export function getActiveChaosScenarios(): Record<string, ChaosScenario> {
  return Object.fromEntries(
    Object.entries(_scenarios).filter(([, s]) => s.enabled),
  );
}

/** Retorna um cenário específico por chave, ou undefined se não existir. */
export function getChaosScenario(key: string): ChaosScenario | undefined {
  return _scenarios[key];
}

/** Reseta todos os cenários para os valores padrão. */
export function resetChaosScenarios(): void {
  _scenarios = { ...DEFAULT_SCENARIOS };
}

// ─── inicialização ───────────────────────────────────────────────────────────────

/**
 * getEffectiveLatencyMs — retorna o delay efetivo do cenário `latency`.
 * Use na middleware de rota para introduzir latência artificial.
 */
export function getEffectiveLatencyMs(): number {
  const s = _scenarios.latency;
  return s.enabled && s.latencyMs > 0 ? s.latencyMs : 0;
}

/**
 * shouldFail — retorna true se o cenário de erro está ativo e sorteio cai no erro_rate.
 * Não lança — apenas sinaliza. Use para decidir se responde com erro.
 */
export function shouldFail(): boolean {
  const s = _scenarios.error_rate;
  return s.enabled && s.errorRate > 0 && Math.random() < s.errorRate;
}

/**
 * shouldTimeout — retorna true se timeout está ativo.
 */
export function shouldTimeout(): boolean {
  return _scenarios.timeout.enabled && _scenarios.timeout.simulateTimeout;
}

// ─── init / isEnabled ────────────────────────────────────────────────────────────

/** initChaosRouter — inicializa os cenários padrão (idempotente). */
export function initChaosRouter(): void {
  if (_chaosInitialized) return;
  _chaosInitialized = true;
  // Aplica latência zero no startup para não atrasar dev desprevenido
  _scenarios = {
    error_rate: DEFAULT_SCENARIOS.error_rate,
    latency: { ...DEFAULT_SCENARIOS.latency, latencyMs: 0 },
    timeout: DEFAULT_SCENARIOS.timeout,
  };
}

/** isChaosEnabled — retorna se há pelo menos um cenário ativo. */
export function isChaosEnabled(): boolean {
  return Object.values(_scenarios).some((s) => s.enabled);
}

