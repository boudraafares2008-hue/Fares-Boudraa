import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import heic2any from 'heic2any';
import { 
  Home, 
  ShoppingBag, 
  Info, 
  Mail, 
  Heart, 
  ShoppingCart, 
  Menu, 
  X, 
  ChevronRight, 
  Star, 
  Clock, 
  Gem, 
  MapPin, 
  Phone, 
  Instagram, 
  Facebook,
  Search,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  BarChart3,
  Lock,
  LogOut,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { cn, api, type Product, type Message } from './types';

// --- Components ---

const FileUploader = ({ images, setImages }: { images: string[], setImages: (imgs: string[]) => void }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    const newImages: string[] = [...images];

    for (const file of acceptedFiles) {
      try {
        let fileToProcess = file;

        // Handle HEIC/HEIF
        if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
          const blob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          });
          fileToProcess = new File([Array.isArray(blob) ? blob[0] : blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: 'image/jpeg' });
        }

        // Optimize: Check size (limit to 5MB for base64 storage)
        if (fileToProcess.size > 5 * 1024 * 1024) {
          alert(`El archivo ${file.name} es demasiado grande (máx 5MB)`);
          continue;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages([...newImages, e.target.result as string]);
          }
        };
        reader.readAsDataURL(fileToProcess);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }
    setIsProcessing(false);
  }, [images, setImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.svg', '.heic', '.heif']
    },
    multiple: true
  } as any);

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
          isDragActive ? "border-gold bg-gold/5" : "border-white/10 hover:border-gold/50",
          isProcessing && "opacity-50 cursor-wait"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-4 text-gold" size={32} />
        <p className="text-sm text-cream/70">
          {isDragActive ? "Suelta las imágenes aquí..." : "Arrastra imágenes o haz clic para subir"}
        </p>
        <p className="text-[10px] text-cream/30 mt-2 uppercase tracking-widest">
          JPG, PNG, WEBP, SVG, HEIC (Máx 5MB)
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
              <img src={img} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              {idx === 0 && (
                <div className="absolute bottom-0 left-0 w-full bg-gold text-deep-black text-[8px] font-bold py-0.5 text-center uppercase">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = ({ activeSection, setActiveSection, cartCount, isAdminLoggedIn, onLogout }: { 
  activeSection: string, 
  setActiveSection: (s: string) => void,
  cartCount: number,
  isAdminLoggedIn: boolean,
  onLogout: () => void
}) => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-morphism px-6 py-4 hidden md:flex justify-between items-center">
      <div 
        className="text-2xl font-serif font-bold tracking-widest cursor-pointer"
        onClick={() => setActiveSection('home')}
      >
        MARÍA <span className="text-gold">EUGENIA</span>
      </div>
      
      <div className="flex gap-8 items-center">
        {['home', 'catalog', 'about', 'contact'].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={cn(
              "uppercase text-xs tracking-[0.2em] transition-colors hover:text-gold",
              activeSection === section ? "text-gold" : "text-cream/70"
            )}
          >
            {section === 'home' ? 'Inicio' : 
             section === 'catalog' ? 'Catálogo' : 
             section === 'about' ? 'Nosotros' : 'Contacto'}
          </button>
        ))}
        {isAdminLoggedIn && (
          <button
            onClick={() => setActiveSection('admin')}
            className={cn(
              "uppercase text-xs tracking-[0.2em] transition-colors hover:text-gold flex items-center gap-2",
              activeSection === 'admin' ? "text-gold" : "text-cream/70"
            )}
          >
            <Lock size={14} /> Panel Admin
          </button>
        )}
      </div>

      <div className="flex gap-6 items-center">
        <button className="relative hover:text-gold transition-colors">
          <Heart size={20} />
        </button>
        <button className="relative hover:text-gold transition-colors">
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-gold text-deep-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
        {isAdminLoggedIn && (
          <button onClick={onLogout} className="text-cream/50 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        )}
      </div>
    </nav>
  );
};

