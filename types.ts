
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  partner?: string; 
  partnerLink?: string; // Link direto para a loja do parceiro
  isLightningDeal: boolean;
  createdAt: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  paymentMethod: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface AppSettings {
  logoUrl: string;
  whatsappNumber: string;
  storeName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
}
