"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "../../CartContext";
import { useEffect, useState, useRef } from "react";

export default function OrderConfirmationPage() {
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
  }, [sessionId, item, customer]);

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
      const PRICES = { 24: 105.36, 12: 55.08 };
      const DELIVERY_COST = 13.99;
      const variant = item.variant as 24 | 12;
      const netto = PRICES[variant] * item.quantity;
      const brutto = netto;
      const deliveryCost = brutto >= 200 ? 0 : DELIVERY_COST;
      const total = brutto + deliveryCost;

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
        price: PRICES[item.variant as 24 | 12],
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
    const PRICES = { 24: 105.36, 12: 55.08 };
    const DELIVERY_COST = 13.99;
    const variant = savedOrder.variant as 24 | 12;
    const netto = PRICES[variant] * savedOrder.quantity;
    const brutto = netto;
    const deliveryCost = brutto >= 200 ? 0 : DELIVERY_COST;
    const total = brutto + deliveryCost;
    
    summary = (
      <div className="w-full max-w-2xl bg-white border border-[#E6F7C7] rounded-xl p-6 mt-8 mx-auto">
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
                <span>{savedOrder.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Cena jednostkowa:</span>
                <span>{PRICES[variant].toFixed(2)} zł</span>
              </div>
              <div className="flex justify-between">
                <span>Wartość netto:</span>
                <span>{netto.toFixed(2)} zł</span>
              </div>
              <div className="flex justify-between">
                <span>Koszt dostawy:</span>
                <span>{deliveryCost.toFixed(2)} zł</span>
              </div>
              <hr className="my-2 border-[#E6F7C7]" />
              <div className="flex justify-between font-bold text-lg">
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
                <span>{customerData.firstName} {customerData.lastName}</span>
              </div>
              <div>
                <span className="font-medium">Adres dostawy:</span><br />
                <span>{customerData.street} {customerData.house}<br />
                {customerData.zip} {customerData.city}</span>
              </div>
              <div>
                <span className="font-medium">Email:</span><br />
                <span>{customerData.email}</span>
              </div>
              <div>
                <span className="font-medium">Telefon:</span><br />
                <span>{customerData.tel}</span>
              </div>
              {customerData.company && (
                <div>
                  <span className="font-medium">Firma:</span><br />
                  <span>{customerData.company}<br />
                  NIP: {customerData.nip}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">Informacje o dostawie</h4>
          <p className="text-sm text-green-700">
            Sposób dostawy: {savedOrder.delivery}<br />
            Forma płatności: {savedOrder.payment}<br />
            Status: {savedOrder.status}
          </p>
        </div>
      
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto w-full pt-32 py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#23611C] mb-4"></div>
        <p className="text-lg">Zapisujemy Twoje zamówienie...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto w-full pt-32 py-16 px-4 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold mb-6 text-red-600">Błąd zapisu zamówienia</h1>
        <p className="text-lg mb-8 text-red-600">{error}</p>
        <button className="bg-[#23611C] text-white rounded px-8 py-3 font-semibold text-base" onClick={() => router.push("/order/summary")}>
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full pt-32 py-16 px-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-[#23611C]">Dziękujemy za złożenie zamówienia!</h1>
        <p className="text-lg text-gray-600">
          Twoje zamówienie zostało przyjęte do realizacji.<br />
          Wkrótce otrzymasz potwierdzenie na podany adres e-mail.
        </p>
      </div>
      
      {summary}
      
      <div className="text-center mt-8">
        <button 
          className="bg-[#23611C] text-white rounded px-8 py-3 font-semibold text-base hover:bg-[#1a4a15] transition-colors" 
          onClick={() => router.push("/")}
        >
          Wróć na stronę główną
        </button>
      </div>
    </div>
  );
} 