const BottomNav = ({ activeSection, setActiveSection, isAdminLoggedIn }: { 
  activeSection: string, 
  setActiveSection: (s: string) => void,
  isAdminLoggedIn: boolean
}) => {
  const items = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'catalog', icon: ShoppingBag, label: 'Tienda' },
    { id: 'about', icon: Info, label: 'Nosotros' },
    { id: 'contact', icon: Mail, label: 'Contacto' },
  ];

  if (isAdminLoggedIn) {
    items.push({ id: 'admin', icon: Lock, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden glass-morphism px-4 py-3 flex justify-around items-center border-t border-white/10">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveSection(item.id)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeSection === item.id ? "text-gold scale-110" : "text-cream/50"
          )}
        >
          <item.icon size={20} />
          <span className="text-[10px] uppercase tracking-tighter">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

const Hero = ({ onExplore }: { onExplore: () => void }) => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1920" 
          alt="Luxury Jewelry" 
          className="w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-black/20 via-deep-black/60 to-deep-black" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-gold uppercase tracking-[0.5em] text-sm mb-4 block">Melilla • Desde 1985</span>
          <h1 className="text-5xl md:text-8xl font-serif mb-8 leading-tight">
            Elegancia que <br /> <span className="italic">perdura</span>
          </h1>
          <p className="text-cream/70 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Descubre piezas exclusivas diseñadas para capturar los momentos más especiales de tu vida.
          </p>
          <button 
            onClick={onExplore}
            className="group relative px-10 py-4 bg-transparent border border-gold text-gold hover:text-deep-black transition-all duration-500 overflow-hidden"
          >
            <span className="relative z-10 uppercase tracking-widest text-sm font-medium">Descubre nuestra colección</span>
            <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-gold to-transparent" />
      </motion.div>
    </section>
  );
};

