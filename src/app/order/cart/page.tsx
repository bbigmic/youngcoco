'use client';
import Image from "next/image";
import { useCart } from "../../CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PRODUCT = {
  name: "Young COCO woda kokosowa",
  imageUrl: "/can.png",
  // price: 129, // usuwam, bo cena zależy od wariantu
  variants: [240, 96, 24, 12],
};

const PRICES = {
  240: 1053.60,
  96: 421.44,
  24: 105.36,
  12: 55.08,
};
const UNIT_PRICES = {
  240: 4.39,
  96: 4.39,
  24: 4.39,
  12: 4.59,
};


const DELIVERY_OPTIONS = [
  { label: "Kurier InPost", value: "Kurier InPost", desc: "Wysyłka 24h", price: 13.99 },
];

const PAYMENT_OPTIONS = [
  { label: "Płatność kartą, Google Pay, BLIK", value: "stripe" },
];

export default function CartPage() {
  const { item, clearCart, increaseQuantity, decreaseQuantity } = useCart();
  const router = useRouter();
  const [promo, setPromo] = useState("");
  const [delivery, setDelivery] = useState(DELIVERY_OPTIONS[0].value);
  const [payment, setPayment] = useState(PAYMENT_OPTIONS[0].value);

  if (!item) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4 pt-32">
        <p className="text-xl mb-4 text-center">Koszyk jest pusty.</p>
        <button className="bg-[#23611C] text-white rounded px-6 py-2" onClick={() => router.push('/product')}>Wróć do produktu</button>
      </div>
    );
  }

  // Wyliczanie ceny na podstawie wariantu
  const variant = item.variant as 240 | 96 | 24 | 12;
  const netto = Math.round(PRICES[variant] * item.quantity * 100) / 100;
  const brutto = netto; // brutto = netto, bo ceny są brutto
  const deliveryObj = DELIVERY_OPTIONS.find(d => d.value === delivery)!;
  const deliveryCost = brutto >= 150 ? 0 : deliveryObj.price;
  const total = Math.round((brutto + deliveryCost) * 100) / 100;

  return (
    <div className="max-w-6xl mx-auto w-full pt-32 sm:pt-36 md:pt-40 py-12 md:py-16 px-4 md:px-6">
      <div className="mb-8 md:mb-10">
        <div className="flex items-center justify-center gap-1 md:gap-2 lg:gap-4 mb-6 md:mb-8 flex-wrap">
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full bg-[#23611C] text-white flex items-center justify-center font-bold text-xs md:text-sm lg:text-base">1</div>
            <span className="font-semibold text-xs md:text-sm lg:text-base">Twoje zamówienie</span>
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
          <div className="h-0.5 w-2 md:w-4 lg:w-8 bg-[#BDBDBD] hidden sm:block"></div>
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full bg-[#BDBDBD] text-white flex items-center justify-center font-bold text-xs md:text-sm lg:text-base">4</div>
            <span className="font-semibold text-[#BDBDBD] text-xs md:text-sm lg:text-base">Potwierdzenie</span>
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center md:text-left">Twoje zamówienie</h1>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        {/* Tabela produktu */}
        <div className="flex-1 w-full">
          {/* Responsywna tabela - desktop */}
          <div className="hidden md:block">
            <table className="w-full bg-[#FAFAF6] rounded-xl overflow-hidden mb-4">
              <thead>
                <tr className="text-left text-[#171717] text-sm md:text-base font-semibold border-b border-[#E0E0E0]">
                  <th className="py-3 md:py-4 px-4 md:px-6">Produkt</th>
                  <th className="py-3 md:py-4 px-4 md:px-6">Ilość</th>
                  <th className="py-3 md:py-4 px-4 md:px-6">Cena brutto</th>
                  <th className="py-3 md:py-4 px-4 md:px-6">Razem</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#E0E0E0]">
                  <td className="py-3 md:py-4 px-4 md:px-6 flex items-center gap-3 md:gap-4">
                    <Image src={PRODUCT.imageUrl} alt={PRODUCT.name} width={40} height={40} className="w-10 h-10 md:w-12 md:h-12" />
                    <span className="text-sm md:text-base">{PRODUCT.name} wariant {variant} sztuki</span>
                  </td>
                  <td className="py-3 md:py-4 px-4 md:px-6">
                    <div className="flex items-center gap-2">
                      <button 
                        className="border rounded w-6 h-6 md:w-7 md:h-7 flex items-center justify-center hover:bg-[#E6F7C7] transition-colors text-sm" 
                        onClick={decreaseQuantity}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="font-semibold text-base md:text-lg">{item.quantity}</span>
                      <button 
                        className="border rounded w-6 h-6 md:w-7 md:h-7 flex items-center justify-center hover:bg-[#E6F7C7] transition-colors text-sm" 
                        onClick={increaseQuantity}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-3 md:py-4 px-4 md:px-6 font-semibold text-sm md:text-base">{PRICES[variant].toFixed(2)} zł<br /><span className="text-xs text-[#7A7A7A]">({UNIT_PRICES[variant].toFixed(2)} zł/szt.)</span></td>
                  <td className="py-3 md:py-4 px-4 md:px-6 font-semibold text-sm md:text-base">{netto.toFixed(2)} zł</td>
                  <td className="py-3 md:py-4 px-4 md:px-6">
                    <button className="text-[#23611C] text-lg md:text-xl" onClick={clearCart} title="Usuń z koszyka">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Responsywna karta produktu - mobile */}
          <div className="md:hidden bg-[#FAFAF6] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Image src={PRODUCT.imageUrl} alt={PRODUCT.name} width={48} height={48} className="w-12 h-12" />
              <div className="flex-1">
                <div className="font-semibold text-sm">{PRODUCT.name}</div>
                <div className="text-xs text-[#7A7A7A]">Wariant {variant} sztuki</div>
              </div>
              <button className="text-[#23611C] text-lg" onClick={clearCart} title="Usuń z koszyka">🗑️</button>
            </div>
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm">
                <div className="font-semibold">{PRICES[variant].toFixed(2)} zł</div>
                <div className="text-xs text-[#7A7A7A]">({UNIT_PRICES[variant].toFixed(2)} zł/szt.)</div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="border rounded w-7 h-7 flex items-center justify-center hover:bg-[#E6F7C7] transition-colors" 
                  onClick={decreaseQuantity}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="font-semibold text-lg px-3">{item.quantity}</span>
                <button 
                  className="border rounded w-7 h-7 flex items-center justify-center hover:bg-[#E6F7C7] transition-colors" 
                  onClick={increaseQuantity}
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-right font-semibold text-base">
              Razem: {netto.toFixed(2)} zł
            </div>
          </div>
          
          <button className="bg-[#E6F7C7] text-[#23611C] rounded px-4 md:px-6 py-2 mb-4 text-sm md:text-base" onClick={() => router.push('/product')}>Wróć do zakupów</button>
          
          {/* Kod promocyjny */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6 md:mb-8">
            <input type="text" placeholder="Kod Promocyjny" value={promo} onChange={e => setPromo(e.target.value)} className="border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base w-full sm:w-60" />
            <button className="bg-[#23611C] text-white rounded px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap">Zastosuj kod</button>
          </div>
          
          {/* Sposób dostawy */}
          <div className="mb-6 md:mb-8">
            <div className="font-semibold mb-2 text-sm md:text-base">Sposób dostawy</div>
            <div className="flex flex-col gap-3">
              {DELIVERY_OPTIONS.map(opt => (
                <label key={opt.value} className={`flex items-center border rounded-lg px-3 md:px-4 py-3 cursor-pointer transition-all text-sm md:text-base ${delivery === opt.value ? 'border-[#23611C] bg-[#F8FFF2]' : 'border-[#E0E0E0] bg-white'}`}>
                  <input type="radio" name="delivery" value={opt.value} checked={delivery === opt.value} onChange={() => setDelivery(opt.value)} className="mr-3 accent-[#23611C]" />
                  <span className="flex-1">{opt.label} <span className="text-[#7A7A7A] ml-2">{opt.desc}</span></span>
                  <span className="font-semibold text-xs md:text-sm">Opłata za wysyłkę: {brutto >= 150 ? '0.00' : opt.price.toFixed(2)} zł</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Sposób płatności */}
          <div className="mb-6 md:mb-8">
            <div className="font-semibold mb-2 text-sm md:text-base">Sposób płatności</div>
            <div className="flex flex-col gap-3">
              {PAYMENT_OPTIONS.map(opt => (
                <label key={opt.value} className={`flex items-center border rounded-lg px-3 md:px-4 py-3 cursor-pointer transition-all text-sm md:text-base ${payment === opt.value ? 'border-[#23611C] bg-[#F8FFF2]' : 'border-[#E0E0E0] bg-white'}`}>
                  <input type="radio" name="payment" value={opt.value} checked={payment === opt.value} onChange={() => setPayment(opt.value)} className="mr-3 accent-[#23611C]" />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        {/* Podsumowanie */}
        <div className="w-full lg:w-80 bg-white border border-[#E6F7C7] rounded-xl p-4 md:p-6 mb-6 lg:mb-0">
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
          <button 
            className={`w-full bg-[#23611C] text-white rounded mt-4 md:mt-6 py-2 md:py-3 font-semibold text-sm md:text-base ${!item || !delivery || !payment ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (item && delivery && payment) router.push('/order/customer');
            }}
            disabled={!item || !delivery || !payment}
          >
            Przejdź dalej
          </button>
          <button className="w-full border border-[#23611C] text-[#23611C] rounded mt-3 py-2 md:py-3 font-semibold text-sm md:text-base bg-white" onClick={() => router.push('/product')}>
            Wróć do szczegółów produktu
          </button>
        </div>
      </div>
    </div>
  );
} 