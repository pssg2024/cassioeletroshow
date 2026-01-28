
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  X, 
  Trash2, 
  Plus, 
  Package, 
  Settings, 
  LogOut, 
  Clock, 
  MapPin, 
  Phone, 
  Upload, 
  Link as LinkIcon, 
  Store, 
  Edit3, 
  ExternalLink, 
  Filter, 
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  Mail, 
  Zap,
  Loader2,
  Instagram,
  MessageCircle,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Star,
  ArrowRight
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type } from "@google/genai";
import { Product, CartItem, Order, AppSettings } from './types';

// Inicialização do Supabase
const supabaseUrl = 'https://psstizpjipnhvgjawubk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzc3RpenBqaXBuaHZnamF3dWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzODA1NDcsImV4cCI6MjA4NDk1NjU0N30.1iWDUElpQoenT8O_21mMunqwNW9bN67Hp4gZ_hX3wJw';
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_CREDS = {
  user: 'administrador',
  emails: ['cassioeletroshowsuporte@gmail.com', 'cassioeletroshow@gmail.com'],
  pass: 'Cassio2026@'
};

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'admin' | 'checkout'>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    logoUrl: 'https://raw.githubusercontent.com/cassioeletroshow/site/main/logo.png',
    whatsappNumber: '+5521965915765',
    storeName: 'CASSIO ELETRO SHOW OUTLET',
    heroTitle: 'SUA MAIS NOVA LOJA DE ELETRODOMÉSTICOS EM OUTLET',
    heroSubtitle: 'PRODUTOS NOVOS COM 1 ANO DE GARANTIA! PREÇOS QUE NÃO VOLTAM.',
    heroImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1600'
  });

  const loadData = async () => {
    setIsSyncing(true);
    try {
      const { data: pData } = await supabase.from('products').select('*').order('createdAt', { ascending: false });
      if (pData) setProducts(pData);

      const { data: oData } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
      if (oData) setOrders(oData);

      const { data: sData } = await supabase.from('settings').select('*').eq('id', 'global').single();
      if (sData) setSettings(sData.config);
    } catch (err) {
      console.error('Erro ao carregar do banco:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const syncSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await supabase.from('settings').upsert({ id: 'global', config: newSettings });
  };

  const addOrder = async (order: Order) => {
    setOrders([order, ...orders]);
    await supabase.from('orders').insert([order]);
  };

  const removeOrder = async (id: string) => {
    if (confirm('Deseja realmente excluir este pedido do histórico?')) {
      setOrders(orders.filter(o => o.id !== id));
      await supabase.from('orders').delete().eq('id', id);
    }
  };

  const saveProduct = async (product: Product) => {
    const exists = products.find(p => p.id === product.id);
    if (exists) {
      setProducts(products.map(p => p.id === product.id ? product : p));
      await supabase.from('products').update(product).eq('id', product.id);
    } else {
      setProducts([product, ...products]);
      await supabase.from('products').insert([product]);
    }
  };

  const deleteProduct = async (id: string) => {
    if (confirm('Deseja excluir este produto definitivamente?')) {
      setProducts(products.filter(p => p.id !== id));
      await supabase.from('products').delete().eq('id', id);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => { setView('home'); setSelectedPartner(null); }}>
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-orange-500 p-0.5 overflow-hidden bg-white shadow-lg transition-transform group-hover:scale-105">
              <img src={settings.logoUrl} className="w-full h-full object-cover rounded-full" onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=CE&background=001f3f&color=fff')} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
          <div className="flex flex-col">
            <div className="flex text-lg sm:text-xl font-black tracking-tighter leading-none">
              <span className="text-[#001f3f]">CASSIO</span>
              <span className="text-orange-500 ml-1">ELETRO SHOW</span>
            </div>
            <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Outlet</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center gap-6 mr-4">
            <button onClick={() => { setView('home'); setSelectedPartner(null); }} className={`font-bold text-[11px] uppercase tracking-widest transition-all ${view === 'home' ? 'text-orange-500' : 'text-[#001f3f] hover:text-orange-500'}`}>Início</button>
            <button onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })} className="text-[#001f3f] font-bold text-[11px] uppercase tracking-widest hover:text-orange-500 transition-all">Catálogo</button>
          </div>

          <div className="flex items-center bg-gray-50 p-1.5 rounded-full shadow-inner border border-gray-100">
            {isSyncing && <div className="p-1.5 animate-spin text-orange-500"><Database size={16}/></div>}
            <button onClick={() => setView('admin')} className={`p-1.5 transition-all rounded-full ${view === 'admin' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-orange-500'}`} title="Administração">
              <Settings size={20} />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-orange-500 text-white rounded-full shadow-md hover:bg-orange-600 hover:shadow-orange-200 transition-all ml-1 active:scale-95">
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#001f3f] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const HomeView = () => {
    const [search, setSearch] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    
    // Filtra produtos em destaque (Oferta Relâmpago)
    const featuredProducts = products.filter(p => p.isLightningDeal);
    
    // Slides agora contêm o objeto do produto se for uma oferta
    const slides = featuredProducts.length > 0 
      ? featuredProducts.map(p => ({ ...p, slideType: 'offer' as const }))
      : [{ 
          id: 'default',
          name: settings.heroTitle, 
          description: settings.heroSubtitle, 
          image: settings.heroImageUrl,
          slideType: 'default' as const
        }];

    useEffect(() => {
      if (slides.length <= 1) return;
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }, [slides.length]);

    const filteredProducts = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesPartner = selectedPartner ? p.partner === selectedPartner : true;
      return matchesSearch && matchesPartner;
    });

    const partners = Array.from(new Set(products.map(p => p.partner).filter(Boolean))) as string[];

    return (
      <div className="space-y-8 pb-24">
        {/* Banner Hero - Modo Oferta Especial */}
        <section className="relative h-[250px] sm:h-[300px] md:h-[350px] lg:h-[380px] flex items-center justify-center overflow-hidden bg-[#0a0f18] group/hero">
          
          {/* Slides */}
          {slides.map((slide, idx) => (
            <div 
              key={idx} 
              className={`absolute inset-0 transition-all duration-700 ease-in-out flex items-center justify-center ${idx === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}
            >
              {slide.slideType === 'offer' ? (
                // Layout "Mode" solicitado: Card Horizontal Escuro
                <div className="max-w-6xl w-full px-6 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 bg-[#0d1421] p-6 sm:p-10 rounded-[40px] shadow-2xl border border-white/5 mx-4">
                  <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left gap-2 sm:gap-4">
                    <div className="bg-[#002b5c] text-[#facc15] px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 shadow-lg tracking-widest">
                      <Star size={12} className="fill-[#facc15]" /> OFERTA ESPECIAL
                    </div>
                    
                    <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-[1.1] max-w-2xl">
                      {slide.name}
                    </h1>
                    
                    <div className="flex flex-wrap items-baseline justify-center md:justify-start gap-3 mt-1 sm:mt-2">
                      <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter">
                        R$ {slide.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      {slide.oldPrice && (
                        <span className="text-xs sm:text-sm text-gray-500 font-bold line-through tracking-widest">
                          R$ {slide.oldPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => addToCart(slide as Product)}
                      className="mt-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-4 rounded-2xl font-black text-[11px] sm:text-[13px] uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all active:scale-95 flex items-center gap-3 group/btn"
                    >
                      <ShoppingBag size={20} /> GARANTIR AGORA <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  
                  <div className="w-[180px] sm:w-[250px] lg:w-[320px] aspect-square rounded-[30px] overflow-hidden shadow-2xl border-4 border-white/5 shrink-0 bg-white/5">
                    <img src={slide.image} className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110" alt={slide.name} />
                  </div>
                </div>
              ) : (
                // Layout Padrão
                <div className="relative w-full h-full flex items-center justify-center">
                  <img src={slide.image} className="absolute inset-0 w-full h-full object-cover opacity-30 brightness-50" />
                  <div className="relative z-10 text-center px-6 max-w-4xl text-white flex flex-col items-center gap-3">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg mb-1 animate-pulse">OFERTAS EXCLUSIVAS</span>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.95] drop-shadow-2xl">{slide.name}</h1>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-200 uppercase tracking-widest mt-1">{slide.description}</p>
                    <button onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })} className="mt-4 bg-orange-500 hover:bg-white hover:text-orange-600 px-6 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center gap-2">VER CATÁLOGO <ChevronRight size={16} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Navegação Carrossel (Dots) */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {slides.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1 transition-all duration-500 rounded-full ${idx === currentSlide ? 'w-8 bg-orange-500' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          )}

          {/* Setas de Navegação (Desktop) */}
          {slides.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/5 hover:bg-orange-500 text-white rounded-full backdrop-blur-md transition-all opacity-0 group-hero:opacity-100 hidden md:flex"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/5 hover:bg-orange-500 text-white rounded-full backdrop-blur-md transition-all opacity-0 group-hero:opacity-100 hidden md:flex"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </section>

        {/* Catálogo Section */}
        <div id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-1.5 bg-orange-500 rounded-full"></div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#001f3f] uppercase tracking-tighter">Nosso Catálogo</h2>
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest ml-14">Tudo o que você precisa em um só lugar</p>
            </div>
            
            <div className="relative w-full md:max-w-md">
              <input 
                type="text" 
                placeholder="O que você está procurando hoje?" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="w-full p-4 pl-12 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50/50 text-sm font-semibold shadow-sm transition-all" 
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Filtros de Parceiros */}
          {partners.length > 0 && (
            <div className="flex gap-2 mb-10 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 scroll-smooth">
              <button 
                onClick={() => setSelectedPartner(null)} 
                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all whitespace-nowrap shadow-sm border-2 ${!selectedPartner ? 'bg-[#001f3f] text-white border-[#001f3f] scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'}`}
              >
                Todas as Lojas
              </button>
              {partners.map(p => (
                <button 
                  key={p} 
                  onClick={() => setSelectedPartner(p)} 
                  className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all whitespace-nowrap shadow-sm border-2 ${selectedPartner === p ? 'bg-orange-500 text-white border-orange-500 scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Grid de Produtos */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
              <Package size={64} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const AdminView = () => {
    const [loginData, setLoginData] = useState({ user: '', pass: '' });
    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const heroInputRef = useRef<HTMLInputElement>(null);
    const productInputRef = useRef<HTMLInputElement>(null);

    if (!isAdminLoggedIn) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
          <form 
            onSubmit={(e) => { e.preventDefault(); if ((loginData.user === ADMIN_CREDS.user || ADMIN_CREDS.emails.includes(loginData.user)) && loginData.pass === ADMIN_CREDS.pass) setIsAdminLoggedIn(true); else alert('Acesso Negado'); }} 
            className="bg-white p-8 sm:p-12 rounded-[40px] shadow-2xl w-full max-w-md border border-gray-100 transition-all hover:shadow-orange-100/50"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
                <Settings className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-black text-[#001f3f] uppercase tracking-tighter">Login</h2>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Usuário ou E-mail" value={loginData.user} onChange={e => setLoginData({...loginData, user: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 border border-transparent transition-all" />
              <input type="password" placeholder="Sua Senha" value={loginData.pass} onChange={e => setLoginData({...loginData, pass: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 border border-transparent transition-all" />
              <button className="w-full bg-[#001f3f] hover:bg-orange-500 text-white py-4 rounded-2xl font-black uppercase shadow-xl transition-all active:scale-95 mt-4">Entrar no Painel</button>
            </div>
          </form>
        </div>
      );
    }

    const extractFromLink = async (url: string) => {
      if (!url) return;
      setIsExtracting(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Extract product details from this URL: ${url}. Return ONLY a JSON object with: name, description, price (number), oldPrice (number), stock (boolean), and imageUrl.`,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                price: { type: Type.NUMBER },
                oldPrice: { type: Type.NUMBER },
                stock: { type: Type.BOOLEAN },
                imageUrl: { type: Type.STRING }
              },
              required: ["name", "price"]
            }
          }
        });

        const data = JSON.parse(response.text || '{}');
        setEditingProduct(prev => ({
          ...prev,
          name: data.name || prev?.name,
          description: data.description || prev?.description,
          price: data.price || prev?.price,
          oldPrice: data.oldPrice || prev?.oldPrice,
          image: data.imageUrl || prev?.image,
          partnerLink: url
        }));
      } catch (err) {
        console.error("Erro ao extrair:", err);
        alert("Não foi possível extrair os dados automaticamente. Verifique o link.");
      } finally {
        setIsExtracting(false);
      }
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero' | 'product') => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          if (type === 'logo') syncSettings({...settings, logoUrl: res});
          if (type === 'hero') syncSettings({...settings, heroImageUrl: res});
          if (type === 'product') setEditingProduct(prev => prev ? {...prev, image: res} : null);
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6 bg-white p-6 rounded-[30px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#001f3f] uppercase tracking-tighter leading-none">Painel de Controle</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Bem-vindo, Administrador</p>
            </div>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('products')} className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-white text-orange-500 shadow-md scale-105' : 'text-gray-400 hover:text-[#001f3f]'}`}>Produtos</button>
            <button onClick={() => setActiveTab('orders')} className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-white text-orange-500 shadow-md scale-105' : 'text-gray-400 hover:text-[#001f3f]'}`}>Pedidos</button>
            <button onClick={() => setActiveTab('settings')} className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-white text-orange-500 shadow-md scale-105' : 'text-gray-400 hover:text-[#001f3f]'}`}>Ajustes Site</button>
          </div>
          
          <button onClick={() => setIsAdminLoggedIn(false)} className="flex items-center gap-2 text-red-500 font-black hover:bg-red-50 px-6 py-3 rounded-xl uppercase transition-all text-[10px] tracking-widest border border-red-100">
            <LogOut size={16} /> Sair
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-[#001f3f] uppercase tracking-tighter">Estoque Atual</h3>
              <button onClick={() => setEditingProduct({})} className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 shadow-xl hover:bg-[#001f3f] transition-all hover:-translate-y-1 active:scale-95"><Plus size={18}/> Adicionar Novo</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-[30px] shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-lg transition-all duration-300">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <h4 className="font-black text-[#001f3f] text-xs uppercase truncate mb-1">{p.name}</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-orange-500 font-black text-sm">R$ {p.price.toFixed(2)}</span>
                      {p.oldPrice && <span className="text-[10px] text-gray-300 line-through">R$ {p.oldPrice.toFixed(2)}</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Store size={10} className="text-gray-400" />
                      <span className="text-[8px] font-bold text-gray-400 uppercase truncate">{p.partner || 'Loja Própria'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => setEditingProduct(p)} className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Editar"><Edit3 size={18}/></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Excluir"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
            {products.length === 0 && (
              <div className="py-20 text-center opacity-30">
                <Package size={80} className="mx-auto" />
                <p className="font-black mt-4 uppercase text-sm">Nenhum produto cadastrado</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {orders.map(o => (
              <div key={o.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 relative group hover:shadow-xl transition-all duration-300">
                <button onClick={() => removeOrder(o.id)} className="absolute top-6 right-6 p-3 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Remover Histórico"><Trash2 size={22}/></button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black">
                    {o.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#001f3f] uppercase tracking-tight">{o.customerName}</h4>
                    <p className="text-orange-500 font-black text-xs tracking-widest">{o.customerPhone}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Local de Entrega</p>
                    <p className="text-[11px] font-bold text-[#001f3f] leading-tight">{o.address}, {o.neighborhood}<br/>{o.city} - {o.zipCode}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Pagamento</p>
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-orange-500" />
                      <p className="text-[11px] font-bold text-[#001f3f]">{o.paymentMethod}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-[24px] space-y-3">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2">Itens do Pedido</p>
                  {o.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#001f3f]">{item.quantity}x {item.name}</span>
                      <span className="text-gray-400 font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-[#001f3f]">Total Geral</span>
                    <span className="text-xl font-black text-orange-500">R$ {o.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="col-span-2 py-32 text-center opacity-20">
                <Clock size={80} className="mx-auto"/>
                <p className="font-black mt-4 uppercase text-sm">Nenhum pedido recebido ainda</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in">
            <div className="bg-white p-8 sm:p-10 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle size={24} className="text-orange-500" />
                <h3 className="text-xl font-black text-[#001f3f] uppercase tracking-tighter">Identidade e Contato</h3>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-[30px] border-2 border-dashed border-gray-200 flex flex-col items-center gap-4">
                <img src={settings.logoUrl} className="w-24 h-24 rounded-full border-4 border-white p-1 bg-white shadow-xl" />
                <div className="flex gap-2 w-full">
                  <button onClick={() => logoInputRef.current?.click()} className="flex-1 px-4 py-3 bg-[#001f3f] text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-orange-500">Enviar Logo</button>
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFile(e, 'logo')} />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Nome da Empresa</label>
                  <input type="text" value={settings.storeName} onChange={e => syncSettings({...settings, storeName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 border border-transparent" placeholder="Ex: CASSIO ELETRO SHOW" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Link Direto Logo</label>
                  <input type="text" value={settings.logoUrl} onChange={e => syncSettings({...settings, logoUrl: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 border border-transparent" placeholder="Link da imagem da logo" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">WhatsApp Oficial</label>
                  <input type="text" value={settings.whatsappNumber} onChange={e => syncSettings({...settings, whatsappNumber: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 border border-transparent" placeholder="Ex: +5521965915765" />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap size={24} className="text-orange-500" />
                <h3 className="text-xl font-black text-[#001f3f] uppercase tracking-tighter">Vitrine Principal</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Título do Banner</label>
                  <input type="text" value={settings.heroTitle} onChange={e => syncSettings({...settings, heroTitle: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-orange-500 border border-transparent" placeholder="Ex: Sua nova loja de outlet" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Subtítulo de Impacto</label>
                  <textarea value={settings.heroSubtitle} onChange={e => syncSettings({...settings, heroSubtitle: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none h-28 text-sm focus:ring-2 focus:ring-orange-500 border border-transparent" placeholder="Descreva sua promoção principal..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Imagem de Fundo (FHD)</label>
                  <div className="flex gap-2">
                    <button onClick={() => heroInputRef.current?.click()} className="p-4 bg-orange-500 text-white rounded-2xl shadow-lg hover:bg-[#001f3f] transition-all"><Upload size={20}/></button>
                    <input type="file" ref={heroInputRef} className="hidden" accept="image/*" onChange={(e) => handleFile(e, 'hero')} />
                    <input type="text" value={settings.heroImageUrl} onChange={e => syncSettings({...settings, heroImageUrl: e.target.value})} className="flex-grow p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 border border-transparent" placeholder="Ou cole o link da imagem aqui" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição de Produto */}
        {editingProduct && (
          <div className="fixed inset-0 z-[100] bg-[#001f3f]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
            <div className="bg-white w-full max-w-2xl rounded-[40px] p-8 sm:p-12 max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in no-scrollbar relative">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center">
                    <Edit3 size={20} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#001f3f] uppercase tracking-tighter">{editingProduct.id ? 'Ajustar' : 'Cadastrar'} Produto</h3>
                </div>
                <button onClick={() => setEditingProduct(null)} className="p-2.5 bg-gray-50 text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X /></button>
              </div>

              {/* Automação via Link */}
              <div className="mb-10 p-6 bg-orange-50 border-2 border-orange-100 rounded-[30px] shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={16} className="text-orange-500" />
                  <label className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Preenchimento Automático via Link</label>
                </div>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Cole o link da Magazine Luiza, Casas Bahia, etc..." 
                    className="flex-grow p-4 bg-white border border-orange-200 rounded-2xl outline-none text-xs font-bold" 
                    onBlur={(e) => extractFromLink(e.target.value)}
                  />
                  <button 
                    disabled={isExtracting}
                    className="bg-orange-500 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg shadow-orange-200 hover:bg-[#001f3f] transition-all disabled:opacity-50"
                  >
                    {isExtracting ? <Loader2 className="animate-spin" size={16}/> : <Zap size={16}/>}
                    {isExtracting ? "Extraindo..." : "Extrair Dados"}
                  </button>
                </div>
                <p className="text-[8px] text-orange-400 font-bold uppercase tracking-widest mt-3 ml-2">* Nossa IA vai buscar preço, fotos e descrição para você.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Nome do Produto</label>
                    <input type="text" placeholder="Ex: Geladeira Frost Free 400L" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-orange-500 transition-all text-sm font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Loja Parceira (Terceiro)</label>
                    <input type="text" placeholder="Ex: Magalu / Casas Bahia" value={editingProduct.partner || ''} onChange={e => setEditingProduct({...editingProduct, partner: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-orange-500 transition-all text-sm font-bold" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Descrição do Produto</label>
                  <textarea placeholder="Detalhes técnicos, voltagem, cor..." value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none h-28 text-sm border border-transparent focus:border-orange-500 transition-all font-medium" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Preço com Desconto (Pix)</label>
                    <input type="number" placeholder="0.00" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-orange-500 transition-all text-sm font-black text-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Preço Original (Corte)</label>
                    <input type="number" placeholder="0.00" value={editingProduct.oldPrice || ''} onChange={e => setEditingProduct({...editingProduct, oldPrice: parseFloat(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-orange-500 transition-all text-sm font-bold text-gray-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Imagem do Produto</label>
                  <div className="flex gap-2">
                     <button type="button" onClick={() => productInputRef.current?.click()} className="p-4 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-all"><Upload size={20}/></button>
                     <input type="file" ref={productInputRef} className="hidden" accept="image/*" onChange={(e) => handleFile(e, 'product')} />
                     <input type="text" placeholder="Ou cole o link da foto aqui..." value={editingProduct.image || ''} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} className="flex-grow p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-orange-500 transition-all text-sm" />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-orange-50 rounded-[24px] border border-orange-100">
                  <input type="checkbox" id="l_check_2" checked={editingProduct.isLightningDeal || false} onChange={e => setEditingProduct({...editingProduct, isLightningDeal: e.target.checked})} className="w-6 h-6 accent-orange-500 cursor-pointer" />
                  <label htmlFor="l_check_2" className="text-xs font-black uppercase text-orange-600 cursor-pointer select-none">Ativar Selo: Oferta Relâmpago</label>
                </div>
                
                <button 
                  onClick={() => { if(!editingProduct.name || !editingProduct.price) return alert('Campos obrigatórios: Nome e Preço'); saveProduct({...editingProduct, id: editingProduct.id || Math.random().toString(36).substr(2, 9), createdAt: Date.now(), category: 'Outlet'} as Product); setEditingProduct(null); }} 
                  className="w-full bg-[#001f3f] text-white py-5 rounded-[24px] font-black uppercase shadow-2xl hover:bg-orange-500 transition-all active:scale-95 mt-4 text-sm tracking-widest"
                >
                  Salvar Produto no Catálogo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CheckoutView = () => {
    const [formData, setFormData] = useState({ name: '', phone: '', zip: '', address: '', neighborhood: '', city: 'Duque de Caxias', payment: 'Pix' });
    const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      const order: Order = { ...formData, id: Math.random().toString(36).substr(2, 9), customerName: formData.name, customerPhone: formData.phone, items: cart, total: cartTotal, status: 'pending', createdAt: Date.now(), zipCode: formData.zip, paymentMethod: formData.payment };
      addOrder(order);
      const msg = `*🛍️ NOVO PEDIDO - ${settings.storeName}*\n\n*CLIENTE:* ${formData.name}\n*CONTATO:* ${formData.phone}\n*PAGAMENTO:* ${formData.payment}\n\n*ENTREGA:* ${formData.address}, ${formData.neighborhood} - ${formData.city} (CEP: ${formData.zip})\n\n*PRODUTOS:*\n${cart.map(i => `● ${i.quantity}x ${i.name}`).join('\n')}\n\n*TOTAL:* R$ ${cartTotal.toFixed(2)}`;
      window.open(`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
      setCart([]); setView('home');
    };

    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-black text-[#001f3f] uppercase tracking-tighter mb-4">Finalize sua Compra</h2>
          <div className="w-24 h-2 bg-orange-500 rounded-full mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <form onSubmit={handleSend} className="lg:col-span-3 bg-white p-8 sm:p-12 rounded-[50px] shadow-2xl space-y-6 border border-gray-50">
            <h3 className="text-xl font-black text-[#001f3f] uppercase tracking-tight mb-4 border-l-4 border-orange-500 pl-4">Dados de Entrega</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Nome Completo</label>
                <input required placeholder="Como podemos te chamar?" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 transition-all font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">WhatsApp de Contato</label>
                <input required placeholder="(00) 00000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 transition-all font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">CEP</label>
                <input required placeholder="00000-000" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 transition-all font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Bairro</label>
                <input required placeholder="Ex: Campos Eliseos" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 transition-all font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Cidade</label>
                <input required placeholder="Duque de Caxias" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 transition-all font-bold" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Endereço Completo (Rua e Número)</label>
              <input required placeholder="Ex: Av. São Paulo, 12" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 transition-all font-bold" />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Forma de Pagamento Preferida</label>
              <select value={formData.payment} onChange={e => setFormData({...formData, payment: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 transition-all font-black text-[#001f3f]">
                <option value="Pix">Pagamento via Pix (Desconto)</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Dinheiro na Entrega">Dinheiro na Entrega</option>
              </select>
            </div>

            <button className="w-full bg-green-600 hover:bg-[#001f3f] text-white py-6 rounded-3xl font-black uppercase shadow-2xl shadow-green-100 transition-all flex items-center justify-center gap-4 text-sm tracking-widest active:scale-95 mt-8">
              <MessageCircle size={24}/> FINALIZAR PELO WHATSAPP
            </button>
          </form>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#001f3f] text-white p-8 sm:p-10 rounded-[50px] shadow-2xl h-fit border-b-[8px] border-orange-500">
              <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter border-b border-white/10 pb-4 flex items-center gap-3">
                <ShoppingBag size={24} className="text-orange-500" /> Seu Pedido
              </h3>
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar mb-8">
                {cart.map(i => (
                  <div key={i.id} className="flex justify-between text-xs font-bold items-start gap-4 animate-fade-in">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                        <img src={i.image} className="w-full h-full object-cover" />
                      </div>
                      <span className="max-w-[140px] leading-tight mt-1">{i.quantity}x {i.name}</span>
                    </div>
                    <span className="text-orange-400 whitespace-nowrap mt-1">R$ {(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-8 flex flex-col items-end">
                <span className="font-black text-[10px] uppercase text-gray-400 tracking-widest mb-1">Total a Pagar</span>
                <span className="text-4xl font-black text-orange-400 tracking-tighter">R$ {cartTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-orange-50 border-2 border-orange-100 p-8 rounded-[40px] flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm border border-orange-100">
                <Clock size={28} />
              </div>
              <div>
                <h4 className="font-black text-orange-600 uppercase text-xs tracking-widest">Entrega Relâmpago</h4>
                <p className="text-[10px] text-orange-400 font-bold uppercase mt-1">Sua compra chega rápido em toda região de Caxias!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col font-['Inter'] selection:bg-orange-500 selection:text-white">
      <Navbar />
      <main className="flex-grow bg-gray-50/50">{view === 'home' && <HomeView />}{view === 'admin' && <AdminView />}{view === 'checkout' && <CheckoutView />}</main>
      
      {/* Drawer do Carrinho */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-[#001f3f]/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center bg-[#001f3f] text-white shadow-xl">
              <div className="flex items-center gap-3">
                <ShoppingBag size={24} className="text-orange-500" />
                <h2 className="text-2xl font-black uppercase tracking-tighter">Meu Carrinho</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X /></button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 items-center animate-slide-in-right bg-gray-50 p-4 rounded-3xl border border-gray-100 group">
                  <div className="w-20 h-20 rounded-2xl object-cover shadow-md overflow-hidden bg-white shrink-0">
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <h4 className="font-black text-[11px] uppercase text-[#001f3f] leading-tight truncate">{item.name}</h4>
                    <p className="text-orange-500 font-black text-lg mt-1 tracking-tighter">R$ {item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
                        <button onClick={() => updateCartQuantity(item.id, -1)} className="px-3 py-1 font-black text-gray-400 hover:text-[#001f3f]">-</button>
                        <span className="font-black text-xs w-6 text-center text-[#001f3f]">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.id, 1)} className="px-3 py-1 font-black text-gray-400 hover:text-[#001f3f]">+</button>
                      </div>
                      <button onClick={() => { setCart(cart.filter(i => i.id !== item.id)); if(cart.length <= 1) setIsCartOpen(false); }} className="ml-auto p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-24 opacity-20 flex flex-col items-center">
                  <ShoppingBag size={100} />
                  <p className="font-black mt-6 uppercase tracking-widest text-sm">Seu carrinho está vazio</p>
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-8 border-t bg-gray-50/50 backdrop-blur-md shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between mb-8 items-center">
                  <span className="font-black text-[10px] uppercase text-gray-400 tracking-[0.2em]">Subtotal</span>
                  <span className="text-3xl font-black text-[#001f3f] tracking-tighter">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => { setIsCartOpen(false); setView('checkout'); }} 
                  className="w-full bg-orange-500 hover:bg-[#001f3f] text-white py-5 rounded-[24px] font-black uppercase shadow-2xl shadow-orange-100 transition-all text-sm tracking-widest active:scale-95 flex items-center justify-center gap-3"
                >
                  Continuar Compra <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RODAPÉ ESTILIZADO */}
      <footer className="bg-[#001f3f] text-white pt-20 pb-20 border-t-[10px] border-orange-500 mt-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[120px] rounded-full -mr-32 -mt-32"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
          
          {/* Coluna 1: Sobre */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                CASSIO <span className="text-orange-500">ELETRO</span>
              </h3>
              <p className="text-orange-500 font-black uppercase text-[10px] tracking-widest leading-none mt-1 ml-1">Show Outlet</p>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-400 font-bold uppercase tracking-wider">
              Maior outlet de Duque de Caxias, produtos novos com pequenas avarias com um ano de garantia! Preços imbatíveis todos os dias.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://www.instagram.com/cassioeletroshow/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl hover:bg-orange-500 hover:scale-110 transition-all border border-white/5">
                <Instagram size={22} className="text-white" />
              </a>
              <a href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl hover:bg-green-500 hover:scale-110 transition-all border border-white/5">
                <MessageCircle size={22} className="text-white" />
              </a>
            </div>
          </div>

          {/* Coluna 2: Localização */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase text-orange-500 tracking-[0.3em] border-l-4 border-orange-500 pl-4">Nossa Loja</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <MapPin size={20} className="text-orange-500" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-300 leading-relaxed">
                  Av. São Paulo 12<br />
                  Duque de Caxias, RJ<br />
                  Campos Eliseos
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <Clock size={20} className="text-orange-500" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-gray-300">
                  <p>9h às 18h</p>
                  <p className="text-orange-500 font-black">DOMINGO À DOMINGO</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 3: Atendimento */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase text-orange-500 tracking-[0.3em] border-l-4 border-orange-500 pl-4">Suporte</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <Phone size={20} className="text-orange-500" />
                </div>
                <p className="text-sm font-black tracking-[0.1em]">(21) 96591-5765</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <Mail size={20} className="text-orange-500" />
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <p className="text-[9px] font-bold text-gray-400 uppercase truncate">cassioeletroshow@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 4: Pagamento */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase text-orange-500 tracking-[0.3em] border-l-4 border-orange-500 pl-4">Pagamento</h4>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Facilitamos sua compra:</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors" title="Visa">
                <span className="text-[8px] font-black italic">VISA</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors" title="Mastercard">
                <span className="text-[8px] font-black italic">MASTER</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors" title="Elo">
                <span className="text-[8px] font-black italic">ELO</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors" title="Hipercard">
                <span className="text-[8px] font-black italic">HIPER</span>
              </div>
              <div className="bg-white/5 border border-orange-500/30 p-3 rounded-xl flex items-center justify-center col-span-2 hover:bg-orange-500/10 transition-colors group" title="Pix">
                <span className="text-[9px] font-black text-orange-500 group-hover:animate-pulse">PIX</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product; onAdd: (p: Product) => void }> = ({ product, onAdd }) => (
  <div className="group bg-white rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 overflow-hidden flex flex-col h-full border border-gray-100 animate-fade-in-up">
    <div className="relative aspect-square overflow-hidden bg-gray-50">
      <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
      
      {/* Selos Flutuantes */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {product.isLightningDeal && (
          <div className="bg-orange-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase shadow-xl animate-pulse flex items-center gap-1">
            <Zap size={10} className="fill-white" /> Oferta Relâmpago
          </div>
        )}
      </div>

      {product.oldPrice && (
        <div className="absolute top-4 right-4 bg-[#001f3f] text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg z-20">
          -{Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
        </div>
      )}
      
      {/* Overlay do Parceiro */}
      {product.partner && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-gray-100 shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-20">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
              <Store size={14} />
            </div>
            <span className="text-[8px] font-black text-[#001f3f] uppercase truncate tracking-widest">{product.partner}</span>
          </div>
          {product.partnerLink && (
            <a href={product.partnerLink} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#001f3f] text-white rounded-xl text-[7px] font-black uppercase hover:bg-orange-500 transition-all whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
              Visitar Loja
            </a>
          )}
        </div>
      )}
      
      {/* Gradiente de fundo suave para as imagens */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
    
    <div className="p-5 sm:p-6 flex flex-col flex-grow text-center">
      <h3 className="text-[11px] sm:text-[12px] font-black text-[#001f3f] uppercase mb-3 h-10 overflow-hidden line-clamp-2 tracking-tight leading-tight transition-colors group-hover:text-orange-500">
        {product.name}
      </h3>
      
      <div className="mt-auto space-y-4">
        <div className="flex flex-col items-center">
          {product.oldPrice && (
            <span className="text-[9px] text-gray-300 line-through font-bold uppercase mb-1">
              De R$ {product.oldPrice.toFixed(2)}
            </span>
          )}
          <div className="flex items-center justify-center gap-1">
            <span className="text-10px font-black text-orange-500 self-start mt-1">R$</span>
            <span className="text-2xl sm:text-3xl font-black text-[#001f3f] tracking-tighter leading-none">
              {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">À Vista ou Pix</span>
        </div>
        
        <button 
          onClick={() => onAdd(product)} 
          className="w-full bg-[#001f3f] hover:bg-orange-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg hover:shadow-orange-200 active:scale-95 flex items-center justify-center gap-2 group/btn"
        >
          <ShoppingBag size={14} className="group-hover/btn:animate-bounce" /> Comprar Agora
        </button>
      </div>
    </div>
  </div>
);

export default App;
