import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'oro' | 'diamantes' | 'relojes';
  images: string[]; // Array of image URLs or base64
  description: string;
}

export interface Message {
  id: string;
  name: string;
  phone: string;
  type: string;
  message: string;
  status: 'pendiente' | 'leído';
  created_at: string;
}

export const api = {
  products: {
    getAll: async (): Promise<Product[]> => {
      const res = await fetch('/api/products');
      const data = await res.json();
      return data.map((p: any) => ({
        ...p,
        images: JSON.parse(p.images || '[]')
      }));
    },
    create: async (product: Product) => {
      return fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          images: JSON.stringify(product.images)
        }),
      });
    },
    update: async (id: string, product: Partial<Product>) => {
      const payload = { ...product };
      if (product.images) {
        payload.images = JSON.stringify(product.images) as any;
      }
      return fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    },
    delete: async (id: string) => {
      return fetch(`/api/products/${id}`, { method: 'DELETE' });
    }
  },
  messages: {
    getAll: async (): Promise<Message[]> => {
      const res = await fetch('/api/messages');
      return res.json();
    },
    create: async (message: Omit<Message, 'status' | 'created_at'>) => {
      return fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    },
    updateStatus: async (id: string, status: 'leído' | 'pendiente') => {
      return fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    }
  }
};
