import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface CartItem {
  cart_item_id?: string;
  product_id: string;
  name: string;
  slug: string;
  sku: string;
  unit_price: number;
  line_total: number;
  quantity: number;
  stock_quantity: number;
  primary_image?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
  addItem: (productId: string, quantity?: number, productData?: any) => Promise<void>;
  updateQuantity: (itemIdOrProductId: string, quantity: number) => Promise<void>;
  removeItem: (itemIdOrProductId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'krilea_guest_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load cart on auth change
  const refreshCart = async () => {
    setIsLoading(true);
    if (isAuthenticated) {
      try {
        // First check if there's a guest cart to merge
        const guestData = localStorage.getItem(GUEST_CART_KEY);
        if (guestData) {
          try {
            const guestItems: CartItem[] = JSON.parse(guestData);
            if (guestItems.length > 0) {
              await api.post('/cart/merge', {
                items: guestItems.map((g) => ({ productId: g.product_id, quantity: g.quantity })),
              });
            }
            localStorage.removeItem(GUEST_CART_KEY);
          } catch (e) {
            console.error('Failed merging guest cart:', e);
          }
        }

        const data = await api.get<{ items: CartItem[] }>('/cart');
        setItems(data.items || []);
      } catch (err) {
        console.error('Failed loading server cart:', err);
      }
    } else {
      // Guest mode
      try {
        const guestData = localStorage.getItem(GUEST_CART_KEY);
        if (guestData) {
          setItems(JSON.parse(guestData));
        } else {
          setItems([]);
        }
      } catch {
        setItems([]);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated, user?.id]);

  const saveGuestCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));
  };

  const addItem = async (productId: string, quantity = 1, productData?: any) => {
    if (isAuthenticated) {
      try {
        const res = await api.post<{ items: CartItem[] }>('/cart/items', { productId, quantity });
        setItems(res.items || []);
        toast.success('Added to your shopping bag');
      } catch (err: any) {
        toast.error(err.message || 'Could not add item to bag');
        throw err;
      }
    } else {
      // Guest cart
      const existingIndex = items.findIndex((i) => i.product_id === productId);
      let newItems = [...items];
      if (existingIndex > -1) {
        newItems[existingIndex].quantity += quantity;
        newItems[existingIndex].line_total = newItems[existingIndex].unit_price * newItems[existingIndex].quantity;
      } else if (productData) {
        const price = parseFloat(productData.salePrice || productData.price || 0);
        newItems.push({
          product_id: productId,
          name: productData.name,
          slug: productData.slug || '',
          sku: productData.sku || '',
          unit_price: price,
          line_total: price * quantity,
          quantity: quantity,
          stock_quantity: productData.quantity || 99,
          primary_image: productData.images?.[0]?.url || productData.primary_image || productData.image,
        });
      }
      saveGuestCart(newItems);
      toast.success('Added to your shopping bag');
    }
  };

  const updateQuantity = async (itemIdOrProductId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemIdOrProductId);
    }

    if (isAuthenticated) {
      try {
        const res = await api.put<{ items: CartItem[] }>(`/cart/items/${itemIdOrProductId}`, { quantity });
        setItems(res.items || []);
      } catch (err: any) {
        toast.error(err.message || 'Could not update quantity');
      }
    } else {
      const newItems = items.map((i) => {
        if (i.cart_item_id === itemIdOrProductId || i.product_id === itemIdOrProductId) {
          return {
            ...i,
            quantity,
            line_total: i.unit_price * quantity,
          };
        }
        return i;
      });
      saveGuestCart(newItems);
    }
  };

  const removeItem = async (itemIdOrProductId: string) => {
    if (isAuthenticated) {
      try {
        const res = await api.delete<{ items: CartItem[] }>(`/cart/items/${itemIdOrProductId}`);
        setItems(res.items || []);
        toast.success('Item removed from shopping bag');
      } catch (err: any) {
        toast.error(err.message || 'Could not remove item');
      }
    } else {
      const newItems = items.filter(
        (i) => i.cart_item_id !== itemIdOrProductId && i.product_id !== itemIdOrProductId
      );
      saveGuestCart(newItems);
      toast.success('Item removed from shopping bag');
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
        setItems([]);
      } catch (err: any) {
        console.error('Error clearing cart:', err);
      }
    } else {
      saveGuestCart([]);
    }
  };

  const totalItems = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const subtotal = items.reduce((sum, i) => sum + (parseFloat(String(i.line_total || 0))), 0);
  const total = subtotal;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        isLoading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
