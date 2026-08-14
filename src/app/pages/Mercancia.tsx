import React, { useState, useRef } from 'react';
import { ShoppingBag, Search, ShoppingCart, Tag, X, CreditCard, DollarSign, Send, ArrowLeft } from 'lucide-react';
import { useProductos, Producto, CartItem } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function Mercancia() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const { productos, loading, error, realizarCompra } = useProductos(selectedCategory, searchTerm);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Producto | null>(null);

  const [checkoutData, setCheckoutData] = useState({
    nombre: user?.nombre || '',
    correo: user?.correo || '',
    metodoPago: 'tarjeta',
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const catalogRef = useRef<HTMLDivElement>(null);

  // const scrollToCatalog = () => {
  //   catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  const handleAddToCart = (prod: Producto, count = 1) => {
    if (prod.stock <= 0) {
      toast.error('Producto agotado');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.producto.id_producto === prod.id_producto);
      if (existing) {
        const newQty = Math.min(existing.cantidad + count, prod.stock);
        toast.success(`Cantidad actualizada (${newQty})`);
        return prev.map((item) =>
          item.producto.id_producto === prod.id_producto
            ? { ...item, cantidad: newQty }
            : item
        );
      }
      toast.success(`${prod.nombre} agregado al carrito`);
      return [...prev, { producto: prod, cantidad: count }];
    });
  };

  const handleUpdateCartQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.producto.id_producto === id) {
            const newQty = item.cantidad + delta;
            if (newQty <= 0) return null;
            if (newQty > item.producto.stock) {
              toast.error('Supera el stock disponible');
              return item;
            }
            return { ...item, cantidad: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalCartAmount = cart.reduce(
    (sum, item) => sum + Number(item.producto.precio) * item.cantidad,
    0
  );

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmittingOrder(true);
    try {
      await realizarCompra({
        cliente_nombre: checkoutData.nombre,
        cliente_correo: checkoutData.correo,
        metodo_pago: checkoutData.metodoPago,
        id_usuario: (user as any)?.id_usuario,
        items: cart.map((item) => ({
          id_producto: item.producto.id_producto,
          cantidad: item.cantidad,
        })),
      });

      toast.success('Compra completada con exito! Revisa tu correo para el recibo.');
      setCart([]);
      setIsCheckoutModalOpen(false);
      setIsCartOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'No pudimos procesar el pago. Intentalo mas tarde.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--foreground)] text-[var(--app-text-primary)]">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[var(--app-header-bg)] border-b border-[var(--app-border)] px-6 py-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/map')}>
            <button className="p-2 hover:bg-[var(--app-hover)] rounded-lg text-[var(--app-text-secondary)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold leading-tight">UTEQ</h1>
              <p className="text-xs text-[var(--app-text-secondary)]">Mercancia Oficial Halcones</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-[var(--app-hover)] border border-[var(--app-border)] hover:bg-[var(--app-border)] rounded-xl transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5 text-[var(--app-blue)]" />
              <span className="hidden sm:inline text-xs font-semibold">Carrito</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--app-blue)] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cart.reduce((a, b) => a + b.cantidad, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Banner Section */}
      {/* <section className="relative overflow-hidden bg-gradient-to-r from-[var(--app-blue)] to-indigo-700 text-white py-16 px-6 shadow-md">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4">
              <Tag className="w-3.5 h-3.5" /> Productos UTEQ 2026
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
              Porta el orgullo <span className="underline decoration-sky-400 decoration-4">Halcones UTEQ</span>
            </h1>
            <p className="text-base text-blue-100 mb-8 max-w-xl">
              Descubre playeras oficiales, termos, llaveros coleccionables y sudaderas hoodie.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={scrollToCatalog}
                className="px-6 py-3.5 bg-white text-[var(--app-blue)] font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Productos</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center relative">
            <div className="w-72 h-72 rounded-full bg-white/10 blur-3xl absolute"></div>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl transform -rotate-3 hover:rotate-0 transition-transform">
                <img
                  src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80"
                  alt="Playera UTEQ"
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <span className="text-xs font-bold block">Playera UTEQ</span>
                <span className="text-xs text-blue-200">$250.00 MXN</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform mt-6">
                <img
                  src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&auto=format&fit=crop&q=80"
                  alt="Termo UTEQ"
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <span className="text-xs font-bold block">Termo 750ml</span>
                <span className="text-xs text-blue-200">$340.00 MXN</span>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Main Catalog Container */}
      <main ref={catalogRef} className="max-w-7xl mx-auto px-6 py-12">
        {/* Category Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[
              { id: 'todos', label: 'Todos los Productos' },
              { id: 'playera', label: 'Playeras' },
              { id: 'termo', label: 'Termos' },
              { id: 'llavero', label: 'Llaveros' },
              { id: 'sudadera', label: 'Sudaderas' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--app-blue)] text-white border-[var(--app-blue)] shadow-sm'
                    : 'bg-[var(--app-card-bg)] text-[var(--app-text-secondary)] border-[var(--app-border)] hover:bg-[var(--app-hover)] hover:text-[var(--app-text-primary)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--app-text-secondary)]" />
            <input
              type="text"
              placeholder="Buscar mercancía..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-xl text-sm text-[var(--app-text-primary)] placeholder-[var(--app-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-2xl p-4 animate-pulse"
              >
                <div className="w-full h-48 bg-[var(--app-hover)] rounded-xl mb-4" />
                <div className="h-4 bg-[var(--app-hover)] rounded w-3/4 mb-2" />
                <div className="h-4 bg-[var(--app-hover)] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 font-semibold bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-2xl">
            {error}
          </div>
        ) : productos.length === 0 ? (
          <div className="p-16 text-center text-[var(--app-text-secondary)] bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-2xl">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-[var(--app-text-secondary)] opacity-50" />
            <p className="text-lg font-medium">No se encontraron productos en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productos.map((prod) => (
              <div
                key={prod.id_producto}
                className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col group"
              >
                {/* Image Container */}
                <div
                  className="relative w-full h-56 bg-[var(--app-hover)] overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProductDetail(prod)}
                >
                  {prod.imagen_url ? (
                    <img
                      src={prod.imagen_url}
                      alt={prod.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--app-text-secondary)]">
                      <Tag className="w-10 h-10 opacity-40" />
                    </div>
                  )}

                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-[var(--app-card-bg)]/90 backdrop-blur-md border border-[var(--app-border)] rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-[var(--app-blue)]">
                    {prod.categoria}
                  </span>

                  {prod.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-3 py-1 bg-red-600 text-white font-bold text-xs uppercase rounded-full tracking-wider">
                        Agotado
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-bold text-[var(--app-text-primary)] text-base mb-1.5 line-clamp-1 hover:text-[var(--app-blue)] cursor-pointer transition-colors"
                      onClick={() => setSelectedProductDetail(prod)}
                    >
                      {prod.nombre}
                    </h3>
                    <p className="text-xs text-[var(--app-text-secondary)] line-clamp-2 mb-4">
                      {prod.descripcion}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3 pt-3 border-t border-[var(--app-border)]">
                      <div>
                        <span className="text-[10px] text-[var(--app-text-secondary)] uppercase block">Precio</span>
                        <span className="text-lg font-black text-[var(--app-text-primary)]">
                          ${Number(prod.precio).toFixed(2)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[var(--app-text-secondary)] uppercase block">Stock</span>
                        <span className={`text-xs font-bold ${prod.stock > 10 ? 'text-[var(--app-green)]' : prod.stock > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                          {prod.stock > 0 ? `${prod.stock} disponibles` : 'Sin stock'}
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={prod.stock <= 0}
                      onClick={() => handleAddToCart(prod)}
                      className="w-full py-2.5 bg-[var(--app-blue)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Agregar al Carrito</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-[var(--app-card-bg)] border-l border-[var(--app-border)] h-full flex flex-col shadow-2xl">
            <div className="p-4 border-b border-[var(--app-border)] flex items-center justify-between bg-[var(--app-header-bg)]">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[var(--app-blue)]" />
                <h2 className="font-bold text-base text-[var(--app-text-primary)]">Tu Carrito</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--app-hover)] text-[var(--app-text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[var(--app-text-secondary)]">
                  <ShoppingCart className="w-12 h-12 mb-2 opacity-30" />
                  <p className="font-medium text-sm">Tu carrito está vacío</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-4 py-2 bg-[var(--app-hover)] rounded-xl text-xs font-bold text-[var(--app-text-primary)]"
                  >
                    Ver catálogo
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.producto.id_producto}
                    className="flex items-center gap-3 p-3 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-xl"
                  >
                    {item.producto.imagen_url && (
                      <img
                        src={item.producto.imagen_url}
                        alt={item.producto.nombre}
                        className="w-14 h-14 object-cover rounded-lg border border-[var(--app-border)]"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-[var(--app-text-primary)] truncate">
                        {item.producto.nombre}
                      </h4>
                      <p className="text-xs text-[var(--app-text-secondary)]">
                        ${Number(item.producto.precio).toFixed(2)} c/u
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleUpdateCartQty(item.producto.id_producto, -1)}
                          className="w-6 h-6 bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold">{item.cantidad}</span>
                        <button
                          onClick={() => handleUpdateCartQty(item.producto.id_producto, 1)}
                          className="w-6 h-6 bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-[var(--app-text-primary)] block">
                        ${(Number(item.producto.precio) * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-[var(--app-border)] bg-[var(--app-header-bg)]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-[var(--app-text-secondary)]">Total a pagar:</span>
                  <span className="text-xl font-black text-[var(--app-text-primary)]">
                    ${totalCartAmount.toFixed(2)} MXN
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutModalOpen(true);
                  }}
                  className="w-full py-3 bg-[var(--app-blue)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity"
                >
                  Proceder al Pago
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] p-1 rounded-lg hover:bg-[var(--app-hover)]"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[var(--app-text-primary)] mb-1">Finalizar Orden de Compra</h2>
            <p className="text-xs text-[var(--app-text-secondary)] mb-6">
              Ingresa tus datos para registrar la venta y recibir tu comprobante
            </p>

            <form onSubmit={handleConfirmPurchase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--app-text-secondary)] uppercase mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={checkoutData.nombre}
                  onChange={(e) => setCheckoutData({ ...checkoutData, nombre: e.target.value })}
                  placeholder="ej. Juan Pérez"
                  className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-xl text-sm text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--app-text-secondary)] uppercase mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={checkoutData.correo}
                  onChange={(e) => setCheckoutData({ ...checkoutData, correo: e.target.value })}
                  placeholder="ej. usuario@uteq.edu.mx"
                  className="w-full px-3 py-2 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-xl text-sm text-[var(--app-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--app-text-secondary)] uppercase mb-2">
                  Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                    { id: 'efectivo', label: 'Caja UTEQ', icon: DollarSign },
                    { id: 'transferencia', label: 'Transfer.', icon: Send },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setCheckoutData({ ...checkoutData, metodoPago: m.id })}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        checkoutData.metodoPago === m.id
                          ? 'border-[var(--app-blue)] bg-[var(--app-blue-light)] text-[var(--app-blue)] font-bold'
                          : 'border-[var(--app-border)] bg-[var(--app-hover)] text-[var(--app-text-secondary)]'
                      }`}
                    >
                      <m.icon className="w-5 h-5" />
                      <span className="text-xs">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-[var(--app-hover)] border border-[var(--app-border)] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-[var(--app-text-secondary)]">
                  <span>Items:</span>
                  <span>{cart.reduce((a, b) => a + b.cantidad, 0)} productos</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[var(--app-text-primary)] pt-2 border-t border-[var(--app-border)]">
                  <span>Total a pagar:</span>
                  <span>${totalCartAmount.toFixed(2)} MXN</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="w-full py-3 bg-[var(--app-blue)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmittingOrder ? 'Procesando Pago...' : 'Confirmar y Pagar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-2xl w-full max-w-lg shadow-2xl p-6 relative overflow-hidden">
            <button
              onClick={() => setSelectedProductDetail(null)}
              className="absolute right-4 top-4 text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] p-1 rounded-lg hover:bg-[var(--app-hover)]"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedProductDetail.imagen_url && (
              <img
                src={selectedProductDetail.imagen_url}
                alt={selectedProductDetail.nombre}
                className="w-full h-64 object-cover rounded-xl mb-4 border border-[var(--app-border)]"
              />
            )}

            <span className="px-2.5 py-1 bg-[var(--app-blue-light)] text-[var(--app-blue)] text-[10px] font-extrabold uppercase rounded-lg">
              {selectedProductDetail.categoria}
            </span>

            <h2 className="text-xl font-bold text-[var(--app-text-primary)] mt-2 mb-2">
              {selectedProductDetail.nombre}
            </h2>

            <p className="text-xs text-[var(--app-text-secondary)] mb-4 leading-relaxed">
              {selectedProductDetail.descripcion}
            </p>

            <div className="flex items-center justify-between mb-6 p-3 bg-[var(--app-hover)] rounded-xl border border-[var(--app-border)]">
              <div>
                <span className="text-[10px] uppercase text-[var(--app-text-secondary)] block">Precio</span>
                <span className="text-xl font-black text-[var(--app-text-primary)]">
                  ${Number(selectedProductDetail.precio).toFixed(2)} MXN
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[var(--app-text-secondary)] block">Disponibilidad</span>
                <span className="text-xs font-bold text-[var(--app-green)]">
                  {selectedProductDetail.stock} unidades
                </span>
              </div>
            </div>

            <button
              disabled={selectedProductDetail.stock <= 0}
              onClick={() => {
                handleAddToCart(selectedProductDetail);
                setSelectedProductDetail(null);
              }}
              className="w-full py-3 bg-[var(--app-blue)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Agregar al Carrito</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
