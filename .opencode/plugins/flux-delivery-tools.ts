import { type Plugin, tool } from "@opencode-ai/plugin";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export const FluxDeliveryPlugin: Plugin = {
  name: "FluxDeliveryCoreTools",
  tools: [
    // FERRAMENTA 1: Sincronizar Banco de Dados com Drizzle ORM
    tool({
      name: "flux_sync_db_schema",
      description: "Use esta ferramenta sempre que você (IA) alterar, criar ou deletar uma tabela ou coluna nos schemas do Drizzle em 'server/src/db/'. Ela gera a migration e aplica no banco local.",
      parameters: {
        type: "object",
        properties: {
          motivoAlteracao: { type: "string", description: "O motivo da mudança no banco (ex: 'adicionando coluna de foto no perfil do entregador')" }
        },
        required: ["motivoAlteracao"]
      },
      execute: async ({ motivoAlteracao }) => {
        try {
          // Gera a migration com o Drizzle-Kit
          execSync("npx drizzle-kit generate", { cwd: path.join(process.cwd(), "server") });
          // Aplica as mudanças no banco PostgreSQL (Supabase)
          execSync("npx drizzle-kit migrate", { cwd: path.join(process.cwd(), "server") });
          
          return { success: true, output: `Migration gerada e aplicada com sucesso para: ${motivoAlteracao}` };
        } catch (error: any) {
          return { success: false, output: `Falha ao rodar migrations do Drizzle: ${error.message}` };
        }
      }
    }),

    // FERRAMENTA 2: Scaffold de Novo Módulo respeitando a arquitetura multi-perfil
    tool({
      name: "flux_create_feature_module",
      description: "Use esta ferramenta quando o usuário pedir para criar uma nova funcionalidade que afete um perfil específico (ex: lojista, entregador, saas). Ela cria a estrutura de pastas correta no Frontend.",
      parameters: {
        type: "object",
        properties: {
          perfil: { 
            type: "string", 
            enum: ["admin", "auth", "courier", "enterprise", "experience", "merchant", "saas", "superadmin"],
            description: "O perfil/modulo alvo do sistema." 
          },
          nomeFeature: { type: "string", description: "Nome da feature em camelCase (ex: 'gerenciamentoPlanos')" }
        },
        required: ["perfil", "nomeFeature"]
      },
      execute: async ({ perfil, nomeFeature }) => {
        try {
          const basePath = path.join(process.cwd(), "src", "modules", perfil, nomeFeature);
          
          // Cria a estrutura padrão que seu projeto React usa dentro dos módulos
          fs.mkdirSync(basePath, { recursive: true });
          fs.mkdirSync(path.join(basePath, "components"), { recursive: true });
          fs.mkdirSync(path.join(basePath, "hooks"), { recursive: true });
          
          // Cria um arquivo index de exemplo
          fs.writeFileSync(
            path.join(basePath, "index.ts"), 
            `// Exportações da feature ${nomeFeature} para o perfil ${perfil}\n`
          );

          return { 
            success: true, 
            output: `Estrutura criada com sucesso em src/modules/${perfil}/${nomeFeature}/ [components/, hooks/, index.ts]` 
          };
        } catch (error: any) {
          return { success: false, output: `Erro ao criar estrutura do módulo: ${error.message}` };
        }
      }
    }),

    // FERRAMENTA 3: Validador Fullstack (Zod e Tipos TypeScript)
    tool({
      name: "flux_validate_project",
      description: "Use esta ferramenta após alterar schemas compartilhados do Zod em 'shared/validations/' ou rotas do Hono para garantir que o build do TypeScript e o Linter continuam passando tanto no front quanto no back.",
      parameters: {
        type: "object",
        properties: {}
      },
      execute: async () => {
        try {
          // Executa o lint geral do projeto definido no seu package.json
          execSync("npm run lint", { stdio: "pipe" });
          // Executa o build do TypeScript (tsc -b --noEmit) para validar tipos cross-project
          execSync("npm run build", { stdio: "pipe" });
          
          return { success: true, output: "O projeto foi validado com sucesso! Tipos TypeScript e ESLint estão 100% corretos." };
        } catch (error: any) {
          return { 
            success: false, 
            output: `Quebra de tipos ou erro de lint detectada:\n${error.stdout?.toString() || error.message}` 
          };
        }
      }
    })
  ]
};