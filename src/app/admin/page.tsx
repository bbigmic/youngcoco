"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [additionalStatsLoaded, setAdditionalStatsLoaded] = useState(false);
  const router = useRouter();

  // Sprawdź autoryzację przy ładowaniu
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/check-auth");
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          router.push("/admin/login");
        }
      } catch {
        router.push("/admin/login");
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
      loadStats();
    }
  }, [currentPage, currentStatus, isAuthenticated, loadOrders, loadStats]);

  // Ustaw flagę załadowania tylko raz po pierwszym załadowaniu danych
  useEffect(() => {
    if (isAuthenticated && stats && !isLoaded) {
      // Ustaw flagę załadowania po krótkim opóźnieniu dla animacji
      setTimeout(() => setIsLoaded(true), 100);
    }
  }, [isAuthenticated, stats, isLoaded, isAuthenticated]);

  // Resetuj animacje gdy zmienia się status
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoaded(false);
      setTimeout(() => setIsLoaded(true), 200);
    }
  }, [currentStatus]);

  // Resetuj animacje dodatkowych kafelków gdy pokazują się/ukrywają
  useEffect(() => {
    if (showAllStats && isAuthenticated) {
      setAdditionalStatsLoaded(false);
      // Krótkie opóźnienie aby animacje działały poprawnie
      setTimeout(() => setAdditionalStatsLoaded(true), 100);
    } else {
      setAdditionalStatsLoaded(false);
    }
  }, [showAllStats, isAuthenticated]);

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

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      console.error("Błąd wylogowania");
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  }

  return (
    <div className="max-w-7xl mx-auto w-full pt-32 py-16 px-4">
      {checkingAuth ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#23611C] mx-auto mb-4"></div>
            <p className="text-gray-600">Sprawdzanie autoryzacji...</p>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Przekierowywanie do logowania...</p>
          </div>
        </div>
      ) : (
        <>
          <div className={`mb-8 mt-12 flex justify-between items-center transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h1 className="text-3xl font-bold">Panel Administracyjny</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Wyloguj
            </button>
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
                <div className={`bg-white border rounded-xl p-6 shadow-sm transition-all duration-700 ease-out ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`} style={{ transitionDelay: '0.1s' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Wszystkie zamówienia</p>
                      <p className="text-2xl font-bold text-[#23611C]">{stats.totalOrders}</p>
                    </div>
                    <div className={`p-3 bg-blue-100 rounded-full transition-all duration-700 ease-out ${
                      isLoaded ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                    }`} style={{ transitionDelay: '0.3s' }}>
                      <svg className={`w-6 h-6 text-blue-600 ${isLoaded ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animationDelay: '0.8s' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Nowe zamówienia */}
                <div className={`bg-white border rounded-xl p-6 shadow-sm transition-all duration-700 ease-out ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`} style={{ transitionDelay: '0.2s' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nowe zamówienia</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.newOrders}</p>
                    </div>
                    <div className={`p-3 bg-yellow-100 rounded-full transition-all duration-700 ease-out ${
                      isLoaded ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                    }`} style={{ transitionDelay: '0.4s' }}>
                      <svg className={`w-6 h-6 text-yellow-600 ${isLoaded ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animationDelay: '0.9s' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Zrealizowane zamówienia */}
                <div className={`bg-white border rounded-xl p-6 shadow-sm transition-all duration-700 ease-out ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`} style={{ transitionDelay: '0.3s' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Zrealizowane</p>
                      <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
                    </div>
                    <div className={`p-3 bg-green-100 rounded-full transition-all duration-700 ease-out ${
                      isLoaded ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                    }`} style={{ transitionDelay: '0.5s' }}>
                      <svg className={`w-6 h-6 text-green-600 ${isLoaded ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animationDelay: '1.0s' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Całkowity przychód */}
                <div className={`bg-white border rounded-xl p-6 shadow-sm transition-all duration-700 ease-out ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`} style={{ transitionDelay: '0.4s' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Przychód</p>
                      <p className="text-2xl font-bold text-[#23611C]">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                    <div className={`p-3 bg-green-100 rounded-full transition-all duration-700 ease-out ${
                      isLoaded ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                    }`} style={{ transitionDelay: '0.6s' }}>
                      <svg className={`w-6 h-6 text-green-600 ${isLoaded ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animationDelay: '1.1s' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Przycisk rozwijania dodatkowych statystyk */}
              <div className={`flex justify-center mb-12 transition-all duration-700 ease-out ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`} style={{ transitionDelay: '0.5s' }}>
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
                  <div className={`bg-white border rounded-xl p-6 shadow-sm transition-all duration-500 ease-out ${
                    additionalStatsLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`} style={{ transitionDelay: '0.1s' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Średnia wartość</p>
                        <p className="text-2xl font-bold text-[#23611C]">{formatCurrency(stats.averageOrderValue)}</p>
                      </div>
                      <div className={`p-3 bg-blue-100 rounded-full transition-all duration-500 ease-out ${
                        additionalStatsLoaded ? 'scale-100' : 'scale-0'
                      }`} style={{ transitionDelay: '0.2s' }}>
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Zamówienia z dzisiaj */}
                  <div className={`bg-white border rounded-xl p-6 shadow-sm transition-all duration-500 ease-out ${
                    additionalStatsLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`} style={{ transitionDelay: '0.2s' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Dzisiaj</p>
                        <p className="text-2xl font-bold text-orange-600">{stats.todayOrders}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(stats.todayRevenue)}</p>
                      </div>
                      <div className={`p-3 bg-orange-100 rounded-full transition-all duration-500 ease-out ${
                        additionalStatsLoaded ? 'scale-100' : 'scale-0'
                      }`} style={{ transitionDelay: '0.3s' }}>
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Zamówienia z tego miesiąca */}
                  <div className={`bg-white border rounded-xl p-6 shadow-sm transition-all duration-500 ease-out ${
                    additionalStatsLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`} style={{ transitionDelay: '0.3s' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Ten miesiąc</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.thisMonthOrders}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(stats.thisMonthRevenue)}</p>
                      </div>
                      <div className={`p-3 bg-purple-100 rounded-full transition-all duration-500 ease-out ${
                        additionalStatsLoaded ? 'scale-100' : 'scale-0'
                      }`} style={{ transitionDelay: '0.4s' }}>
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Top miasta */}
                  <div className={`bg-white border rounded-xl p-6 shadow-sm lg:col-span-2 transition-all duration-500 ease-out ${
                    additionalStatsLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`} style={{ transitionDelay: '0.4s' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Top miasta</p>
                        <p className="text-lg font-bold text-[#23611C]">Najwięcej zamówień</p>
                      </div>
                      <div className={`p-3 bg-indigo-100 rounded-full transition-all duration-500 ease-out ${
                        additionalStatsLoaded ? 'scale-100' : 'scale-0'
                      }`} style={{ transitionDelay: '0.5s' }}>
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {stats.topCities.map((city) => (
                        <div key={city.city} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{city.city}</span>
                          <span className="text-sm text-gray-600">{city._count.city} zamówień</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tabs dla statusów zamówień */}
          <div className={`mb-6 transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '0.6s' }}>
          <h1 className="text-3xl font-bold mb-4">Zamówienia</h1>
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {["nowe", "w trakcie", "zrealizowane"].map((status) => (
                <button
                  key={status}
                  onClick={() => setCurrentStatus(status)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    currentStatus === status
                      ? "bg-white text-[#23611C] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Wyszukiwanie dla historii */}
          {currentStatus === "zrealizowane" && (
            <div className={`mb-6 transition-all duration-700 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} style={{ transitionDelay: '0.7s' }}>
              <input
                type="text"
                placeholder="Wyszukaj zamówienia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23611C] focus:border-transparent"
              />
            </div>
          )}

          {/* Lista zamówień */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white border rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className={`text-center py-12 transition-all duration-700 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} style={{ transitionDelay: '0.8s' }}>
              <div className="bg-white border rounded-lg p-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {currentStatus === "nowe" ? "Tutaj pojawią się nowe zamówienia" : 
                   currentStatus === "w trakcie" ? "Brak zamówień w trakcie realizacji" :
                   "Brak zrealizowanych zamówień"}
                </h3>
                <p className="text-gray-500">
                  {currentStatus === "nowe" ? "Gdy klienci złożą zamówienia, pojawią się one tutaj" :
                   currentStatus === "w trakcie" ? "Zamówienia w trakcie realizacji pojawią się tutaj" :
                   "Zrealizowane zamówienia pojawią się tutaj"}
                </p>
              </div>
            </div>
          ) : (
            <div className={`space-y-4 transition-all duration-700 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} style={{ transitionDelay: '0.8s' }}>
              {filteredOrders.map((order, index) => (
                <div 
                  key={order.id} 
                  className="bg-white border rounded-lg p-6 hover:shadow-md transition-all duration-300 ease-out"
                  style={{ 
                    animationDelay: `${0.9 + (index * 0.1)}s`,
                    animation: isLoaded ? 'fadeInUp 0.6s ease-out forwards' : 'none'
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {order.firstName} {order.lastName}
                      </h3>
                      <p className="text-gray-600">{order.email}</p>
                      {order.phone && <p className="text-gray-600">{order.phone}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#23611C]">{formatCurrency(order.total)}</p>
                      <p className="text-sm text-gray-500">ID: {order.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Adres</p>
                      <p className="text-sm">{order.address}</p>
                      <p className="text-sm">{order.zipCode} {order.city}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Szczegóły zamówienia</p>
                      <p className="text-sm">Wariant: {order.variant}</p>
                      <p className="text-sm">Ilość: {order.quantity}</p>
                      <p className="text-sm">Dostawa: {order.delivery}</p>
                      <p className="text-sm">Płatność: {order.payment}</p>
                    </div>
                  </div>

                  {order.companyName && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Firma
                      </p>
                      <p className="text-sm font-medium text-gray-800">{order.companyName}</p>
                      {order.nip && <p className="text-sm text-gray-600">NIP: {order.nip}</p>}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('pl-PL')}
                    </div>
                    {currentStatus !== "zrealizowane" && (
                      <div className="flex space-x-2">
                        {currentStatus === "nowe" && (
                          <button
                            onClick={() => updateOrderStatus(order.id, "w trakcie")}
                            disabled={updatingOrder === order.id}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 transition-colors"
                          >
                            {updatingOrder === order.id ? "Aktualizuję..." : "W trakcie"}
                          </button>
                        )}
                        {currentStatus === "w trakcie" && (
                          <button
                            onClick={() => updateOrderStatus(order.id, "zrealizowane")}
                            disabled={updatingOrder === order.id}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 transition-colors"
                          >
                            {updatingOrder === order.id ? "Aktualizuję..." : "Zrealizuj"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginacja */}
          {pagination.totalPages > 1 && currentStatus !== "zrealizowane" && (
            <div className={`flex justify-center mt-8 transition-all duration-700 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} style={{ transitionDelay: '1.0s' }}>
              <div className="flex space-x-2">
                {currentPage > 1 && (
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
                  >
                    Poprzednia
                  </button>
                )}
                <span className="px-3 py-2 text-sm">
                  Strona {currentPage} z {pagination.totalPages}
                </span>
                {currentPage < pagination.totalPages && (
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
                  >
                    Następna
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg animate-fadeIn">
              {error}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes iconPop {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-iconPop {
          animation: iconPop 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
} 