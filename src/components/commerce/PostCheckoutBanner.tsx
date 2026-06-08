import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button";

interface PostCheckoutBannerProps {
  guestName: string;
  guestEmail: string;
  onCreateAccount: () => void;
  onDismiss: () => void;
}

/**
 * Banner exibido após o checkout como guest, oferecendo
 * criação de conta com os dados já preenchidos.
 */
export function PostCheckoutBanner({
  guestName,
  guestEmail,
  onCreateAccount,
  onDismiss,
}: PostCheckoutBannerProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-primary/15 flex items-center justify-center shrink-0">
          <Icon name="User" className="text-brand-primary" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary">
            Salvar seus dados?
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Crie uma conta rápida com seus dados de entrega já preenchidos e
            acompanhe seus pedidos.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-background transition-colors shrink-0"
          aria-label="Fechar sugestão"
        >
          <Icon name="X" className="text-text-tertiary" size={18} />
        </button>
      </div>

      <div className="rounded-xl bg-surface-elevated border border-border-default p-3 text-sm">
        <div className="flex items-center gap-2 text-text-primary">
          <Icon name="Check" size={14} className="text-feedback-success" />
          <span>{guestName}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary mt-1">
          <Icon name="MapPin" size={14} />
          <span>{guestEmail}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="solid"
          intent="primary"
          size="md"
          className="flex-1"
          onClick={onCreateAccount}
        >
          Criar conta grátis
        </Button>
        <Button
          variant="outline"
          intent="secondary"
          size="md"
          className="flex-1"
          onClick={onDismiss}
        >
          Agora não
        </Button>
      </div>

      <p className="text-xs text-text-tertiary text-center">
        Seus dados já foram salvos para este pedido. A conta é opcional.
      </p>
    </div>
  );
}
