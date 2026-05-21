import { eq } from 'drizzle-orm';
import { db } from '../index';
import { addons } from '../schema';
import { logger } from '../../lib/logger';

/**
 * Seed script para adicionar o addon kitchen_auto_print
 * Executar: bun run src/db/seeds/kitchen-auto-print-addon.seed.ts
 */
async function seedKitchenAutoPrintAddon() {
  logger.info('🌱 Seed: kitchen_auto_print addon');

  const kitchenAutoPrintAddon = {
    id: 'addon-kitchen-auto-print',
    name: 'Impressão Automática na Cozinha',
    description: 'Impressão automática de pedidos aceitos via ESC/POS. Requer configuração de impressora por filial.',
    monthly_price: '49.00',
    feature_key: 'kitchen_auto_print',
    is_active: true,
    created_at: new Date(),
  };

  try {
    // Verifica se já existe
    const existing = await db
      .select()
      .from(addons)
      .where(eq(addons.feature_key, 'kitchen_auto_print'))
      .limit(1);

    if (existing.length > 0) {
      logger.info('✅ kitchen_auto_print addon já existe');
      return;
    }

    await db.insert(addons).values(kitchenAutoPrintAddon);
    logger.info('✅ kitchen_auto_print addon criado com sucesso');
  } catch (error) {
    logger.error('❌ Erro ao criar kitchen_auto_print addon', { error });
    throw error;
  }
}

// Executar seed se for o arquivo principal
if (require.main === module) {
  seedKitchenAutoPrintAddon()
    .then(() => {
      logger.info('Seed concluído');
      process.exit(0);
    })
    .catch((err: unknown) => {
      logger.error('Falha no seed', { err });
      process.exit(1);
    });
}

export { seedKitchenAutoPrintAddon };
