import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface WishlistItem {
  wishlist_item_id?: string;
  product_id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  is_active: boolean;
  material?: string;
  primary_image?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  count: number;
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string, productData?: any) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const GUEST_WISHLIST_KEY = 'krilea_guest_wishlist';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshWishlist = async () => {
    setIsLoading(true);
    if (isAuthenticated) {
      try {
        const data = await api.get<WishlistItem[]>('/wishlist');
        setItems(data || []);
      } catch (err) {
        console.error('Failed loading server wishlist:', err);
      }
    } else {
      try {
        const guestData = localStorage.getItem(GUEST_WISHLIST_KEY);
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
    refreshWishlist();
  }, [isAuthenticated, user?.id]);

  const saveGuestWishlist = (newItems: WishlistItem[]) => {
    setItems(newItems);
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(newItems));
  };

  const isInWishlist = (productId: string): boolean => {
    return items.some((i) => i.product_id === productId);
  };

  const toggleWishlist = async (productId: string, productData?: any) => {
    if (isAuthenticated) {
      try {
        const res = await api.post<{ inWishlist: boolean }>('/wishlist/toggle', { productId });
        if (res.inWishlist) {
          toast.success('Saved to your wishlist');
        } else {
          toast.info('Removed from wishlist');
        }
        await refreshWishlist();
      } catch (err: any) {
        toast.error(err.message || 'Could not update wishlist');
      }
    } else {
      // Guest
      const exists = items.some((i) => i.product_id === productId);
      if (exists) {
        const filtered = items.filter((i) => i.product_id !== productId);
        saveGuestWishlist(filtered);
        toast.info('Removed from wishlist');
      } else if (productData) {
        const newItem: WishlistItem = {
          product_id: productId,
          name: productData.name,
          slug: productData.slug || '',
          sku: productData.sku || '',
          price: parseFloat(productData.price || 0),
          sale_price: productData.salePrice ? parseFloat(productData.salePrice) : undefined,
          stock_quantity: productData.quantity || 10,
          is_active: true,
          material: productData.material,
          primary_image: productData.images?.[0]?.url || productData.primary_image || productData.image,
        };
        saveGuestWishlist([...items, newItem]);
        toast.success('Saved to your wishlist');
      }
    }
  };

  const removeItem = async (productId: string) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/wishlist/${productId}`);
        setItems((prev) => prev.filter((i) => i.product_id !== productId && i.wishlist_item_id !== productId));
        toast.info('Removed from wishlist');
      } catch (err: any) {
        toast.error(err.message || 'Could not remove from wishlist');
      }
    } else {
      const filtered = items.filter((i) => i.product_id !== productId && i.wishlist_item_id !== productId);
      saveGuestWishlist(filtered);
      toast.info('Removed from wishlist');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        isLoading,
        isInWishlist,
        toggleWishlist,
        removeItem,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
