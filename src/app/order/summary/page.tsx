"use client";
import { useCart } from "../../CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

const PRICES = {
  240: 1053.60,
  96: 421.44,
  24: 105.36,
  12: 55.08,
};

const DELIVERY_OPTIONS = [
  { label: "Kurier InPost", value: "Kurier InPost", desc: "Wysyłka 24h", price: 13.99 },
];
const PAYMENT_OPTIONS = [
  { label: "Płatność kartą, Google Pay, BLIK", value: "Stripe" },
];

export default function OrderSummaryPage() {
  const { item, customer } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // TODO: pobierz wybrane opcje dostawy i płatności z contextu lub localStorage
  const delivery = DELIVERY_OPTIONS[0];
  const payment = PAYMENT_OPTIONS[0];

  if (!item || !customer) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4 pt-32">
        <p className="text-xl mb-4 text-center">Brak danych zamówienia.</p>
        <button className="bg-[#23611C] text-white rounded px-6 py-2" onClick={() => router.push('/order/cart')}>Wróć do koszyka</button>
      </div>
    );
  }

  const variant = item.variant as 240 | 96 | 24 | 12;
  const netto = Math.round(PRICES[variant] * item.quantity * 100) / 100;
  const brutto = netto;
  const deliveryCost = brutto >= 150 ? 0 : delivery.price;
  const total = Math.round((brutto + deliveryCost) * 100) / 100;

  async function handleOrder() {
    if (!item || !customer) return;
    setLoading(true);
    setError(null);
    try {
      console.log('Customer data in summary:', customer);
      console.log('Item data in summary:', item);
      
      // Przygotuj dane do Stripe
      const orderData = {
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
        total: total, // Używamy total z obliczeń na stronie
        delivery: delivery.label,
        payment: payment.label,
        orderId: Date.now().toString(), // Tymczasowe ID zamówienia
        consent1: customer.consent1 || false,
        consent2: customer.consent2 || false,
      };

      console.log('Order data for Stripe:', orderData);

      // Wywołaj API Stripe
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderData,
          successUrl: `${window.location.origin}/order/confirmation`,
          cancelUrl: `${window.location.origin}/order/payment-failed`,
        }),
      });

      if (!res.ok) throw new Error("Błąd tworzenia sesji płatności");
      
      const { url } = await res.json();
      
      // Przekieruj do Stripe
      window.location.href = url;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Błąd płatności");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto w-full pt-32 sm:pt-36 md:pt-40 py-12 md:py-16 px-4 md:px-6">
      <div className="mb-8 md:mb-10">
        <div className="flex items-center justify-center gap-1 md:gap-2 lg:gap-4 mb-6 md:mb-8 flex-wrap">
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full bg-[#BDBDBD] text-white flex items-center justify-center font-bold text-xs md:text-sm lg:text-base">1</div>
            <span className="font-semibold text-xs md:text-sm lg:text-base">Twoje zamówienie</span>
          </div>
          <div className="h-0.5 w-2 md:w-4 lg:w-8 bg-[#BDBDBD] hidden sm:block"></div>
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full bg-[#BDBDBD] text-white flex items-center justify-center font-bold text-xs md:text-sm lg:text-base">2</div>
            <span className="font-semibold text-xs md:text-sm lg:text-base">Dane klienta</span>
          </div>
          <div className="h-0.5 w-2 md:w-4 lg:w-8 bg-[#23611C] hidden sm:block"></div>
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full bg-[#23611C] text-white flex items-center justify-center font-bold text-xs md:text-sm lg:text-base">3</div>
            <span className="font-semibold text-xs md:text-sm lg:text-base">Podsumowanie</span>
          </div>
          <div className="h-0.5 w-2 md:w-4 lg:w-8 bg-[#BDBDBD] hidden sm:block"></div>
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full bg-[#BDBDBD] text-white flex items-center justify-center font-bold text-xs md:text-sm lg:text-base">4</div>
            <span className="font-semibold text-[#BDBDBD] text-xs md:text-sm lg:text-base">Potwierdzenie</span>
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center md:text-left">Podsumowanie zamówienia</h1>
        
        {/* Responsywna tabela produktów - desktop */}
        <div className="hidden md:block bg-[#FAFAF6] rounded-xl overflow-hidden mb-6 md:mb-8">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[#171717] text-sm md:text-base font-semibold border-b border-[#E0E0E0]">
                <th className="py-3 md:py-4 px-4 md:px-6">Produkt</th>
                <th className="py-3 md:py-4 px-4 md:px-6">Ilość</th>
                <th className="py-3 md:py-4 px-4 md:px-6">Cena</th>
                <th className="py-3 md:py-4 px-4 md:px-6">Razem</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 md:py-4 px-4 md:px-6 flex items-center gap-3 md:gap-4">
                  <Image src="/can.png" alt="Young Coco" width={40} height={40} className="w-10 h-10 md:w-12 md:h-12" />
                  <span className="text-sm md:text-base">Young COCO woda kokosowa {variant} sztuk</span>
                </td>
                <td className="py-3 md:py-4 px-4 md:px-6 text-sm md:text-base">{item.quantity}</td>
                <td className="py-3 md:py-4 px-4 md:px-6 text-sm md:text-base">{PRICES[variant].toFixed(2)} zł</td>
                <td className="py-3 md:py-4 px-4 md:px-6 text-sm md:text-base">{netto.toFixed(2)} zł</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Responsywna karta produktu - mobile */}
        <div className="md:hidden bg-[#FAFAF6] rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Image src="/can.png" alt="Young Coco" width={48} height={48} className="w-12 h-12" />
            <div className="flex-1">
              <div className="font-semibold text-sm">Young COCO woda kokosowa</div>
              <div className="text-xs text-[#7A7A7A]">{variant} sztuk</div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div>
              <div className="font-semibold">{PRICES[variant].toFixed(2)} zł</div>
              <div className="text-xs text-[#7A7A7A]">Cena za sztukę</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{item.quantity}</div>
              <div className="text-xs text-[#7A7A7A]">Ilość</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{netto.toFixed(2)} zł</div>
              <div className="text-xs text-[#7A7A7A]">Razem</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-6 md:mb-8">
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-2">Dostawa</h2>
            <div className="flex flex-col sm:flex-row sm:gap-8 mb-2 text-sm md:text-base">
              <div><span className="font-semibold">Sposób dostawy:</span> {delivery.label}</div>
              <div><span className="font-semibold">Czas realizacji:</span> {delivery.desc}</div>
              <div><span className="font-semibold">Opłata za wysyłkę:</span> {deliveryCost.toFixed(2)} zł</div>
            </div>
            
            <h2 className="text-lg md:text-xl font-bold mb-2 mt-4 md:mt-6">Forma płatności</h2>
            <div className="mb-2 text-sm md:text-base"><span className="font-semibold">Wybrana forma:</span> {payment.label}</div>
            
            <h2 className="text-lg md:text-xl font-bold mb-2 mt-4 md:mt-6">Dane Klienta</h2>
            <div className="mb-2 text-sm md:text-base">
              <span className="font-semibold">Dane Klienta:</span><br />
              {customer.firstName} {customer.lastName}<br />
              {customer.street} {customer.house}<br />
              {customer.zip} {customer.city}
            </div>
            <div className="mb-2 text-sm md:text-base"><span className="font-semibold">Adres e-mail:</span> {customer.email}</div>
            <div className="mb-2 text-sm md:text-base"><span className="font-semibold">Telefon kontaktowy:</span> {customer.tel}</div>
            {customer.invoice && (
              <>
                <h2 className="text-lg md:text-xl font-bold mb-2 mt-4 md:mt-6">Dane Faktury</h2>
                <div className="mb-2 text-sm md:text-base">
                  {customer.company}<br />
                  {customer.invoiceStreet} {customer.invoiceHouse}<br />
                  {customer.invoiceZip} {customer.invoiceCity}
                </div>
                <div className="mb-2 text-sm md:text-base">NIP: {customer.nip}</div>
              </>
            )}
          </div>
          
          <div className="w-full lg:w-auto bg-white border border-[#E6F7C7] rounded-xl p-4 md:p-6 h-fit">
            <div className="font-semibold text-base md:text-lg mb-4">Podsumowanie</div>
            <div className="flex justify-between mb-2 text-[#171717] text-sm md:text-base">
              <span>Wartość netto</span>
              <span className="font-semibold">{netto.toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between mb-2 text-[#171717] text-sm md:text-base">
              <span>Wartość brutto</span>
              <span className="font-semibold">{brutto.toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between mb-2 text-[#171717] text-sm md:text-base">
              <span>Koszt dostawy</span>
              <span className="font-semibold">{deliveryCost.toFixed(2)} zł</span>
            </div>
            <hr className="my-2 border-[#E6F7C7]" />
            <div className="flex justify-between text-base md:text-lg font-bold">
              <span>Razem</span>
              <span>{total.toFixed(2)} zł</span>
            </div>
            <button className="w-full bg-[#23611C] text-white rounded mt-4 md:mt-6 py-2 md:py-3 font-semibold text-sm md:text-base" onClick={handleOrder} disabled={loading}>
              {loading ? "Przetwarzanie..." : "Zapłać"}
            </button>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <button className="w-full border border-[#23611C] text-[#23611C] rounded mt-3 py-2 md:py-3 font-semibold text-sm md:text-base bg-white" onClick={() => router.push('/order/customer')}>
              Wróć do szczegółów zamówienia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 