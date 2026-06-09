/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useCallback, useReducer, useEffect, useMemo, type ReactNode } from 'react';
import type { CartItem } from '../types';
import { calculateCartTotals } from '../useCases/cartUseCase';
import { logger } from '../lib/logger';

function additiveSetsEqual(a: CartItem['additives'], b: CartItem['additives']): boolean {
  const aIds = a?.map((x) => x.id).sort() ?? [];
  const bIds = b?.map((x) => x.id).sort() ?? [];
  return aIds.length === bIds.length && aIds.every((id, i) => id === bIds[i]);
}

// ── State ──────────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
}

const STORAGE_KEY = 'fluxds_cart';

function initialCartState(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CartState;
      if (Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { items: [], restaurantId: null, restaurantName: null };
}

// ── Actions ─────────────────────────────────────────────────────────────────────

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const item = action.payload;
      // Se o item já existe no carrinho (mesmo menuItemId e mesmos additives),
      // apenas incrementa a quantidade
      const existingIndex = state.items.findIndex(
        (i) => i.menuItemId === item.menuItemId && i.notes === item.notes && additiveSetsEqual(i.additives, item.additives),
      );
      if (existingIndex >= 0) {
        const updated = [...state.items];
        const existing = updated[existingIndex];
        if (existing) {
          updated[existingIndex] = {
            ...existing,
            quantity: existing.quantity + item.quantity,
          };
        }
        return { ...state, items: updated };
      }
      return {
        ...state,
        items: [...state.items, item],
        restaurantId: state.restaurantId ?? item.restaurantId,
        restaurantName: state.restaurantName ?? item.restaurantId,
      };
    }
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.id !== id),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === id ? { ...i, quantity } : i,
        ),
      };
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter((i) => i.id !== action.payload.id);
      if (items.length === 0) {
        return { items: [], restaurantId: null, restaurantName: null };
      }
      return { ...state, items };
    }
    case 'CLEAR_CART':
      return { items: [], restaurantId: null, restaurantName: null };
    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────────────────────────────

interface CartContextValue extends CartState {
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  itemsCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, initialCartState);

  // Persistir no localStorage sempre que o estado mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      logger.warn('Cart', 'Falha ao persistir carrinho no localStorage');
    }
  }, [state]);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const totals = useMemo(() => calculateCartTotals(state.items), [state.items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      restaurantId: state.restaurantId,
      restaurantName: state.restaurantName,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      ...totals,
    }),
    [state, addItem, updateQuantity, removeItem, clearCart, totals],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ── Hook ────────────────────────────────────────────────────────────────────────

export function useCartContext(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return ctx;
}
