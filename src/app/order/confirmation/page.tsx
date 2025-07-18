"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "../../CartContext";
import { useEffect, useState, useRef, Suspense } from "react";

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { item, customer, clearCart } = useCart();
  const [orderSaved, setOrderSaved] = useState(false);
  const [savedOrder, setSavedOrder] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedSave = useRef(false);

  // Funkcja do generowania numeru zamówienia
  const generateOrderNumber = (id: number) => {
    return `#${1000 + id}`;
  };

  // Funkcja do sprawdzania istniejącego zamówienia
  async function checkExistingOrder() {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/orders?sessionId=${sessionId}`);
      
      if (res.ok) {
        const existingOrder = await res.json();
        console.log('Found existing order:', existingOrder);
        setSavedOrder(existingOrder);
        setOrderSaved(true);
      } else {
        console.log('No existing order found, will save new one');
        // Jeśli nie ma istniejącego zamówienia, spróbuj zapisać nowe
        if (item && customer) {
          saveOrderToDatabase();
        }
      }
    } catch (error: unknown) {
      console.error('Error checking existing order:', error);
      setError(error instanceof Error ? error.message : "Błąd sprawdzania zamówienia");
    } finally {
      setLoading(false);
    }
  }

  // Sprawdź czy płatność była udana (parametry z Stripe)
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    console.log('Confirmation page - sessionId:', sessionId);
    console.log('Confirmation page - item:', item);
    console.log('Confirmation page - customer:', customer);
    console.log('Confirmation page - orderSaved:', orderSaved);
    console.log('Confirmation page - hasAttemptedSave:', hasAttemptedSave.current);
    
    // Jeśli mamy sessionId, spróbuj pobrać istniejące zamówienie
    if (sessionId && !orderSaved && !hasAttemptedSave.current) {
      hasAttemptedSave.current = true;
      checkExistingOrder();
    }
    // Zapisz zamówienie tylko raz, jeśli mamy dane i jeszcze nie próbowaliśmy
    else if (item && customer && !orderSaved && !hasAttemptedSave.current) {
      console.log('Starting to save order...');
      hasAttemptedSave.current = true;
      saveOrderToDatabase();
    } else if (!item || !customer) {
      console.log('Missing data - item:', !!item, 'customer:', !!customer);
    }
  }, [sessionId, item, customer, orderSaved, checkExistingOrder, saveOrderToDatabase]);

  async function saveOrderToDatabase() {
    if (!item || !customer) {
      console.log('Cannot save order - missing data');
      console.log('Item:', item);
      console.log('Customer:', customer);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const PRICES = { 240: 1053.60, 96: 421.44, 24: 105.36, 12: 55.08 };
      const DELIVERY_COST = 13.99;
      const variant = item.variant as 240 | 96 | 24 | 12;
      const netto = Math.round(PRICES[variant] * item.quantity * 100) / 100;
      const brutto = netto;
      const deliveryCost = brutto >= 150 ? 0 : DELIVERY_COST;
      const total = Math.round((brutto + deliveryCost) * 100) / 100;

      const orderData = {
        sessionId: sessionId || null,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.tel,
        address: customer.street + ' ' + customer.house,
        city: customer.city,
        zipCode: customer.zip,
        companyName: customer.company || null,
        nip: customer.nip || null,
        invoiceAddress: customer.invoiceStreet && customer.invoiceHouse && customer.invoiceZip && customer.invoiceCity
          ? `${customer.invoiceStreet} ${customer.invoiceHouse}, ${customer.invoiceZip} ${customer.invoiceCity}`
          : null,
        variant: item.variant,
        quantity: item.quantity,
        price: PRICES[item.variant as 240 | 96 | 24 | 12],
        total: total,
        delivery: "Kurier InPost", // Domyślna opcja
        payment: "Stripe",
        consent1: customer.consent1 || false,
        consent2: customer.consent2 || false,
      };

      console.log('Saving order to database:', orderData);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        throw new Error(`Błąd zapisu zamówienia: ${errorData.error || res.statusText}`);
      }
      
      const savedOrderData = await res.json();
      console.log('Order saved successfully:', savedOrderData);
      
      setSavedOrder(savedOrderData);
      setOrderSaved(true);
      
      // Wyczyść koszyk po udanym zamówieniu - ale tylko jeśli nie jest to odświeżenie strony
      if (!sessionId) {
        clearCart();
      }
    } catch (error: unknown) {
      console.error('Error saving order:', error);
      setError(error instanceof Error ? error.message : "Błąd zapisu zamówienia");
    } finally {
      setLoading(false);
    }
  }

  let summary = null;
  if (savedOrder) {
    // Jeśli nie mamy danych klienta z kontekstu, użyj danych z zapisanego zamówienia
    const customerData = customer || {
      firstName: savedOrder.firstName,
      lastName: savedOrder.lastName,
      email: savedOrder.email,
      tel: savedOrder.phone,
      street: savedOrder.address.split(' ').slice(0, -1).join(' '),
      house: savedOrder.address.split(' ').slice(-1)[0],
      zip: savedOrder.zipCode,
      city: savedOrder.city,
      company: savedOrder.companyName,
      nip: savedOrder.nip,
      consent1: savedOrder.consent1,
      consent2: savedOrder.consent2,
    };
    const PRICES = { 240: 1053.60, 96: 421.44, 24: 105.36, 12: 55.08 };
    const DELIVERY_COST = 13.99;
    const variant = savedOrder.variant as 240 | 96 | 24 | 12;
    const netto = Math.round(PRICES[variant] * savedOrder.quantity * 100) / 100;
    const brutto = netto;
    const deliveryCost = brutto >= 150 ? 0 : DELIVERY_COST;
    const total = Math.round((brutto + deliveryCost) * 100) / 100;
    
    summary = (
      <div className="w-full max-w-2xl bg-white border border-[#E6F7C7] rounded-xl p-6 mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#23611C] mb-2">
            Numer zamówienia: {generateOrderNumber(savedOrder.id)}
          </h2>
          <p className="text-gray-600">Data zamówienia: {new Date(savedOrder.createdAt).toLocaleDateString('pl-PL')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Szczegóły zamówienia */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-[#23611C]">Szczegóły zamówienia</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Produkt:</span>
                <span>Young COCO woda kokosowa {variant} sztuk</span>
              </div>
              <div className="flex justify-between">
                <span>Ilość:</span>
                <span>{savedOrder.quantity} szt.</span>
              </div>
              <div className="flex justify-between">
                <span>Cena jednostkowa:</span>
                <span>{savedOrder.price.toFixed(2)} zł</span>
              </div>
              <div className="flex justify-between">
                <span>Dostawa:</span>
                <span>{savedOrder.delivery}</span>
              </div>
              <div className="flex justify-between">
                <span>Płatność:</span>
                <span>{savedOrder.payment}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Razem:</span>
                <span>{total.toFixed(2)} zł</span>
              </div>
            </div>
          </div>
          
          {/* Dane klienta */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-[#23611C]">Dane klienta</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Imię i nazwisko:</span><br />
                {customerData.firstName} {customerData.lastName}
              </div>
              <div>
                <span className="font-medium">Email:</span><br />
                {customerData.email}
              </div>
              <div>
                <span className="font-medium">Telefon:</span><br />
                {customerData.tel}
              </div>
              <div>
                <span className="font-medium">Adres:</span><br />
                {customerData.street} {customerData.house}<br />
                {customerData.zip} {customerData.city}
              </div>
              {customerData.company && (
                <div>
                  <span className="font-medium">Firma:</span><br />
                  {customerData.company}<br />
                  NIP: {customerData.nip}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-green-600 font-semibold mb-4">
            ✅ Twoje zamówienie zostało złożone pomyślnie!
          </p>
          <p className="text-gray-600 text-sm mb-6">
            Potwierdzenie zostało wysłane na adres email: {customerData.email}
          </p>
          <button 
            onClick={() => router.push('/')}
            className="bg-[#23611C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#115E2B] transition-colors"
          >
            Wróć do strony głównej
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#23611C] mx-auto mb-4"></div>
          <p className="text-gray-600">Przetwarzanie zamówienia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Wystąpił błąd</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/order/cart')}
            className="bg-[#23611C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#115E2B] transition-colors"
          >
            Wróć do koszyka
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8 mt-26 md:mb-10">
          <div className="flex items-center justify-center gap-1 md:gap-2 lg:gap-4 mb-6 md:mb-8 flex-wrap">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full bg-[#BDBDBD] text-white flex items-center justify-center font-bold text-xs md:text-sm lg:text-base">1</div>
              <span className="font-semibold text-[#BDBDBD] text-xs md:text-sm lg:text-base">Twoje zamówienie</span>
            </div>
            <div className="h-0.5 w-2 md:w-4 lg:w-8 bg-[#BDBDBD] hidden sm:block"></div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full bg-[#BDBDBD] text-white flex items-center justify-center font-bold text-xs md:text-sm lg:text-base">2</div>
              <span className="font-semibold text-[#BDBDBD] text-xs md:text-sm lg:text-base">Dane klienta</span>
            </div>
            <div className="h-0.5 w-2 md:w-4 lg:w-8 bg-[#BDBDBD] hidden sm:block"></div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full bg-[#BDBDBD] text-white flex items-center justify-center font-bold text-xs md:text-sm lg:text-base">3</div>
              <span className="font-semibold text-[#BDBDBD] text-xs md:text-sm lg:text-base">Podsumowanie</span>
            </div>
            <div className="h-0.5 w-2 md:w-4 lg:w-8 bg-[#23611C] hidden sm:block"></div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full bg-[#23611C] text-white flex items-center justify-center font-bold text-xs md:text-sm lg:text-base">4</div>
              <span className="font-semibold text-xs md:text-sm lg:text-base">Potwierdzenie</span>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#23611C] mb-2">
            Potwierdzenie zamówienia
          </h1>
          <p className="text-gray-600">
            Dziękujemy za Twoje zamówienie!
          </p>
        </div>
        
        {summary}
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#23611C] mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
} 