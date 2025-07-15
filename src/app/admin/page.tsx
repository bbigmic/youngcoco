"use client";
import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "youngcoco2024";

type Order = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  zipCode: string;
  companyName?: string;
  nip?: string;
  invoiceAddress?: string;
  variant: number;
  quantity: number;
  price: number;
  total: number;
  delivery: string;
  payment: string;
  status: string;
  consent1: boolean;
  consent2: boolean;
  createdAt: string;
  sessionId?: string;
};

type Pagination = {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};

type Stats = {
  totalOrders: number;
  newOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  todayOrders: number;
  todayRevenue: number;
  thisMonthOrders: number;
  thisMonthRevenue: number;
  topCities: Array<{
    city: string;
    _count: { city: number };
    _sum: { total: number | null };
  }>;
  variantStats: Array<{
    variant: number;
    _count: { variant: number };
    _sum: { quantity: number | null; total: number | null };
  }>;
};

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]); // Wszystkie zamówienia do wyszukiwania
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [currentStatus, setCurrentStatus] = useState<string>("nowe");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);
  const [showAllStats, setShowAllStats] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("admin") === "1") {
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      loadOrders();
      loadStats();
    }
  }, [loggedIn, currentPage, currentStatus]);

  // Resetuj stronę gdy zmieniasz status
  useEffect(() => {
    setCurrentPage(1);
  }, [currentStatus]);

  // Filtruj zamówienia gdy zmienia się searchTerm
  useEffect(() => {
    if (currentStatus === "zrealizowane" && searchTerm.trim()) {
      const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
      
      const filtered = allOrders.filter(order => {
        // Przygotuj wszystkie pola do wyszukiwania jako jeden tekst
        const searchableText = [
          order.firstName,
          order.lastName,
          order.email,
          order.phone,
          order.address,
          order.city,
          order.zipCode,
          order.companyName,
          order.nip,
          order.sessionId,
          order.id?.toString(),
          order.total?.toString(),
          order.variant?.toString(),
          order.quantity?.toString()
        ].filter(Boolean).join(' ').toLowerCase();
        
        // Sprawdź czy wszystkie słowa z wyszukiwania występują w tekście
        return searchWords.every(word => searchableText.includes(word));
      });
      
      setFilteredOrders(filtered);
    } else if (currentStatus === "zrealizowane") {
      setFilteredOrders(allOrders);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, allOrders, orders, currentStatus]);

  async function loadStats() {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch {
      console.error("Błąd pobierania statystyk");
    } finally {
      setStatsLoading(false);
    }
  }

  async function loadOrders() {
    setLoading(true);
    try {
      const limit = 10; // Limit 10 zamówień na stronę
      const res = await fetch(`/api/orders?page=${currentPage}&limit=${limit}&status=${currentStatus}`);
      const data = await res.json();
      setOrders(data.orders);
      setPagination(data.pagination);
      
      // Dla historii pobierz wszystkie zamówienia do wyszukiwania
      if (currentStatus === "zrealizowane") {
        const allRes = await fetch(`/api/orders?status=zrealizowane&limit=1000`);
        const allData = await allRes.json();
        setAllOrders(allData.orders);
        setFilteredOrders(allData.orders);
      } else {
        setAllOrders([]);
        setFilteredOrders(data.orders);
      }
    } catch {
      setError("Błąd pobierania zamówień");
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: number, status: string) {
    setUpdatingOrder(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (res.ok) {
        // Odśwież listę zamówień i statystyki
        loadOrders();
        loadStats();
      } else {
        setError("Błąd aktualizacji zamówienia");
      }
    } catch {
      setError("Błąd aktualizacji zamówienia");
    } finally {
      setUpdatingOrder(null);
    }
  }

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      if (typeof window !== "undefined") sessionStorage.setItem("admin", "1");
    } else {
      setError("Nieprawidłowe hasło");
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  }

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto pt-40 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Panel administracyjny</h1>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <input type="password" placeholder="Hasło" value={password} onChange={e => setPassword(e.target.value)} className="border rounded-lg px-4 py-3 w-full" />
          <button type="submit" className="bg-[#23611C] text-white rounded py-3 font-semibold text-base">Zaloguj</button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full pt-32 py-16 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Panel Administracyjny</h1>
      </div>

      {/* Kafelki ze statystykami */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : stats && (
        <>
          {/* 4 główne kafelki - zawsze widoczne */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Całkowita liczba zamówień */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Wszystkie zamówienia</p>
                  <p className="text-2xl font-bold text-[#23611C]">{stats.totalOrders}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Nowe zamówienia */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nowe zamówienia</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.newOrders}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Zrealizowane zamówienia */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Zrealizowane</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Całkowity przychód */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Całkowity przychód</p>
                  <p className="text-2xl font-bold text-[#23611C]">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Przycisk rozwijania dodatkowych statystyk */}
          <div className="flex justify-center mb-12">
            <button
              onClick={() => setShowAllStats(!showAllStats)}
              className="text-[#23611C] hover:text-[#115E2B] bg-transparent border border-[#23611C] hover:border-[#115E2B] px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 hover:bg-[#F8FFF2]"
            >
              {showAllStats ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Ukryj dodatkowe statystyki
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Pokaż dodatkowe statystyki
                </>
              )}
            </button>
          </div>

          {/* Dodatkowe kafelki - rozwijane */}
          {showAllStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* Średnia wartość zamówienia */}
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Średnia wartość</p>
                    <p className="text-2xl font-bold text-[#23611C]">{formatCurrency(stats.averageOrderValue)}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Zamówienia z dzisiaj */}
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dzisiaj</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.todayOrders}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(stats.todayRevenue)}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Zamówienia z tego miesiąca */}
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ten miesiąc</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.thisMonthOrders}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(stats.thisMonthRevenue)}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Top miasta */}
              <div className="bg-white border rounded-xl p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Top miasta</p>
                    <p className="text-lg font-bold text-[#23611C]">Najwięcej zamówień</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  {stats.topCities.map((city, index) => (
                    <div key={city.city} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm font-medium">{city.city}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{city._count.city} zamówień</span>
                        <span className="text-sm font-semibold text-[#23611C]">
                          {formatCurrency(city._sum.total || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Statystyki wariantów - rozwijane */}
          {showAllStats && (
            <div className="bg-white border rounded-xl p-6 shadow-sm mb-12">
              <h3 className="text-lg font-bold text-[#23611C] mb-4">Statystyki wariantów</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.variantStats.map((variant) => (
                  <div key={variant.variant} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-[#23611C]">
                        Wariant {variant.variant} sztuk
                      </h4>
                      <span className="text-sm text-gray-500">
                        {variant._count.variant} zamówień
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Łączna ilość:</span>
                        <span className="text-sm font-semibold">{variant._sum.quantity || 0} szt.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Przychód:</span>
                        <span className="text-sm font-semibold text-[#23611C]">
                          {formatCurrency(variant._sum.total || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Sekcja zamówień */}
      <div className="border-t pt-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#23611C]">Zamówienia</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentStatus("nowe")} 
              className={`px-4 py-2 rounded-lg font-semibold ${currentStatus === "nowe" ? 'bg-[#23611C] text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Nowe Zamówienia ({stats?.newOrders || 0})
            </button>
            <button 
              onClick={() => setCurrentStatus("zrealizowane")} 
              className={`px-4 py-2 rounded-lg font-semibold ${currentStatus === "zrealizowane" ? 'bg-[#23611C] text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Historia Zamówień
            </button>
          </div>
        </div>

        {/* Wyszukiwarka - tylko dla historii */}
        {currentStatus === "zrealizowane" && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Szukaj w historii zamówień..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23611C] focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="mt-2 text-sm text-gray-600">
                Znaleziono {filteredOrders.length} wyników dla &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Ładowanie...</div>
        ) : (
          <>
            <div className="grid gap-6">
              {(currentStatus === "zrealizowane" ? filteredOrders : orders).map((order: Order) => (
                <div key={order.id} className="bg-white border rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-[#23611C]">
                          Zamówienie #{order.id} - {order.firstName} {order.lastName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'nowe' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'zrealizowane' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#23611C]">
                        {order.total.toFixed(2)} zł
                      </div>
                      <div className="text-sm text-gray-600">{order.payment}</div>
                      {order.status === 'nowe' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'zrealizowane')}
                          disabled={updatingOrder === order.id}
                          className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                          {updatingOrder === order.id ? 'Aktualizuję...' : 'Zrealizuj'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Dane klienta</h4>
                      <div className="text-sm">
                        <div>{order.email}</div>
                        <div>{order.phone || '-'}</div>
                        <div>{order.address}, {order.city} {order.zipCode}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Produkt</h4>
                      <div className="text-sm">
                        <div>Young COCO woda kokosowa</div>
                        <div>{order.variant} szt. × {order.quantity} = {order.price.toFixed(2)} zł</div>
                        <div>Dostawa: {order.delivery}</div>
                        {order.sessionId && (
                          <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                            <span>Stripe ID: {order.sessionId}</span>
                            <button 
                              onClick={() => navigator.clipboard.writeText(order.sessionId!)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Kopiuj ID sesji"
                            >
                              📋
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Zgody</h4>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <span>{order.consent1 ? '✅' : '❌'}</span>
                          <span>Regulamin</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{order.consent2 ? '✅' : '❌'}</span>
                          <span>Marketing</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {order.companyName && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Faktura</h4>
                      <div className="text-sm">
                        <div>{order.companyName}</div>
                        <div>NIP: {order.nip}</div>
                        {order.invoiceAddress && <div>{order.invoiceAddress}</div>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Paginacja - tylko gdy nie ma wyszukiwania */}
            {pagination.totalPages > 1 && (currentStatus !== "zrealizowane" || !searchTerm.trim()) && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  Pokazuję {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, pagination.total)} z {pagination.total} zamówień
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border rounded-lg disabled:opacity-50 hover:bg-white transition-colors"
                  >
                    ← Poprzednia
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-[#23611C] text-white'
                              : 'border hover:bg-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button 
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-2 border rounded-lg disabled:opacity-50 hover:bg-white transition-colors"
                  >
                    Następna →
                  </button>
                </div>
              </div>
            )}

            {/* Informacja gdy nie ma zamówień */}
            {!loading && (currentStatus === "zrealizowane" ? filteredOrders : orders).length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                  {currentStatus === "nowe" ? "Brak aktywnych zamówień" : 
                   searchTerm ? "Brak wyników wyszukiwania" : "Brak zrealizowanych zamówień"}
                </div>
                <div className="text-gray-400 text-sm">
                  {currentStatus === "nowe" 
                    ? "Nowe zamówienia pojawią się tutaj automatycznie" 
                    : searchTerm 
                    ? "Spróbuj zmienić kryteria wyszukiwania"
                    : "Zrealizowane zamówienia pojawią się tutaj po oznaczeniu jako zrealizowane"
                  }
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 