const Specialties = () => {
  const items = [
    { title: 'Relojería', icon: Clock, img: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800' },
    { title: 'Sortijas', icon: Gem, img: 'https://images.unsplash.com/photo-1603912627214-94a159934919?auto=format&fit=crop&q=80&w=800' },
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl mb-4">Nuestras Especialidades</h2>
        <div className="w-24 h-[1px] bg-gold mx-auto" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {items.map((item, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ scale: 1.02 }}
            className="relative h-[400px] group overflow-hidden rounded-2xl cursor-pointer"
          >
            <img 
              src={item.img} 
              alt={item.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-8 left-8">
              <div className="flex items-center gap-3 mb-2">
                <item.icon className="text-gold" size={24} />
                <h3 className="text-3xl font-serif">{item.title}</h3>
              </div>
              <p className="text-cream/60 flex items-center gap-2 group-hover:text-gold transition-colors">
                Ver colección <ChevronRight size={16} />
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Catalog = ({ onAddToCart }: { onAddToCart: (p: Product) => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'oro' | 'diamantes' | 'relojes'>('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    api.products.getAll().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    if (filter === 'all') return products;
    return products.filter(p => p.category === filter);
  }, [filter, products]);

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h2 className="text-4xl md:text-6xl mb-4">Colección Exclusiva</h2>
          <p className="text-cream/60 max-w-md">Piezas seleccionadas a mano por nuestros maestros joyeros.</p>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 w-full md:w-auto">
          {['all', 'oro', 'diamantes', 'relojes'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={cn(
                "px-6 py-2 rounded-full border text-xs uppercase tracking-widest transition-all whitespace-nowrap",
                filter === cat 
                  ? "bg-gold border-gold text-deep-black" 
                  : "border-white/10 text-cream/60 hover:border-gold/50"
              )}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          <AnimatePresence mode='popLayout'>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-6 bg-white/5">
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-deep-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={() => onAddToCart(product)}
                      className="p-4 bg-cream text-deep-black rounded-full hover:bg-gold transition-colors"
                    >
                      <ShoppingCart size={20} />
                    </button>
                    <button className="p-4 bg-cream text-deep-black rounded-full hover:bg-gold transition-colors">
                      <Heart size={20} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-serif mb-1 group-hover:text-gold transition-colors">{product.name}</h3>
                    <p className="text-cream/50 text-sm uppercase tracking-widest">{product.category}</p>
                  </div>
                  <p className="text-gold font-medium">{product.price}€</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
};

const About = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800" 
              alt="Workshop" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-gold/10 rounded-2xl -z-10" />
        </div>
        
        <div>
          <span className="text-gold uppercase tracking-[0.3em] text-sm mb-4 block">Nuestra Historia</span>
          <h2 className="text-4xl md:text-5xl mb-8 leading-tight">Tradición y maestría en cada detalle</h2>
          <div className="space-y-6 text-cream/70 font-light leading-relaxed">
            <p>
              Fundada en el corazón de Melilla en 1985, Joyería María Eugenia ha sido testigo de innumerables historias de amor y celebración. Nuestra pasión por la excelencia nos ha llevado a buscar las gemas más raras y los metales más puros.
            </p>
            <p>
              Cada pieza que sale de nuestro taller es el resultado de horas de trabajo artesanal, combinando técnicas tradicionales con el diseño más vanguardista.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="flex flex-col gap-3">
              <Star className="text-gold" size={32} />
              <h4 className="text-xl font-serif">Experiencia</h4>
              <p className="text-sm text-cream/50">Más de 35 años asesorando a nuestros clientes con honestidad.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Gem className="text-gold" size={32} />
              <h4 className="text-xl font-serif">Elegancia</h4>
              <p className="text-sm text-cream/50">Diseños que trascienden las modas y se convierten en herencia.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      type: formData.get('type') as string,
      message: formData.get('message') as string,
    };

    await api.messages.create(data);
    setLoading(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl mb-4">Contacto</h2>
        <p className="text-cream/60">Visítanos en nuestra boutique o escríbenos.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        <div className="glass-morphism p-8 rounded-3xl">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center py-12"
            >
              <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mb-6">
                <Mail className="text-gold" size={40} />
              </div>
              <h3 className="text-2xl font-serif mb-2">¡Mensaje Enviado!</h3>
              <p className="text-cream/60">Nos pondremos en contacto contigo a la mayor brevedad posible.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cream/50">Nombre</label>
                  <input 
                    name="name"
                    required
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-cream/50">Teléfono</label>
                  <input 
                    name="phone"
                    required
                    type="tel" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                    placeholder="+34 000 000 000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-cream/50">Tipo de Joya</label>
                <select name="type" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors appearance-none">
                  <option className="bg-deep-black">Anillo de Compromiso</option>
                  <option className="bg-deep-black">Relojería de Lujo</option>
                  <option className="bg-deep-black">Alta Joyería</option>
                  <option className="bg-deep-black">Otros</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-cream/50">Mensaje</label>
                <textarea 
                  name="message"
                  required
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors resize-none"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>
              <button 
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-gold text-deep-black font-bold uppercase tracking-widest rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </form>
          )}
        </div>

        <div className="space-y-8">
          <div className="h-[300px] rounded-3xl overflow-hidden relative border border-white/10">
            <img 
              src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=800" 
              alt="Map Placeholder" 
              className="w-full h-full object-cover grayscale opacity-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-deep-black/80 backdrop-blur-sm p-6 rounded-2xl border border-gold/30 text-center">
                <MapPin className="text-gold mx-auto mb-2" size={32} />
                <p className="font-serif">Calle Avenida, Melilla, España</p>
                <p className="text-xs text-cream/50 uppercase tracking-widest">Melilla, España</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="glass-morphism p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                <Phone className="text-gold" size={20} />
              </div>
              <div>
                <p className="text-xs text-cream/50 uppercase tracking-widest">Llámanos</p>
                <p className="font-medium">+34 956 00 00 00</p>
              </div>
            </div>
            <div className="glass-morphism p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                <Instagram className="text-gold" size={20} />
              </div>
              <div>
                <p className="text-xs text-cream/50 uppercase tracking-widest">Síguenos</p>
                <p className="font-medium">@joyeria_meugenia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      onLogin();
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-morphism p-10 rounded-3xl w-full max-w-md text-center"
      >
        <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="text-gold" size={32} />
        </div>
        <h2 className="text-3xl font-serif mb-2">Acceso Admin</h2>
        <p className="text-cream/50 mb-8">Introduce la contraseña para gestionar la joyería.</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-center"
            placeholder="Contraseña"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button 
            type="submit"
            className="w-full py-4 bg-gold text-deep-black font-bold uppercase tracking-widest rounded-xl hover:bg-gold-light transition-colors"
          >
            Entrar
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'messages' | 'metrics'>('inventory');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setUploadedImages(editingProduct.images);
    } else {
      setUploadedImages([]);
    }
  }, [editingProduct, isAdding]);

  const refreshData = async () => {
    const [p, m] = await Promise.all([api.products.getAll(), api.messages.getAll()]);
    setProducts(p);
    setMessages(m);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await api.products.delete(id);
      refreshData();
    }
  };

  const handleToggleMessageStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pendiente' ? 'leído' : 'pendiente';
    await api.messages.updateStatus(id, newStatus as any);
    refreshData();
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      id: editingProduct?.id || crypto.randomUUID(),
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as any,
      images: uploadedImages,
      description: formData.get('description') as string,
    };

    if (editingProduct) {
      await api.products.update(editingProduct.id, productData);
    } else {
      await api.products.create(productData);
    }

    setIsAdding(false);
    setEditingProduct(null);
    refreshData();
  };

  const metrics = useMemo(() => {
    const counts = { oro: 0, diamantes: 0, relojes: 0 };
    products.forEach(p => {
      if (p.category in counts) counts[p.category as keyof typeof counts]++;
    });
    return counts;
  }, [products]);

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-serif">Panel de Control</h2>
          <p className="text-cream/50">Gestiona el inventario y las consultas de clientes.</p>
        </div>
        
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
          {[
            { id: 'inventory', icon: ShoppingBag, label: 'Inventario' },
            { id: 'messages', icon: Mail, label: 'Mensajes' },
            { id: 'metrics', icon: BarChart3, label: 'Métricas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all",
                activeTab === tab.id ? "bg-gold text-deep-black" : "text-cream/50 hover:text-cream"
              )}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'inventory' && (
          <motion.div 
            key="inventory"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif">Productos ({products.length})</h3>
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-6 py-2 bg-gold text-deep-black rounded-xl font-bold text-sm"
              >
                <Plus size={18} /> Añadir Producto
              </button>
            </div>

            <div className="grid gap-4">
              {products.map((product) => (
                <div key={product.id} className="glass-morphism p-4 rounded-2xl flex items-center gap-6">
                  <img src={product.images[0]} className="w-16 h-16 rounded-lg object-cover" alt={product.name} />
                  <div className="flex-1">
                    <h4 className="font-serif text-lg">{product.name}</h4>
                    <p className="text-xs text-cream/50 uppercase tracking-widest">{product.category} • {product.price}€</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingProduct(product)}
                      className="p-2 text-cream/50 hover:text-gold transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-cream/50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'messages' && (
          <motion.div 
            key="messages"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="text-2xl font-serif mb-8">Buzón de Consultas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-cream/50">
                    <th className="py-4 px-4">Cliente</th>
                    <th className="py-4 px-4">Tipo</th>
                    <th className="py-4 px-4">Mensaje</th>
                    <th className="py-4 px-4">Estado</th>
                    <th className="py-4 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-medium">{msg.name}</p>
                        <p className="text-xs text-cream/50">{msg.phone}</p>
                      </td>
                      <td className="py-4 px-4 text-sm">{msg.type}</td>
                      <td className="py-4 px-4 text-sm max-w-xs truncate">{msg.message}</td>
                      <td className="py-4 px-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] uppercase font-bold",
                          msg.status === 'pendiente' ? "bg-yellow-500/20 text-yellow-500" : "bg-green-500/20 text-green-500"
                        )}>
                          {msg.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          onClick={() => handleToggleMessageStatus(msg.id, msg.status)}
                          className="text-cream/50 hover:text-gold transition-colors"
                        >
                          <CheckCircle size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'metrics' && (
          <motion.div 
            key="metrics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="text-2xl font-serif mb-8">Resumen de Inventario</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              {Object.entries(metrics).map(([cat, count]) => (
                <div key={cat} className="glass-morphism p-8 rounded-3xl text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-cream/50 mb-2">{cat}</p>
                  <p className="text-5xl font-serif text-gold">{count}</p>
                  <p className="text-sm text-cream/30 mt-2">Productos</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {(isAdding || editingProduct) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAdding(false); setEditingProduct(null); }}
              className="absolute inset-0 bg-deep-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-morphism p-8 rounded-3xl w-full max-w-lg"
            >
              <h3 className="text-2xl font-serif mb-6">{editingProduct ? 'Editar' : 'Añadir'} Producto</h3>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-cream/50">Nombre</label>
                    <input name="name" defaultValue={editingProduct?.name} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-gold outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-cream/50">Precio (€)</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-gold outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-cream/50">Imágenes del Producto</label>
                  <FileUploader images={uploadedImages} setImages={setUploadedImages} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-cream/50">Categoría</label>
                  <select name="category" defaultValue={editingProduct?.category} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-gold outline-none appearance-none">
                    <option value="oro" className="bg-deep-black">Oro</option>
                    <option value="diamantes" className="bg-deep-black">Diamantes</option>
                    <option value="relojes" className="bg-deep-black">Relojes</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-cream/50">Descripción</label>
                  <textarea name="description" rows={3} defaultValue={editingProduct?.description} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-gold outline-none resize-none" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => { setIsAdding(false); setEditingProduct(null); }} className="flex-1 py-3 border border-white/10 rounded-xl text-sm uppercase tracking-widest hover:bg-white/5 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-gold text-deep-black font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-gold-light transition-colors">Guardar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const Footer = ({ onAdminClick }: { onAdminClick: () => void }) => {
  return (
    <footer className="bg-deep-black border-t border-white/5 py-16 px-6 pb-32 md:pb-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-3xl font-serif mb-6 tracking-widest">MARÍA <span className="text-gold">EUGENIA</span></h2>
          <p className="text-cream/40 max-w-sm mb-8 leading-relaxed">
            Desde 1985, ofreciendo la mejor selección de joyería y relojería de lujo en la ciudad de Melilla.
          </p>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
              <Instagram size={18} />
            </button>
            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
              <Facebook size={18} />
            </button>
          </div>
        </div>
        
        <div>
          <h4 className="text-gold uppercase tracking-widest text-sm mb-6">Enlaces</h4>
          <ul className="space-y-4 text-cream/50 text-sm">
            <li className="hover:text-gold cursor-pointer transition-colors">Inicio</li>
            <li className="hover:text-gold cursor-pointer transition-colors">Catálogo</li>
            <li className="hover:text-gold cursor-pointer transition-colors">Sobre Nosotros</li>
            <li className="hover:text-gold cursor-pointer transition-colors">Contacto</li>
            <li onClick={onAdminClick} className="hover:text-gold cursor-pointer transition-colors flex items-center gap-2">
              <Lock size={12} /> Administración
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-gold uppercase tracking-widest text-sm mb-6">Ubicación</h4>
          <p className="text-cream/50 text-sm leading-relaxed mb-4">
            Calle Avenida, Melilla, España
          </p>
          <h4 className="text-gold uppercase tracking-widest text-sm mb-6">Horario</h4>
          <ul className="space-y-4 text-cream/50 text-sm">
            <li>Lunes - Viernes: 10:00 - 14:00 | 17:00 - 20:30</li>
            <li>Sábado: 10:30 - 14:00</li>
            <li>Domingo: Cerrado</li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-cream/30 uppercase tracking-widest">
        <p>© 2024 Joyería María Eugenia. Todos los derechos reservados.</p>
        <div className="flex gap-8">
          <span className="hover:text-cream cursor-pointer">Privacidad</span>
          <span className="hover:text-cream cursor-pointer">Términos</span>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [cart, setCart] = useState<Product[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="min-h-screen bg-deep-black selection:bg-gold selection:text-deep-black">
      <Navbar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        cartCount={cart.length} 
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={() => { setIsAdminLoggedIn(false); setActiveSection('home'); }}
      />
      
      <AnimatePresence mode="wait">
        <motion.main
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="pt-0 md:pt-20"
        >
          {activeSection === 'home' && (
            <>
              <Hero onExplore={() => setActiveSection('catalog')} />
              <Specialties />
              <div className="bg-cream text-deep-black py-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                  <div className="flex-1">
                    <h2 className="text-4xl md:text-6xl mb-8 font-serif italic">"La belleza es el resplandor de la verdad."</h2>
                    <p className="text-deep-black/60 text-lg font-light leading-relaxed">
                      En Joyería María Eugenia, creemos que cada joya cuenta una historia única. Nuestra misión es ayudarte a encontrar la pieza perfecta que refleje tu esencia.
                    </p>
                  </div>
                  <div className="flex-1 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&q=80&w=800" 
                      alt="Luxury Detail" 
                      className="rounded-2xl shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-gold" />
                  </div>
                </div>
              </div>
            </>
          )}
          
          {activeSection === 'catalog' && (
            <Catalog onAddToCart={addToCart} />
          )}
          
          {activeSection === 'about' && (
            <About />
          )}
          
          {activeSection === 'contact' && (
            <Contact />
          )}

          {activeSection === 'admin' && (
            isAdminLoggedIn ? <AdminDashboard /> : <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />
          )}
        </motion.main>
      </AnimatePresence>

      <Footer onAdminClick={() => setActiveSection('admin')} />
      <BottomNav activeSection={activeSection} setActiveSection={setActiveSection} isAdminLoggedIn={isAdminLoggedIn} />
    </div>
  );
}
