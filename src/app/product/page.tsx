'use client';

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../CartContext";

const product = {
  name: "Young COCO woda kokosowa",
  code: "AUT-3245 376",
  volume: "330 ml",
  description: "Napój niegazowany.",
  details: "Woda kokosowa z kawałkami orzecha.",
  // Usuwam price i oldPrice, bo będą liczone dynamicznie
  variants: [24, 12],
  images: [
    "/can.png",
    "/can.png",
    "/can.png",
    "/can.png",
    "/can.png",
  ],
};

// Cennik dla wariantów
const PRICES = {
  24: 105.36,
  12: 55.08,
};
const UNIT_PRICES = {
  24: 4.39,
  12: 4.59,
};
const OLD_PRICES = {
  24: 131.76, // przykładowa przekreślona cena (np. 5.49 zł/szt)
  12: 65.88,
};

export default function ProductPage() {
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(product.variants[0]);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-start pt-36 pb-20">
      <div className="flex flex-col md:flex-row w-full max-w-6xl gap-4 md:gap-24 px-4 md:px-0 items-start md:items-start">
        {/* Zdjęcia */}
        <div className="flex flex-col items-center flex-1 md:sticky md:top-36">
          <div className="mb-10">
            <Image src={product.images[selectedImg]} alt={product.name} width={320} height={440} className="mx-auto" />
          </div>
          <div className="flex gap-8 mt-2">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setSelectedImg(i)} className={`border rounded-lg p-1 transition ${selectedImg === i ? 'border-[#A1C63A]' : 'border-[#E0E0E0]'}`}> 
                <Image src={img} alt={`Young Coco miniatura ${i+1}`} width={60} height={60} />
              </button>
            ))}
          </div>
        </div>
        {/* Szczegóły produktu */}
        <div className="flex-1 flex flex-col gap-6 max-w-xl w-full">
          <div className="flex gap-2 mb-2">
            <span className="bg-[#E6F7C7] text-[#23611C] text-xs font-semibold px-3 py-1 rounded-lg">Promocja</span>
            <span className="bg-[#23611C] text-white text-xs font-semibold px-3 py-1 rounded-lg">Nowość</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#171717] mb-2">{product.name}</h1>
          <div className="text-[#7A7A7A] text-sm mb-1">{product.code}</div>
          <div className="text-[#171717] text-base mb-1">{product.volume}</div>
          <div className="text-[#171717] text-base mb-4">Opis produktu:<br /><span className="font-normal">{product.description}</span></div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2 w-full">
            <div className="relative w-full md:w-auto">
              <select value={qty} onChange={e => setQty(Number(e.target.value))} className="border border-[#BDBDBD] rounded-lg px-4 pr-10 py-2 text-base focus:outline-none min-w-[140px] h-[40px] text-[#171717] appearance-none w-full">
                {product.variants.map(v => (
                  <option key={v} value={v}>{v} sztuk</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                <img src="/icons-svg/down-arrow.svg" alt="strzałka" className="w-5 h-5" />
              </span>
            </div>
            <button
              className="bg-[#23611C] hover:bg-[#115E2B] text-white font-bold rounded-[8px] px-10 py-2 flex items-center gap-2 text-[14px] shadow-lg transition-all h-[40px] min-w-[180px] justify-center md:ml-auto"
              onClick={() => { addToCart(qty); router.push('/order/cart'); }}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M7 18c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm10 0c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zM7.16 16l.94-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 5H6.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12z" fill="currentColor"/></svg>
              Kup teraz
            </button>
          </div>
          <div className="flex flex-col items-start md:items-end mb-2 w-full">
            <span className="text-[#7A7A7A] text-base line-through mb-0.5">{OLD_PRICES[qty as 24 | 12].toFixed(2)} zł</span>
            <div className="flex flex-row items-end gap-2">
              <span className="text-[#7A7A7A] text-base">Cena:</span>
              <span className="text-[#23611C] text-3xl font-bold">{PRICES[qty as 24 | 12].toFixed(2)} zł</span>
              <span className="text-[#7A7A7A] text-base ml-2">({UNIT_PRICES[qty as 24 | 12].toFixed(2)} zł/szt.)</span>
            </div>
          </div>
          {/* Skład i Alergeny */}
          <div className="rounded-lg overflow-hidden mb-4">
            <button onClick={() => setShowDetails(v => !v)} className="w-full flex justify-between items-center px-6 py-4 bg-[#F7F7F7] text-[#171717] font-semibold text-base focus:outline-none">
              Skład i Alergeny
              <span className={`ml-2 transition-transform text-2xl ${showDetails ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showDetails && (
              <div className="px-6 py-4 bg-white text-[#23611C] text-base border-t">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Skład:</h4>
                    <p>100% woda kokosowa z młodych, zielonych kokosów z kawałkami orzecha kokosowego.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Wartość odżywcza (na 100ml):</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Energia: 19 kcal / 79 kJ</li>
                      <li>• Białko: 0.7g</li>
                      <li>• Węglowodany: 3.7g</li>
                      <li>• Tłuszcz: 0.2g</li>
                      <li>• Błonnik: 1.1g</li>
                      <li>• Sód: 105mg</li>
                      <li>• Potas: 250mg</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Przechowywanie:</h4>
                    <p>Przechowywać w chłodnym i suchym miejscu. Unikać bezpośredniego nasłonecznienia, wilgoci i wysokich temperatur.</p>
                    <p className="text-sm mt-1">Temperatura przechowywania: 4-25°C</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Data przydatności do spożycia:</h4>
                    <p>12 miesięcy od daty produkcji</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Alergeny:</h4>
                    <p>Produkt może zawierać śladowe ilości orzechów.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Charakterystyka:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Bez dodatku cukru</li>
                      <li>• Bez konserwantów</li>
                      <li>• Produkt naturalny</li>
                      <li>• Nie zawiera GMO</li>
                      <li>• Opakowanie w pełni nadające się do recyklingu</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Info o dostawie */}
          <div className="flex flex-col md:flex-row gap-8 text-[#23611C] text-sm items-center justify-between w-full mt-2">
            <div className="flex items-center gap-2">
              <img src="/icons-svg/local_shipping.svg" alt="dostawa" className="w-7 h-7" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(86deg) brightness(94%) contrast(119%)' }} />
              Darmowa dostawa przy zakupie powyżej 150 zł brutto
            </div>

          </div>
        </div>
      </div>
    </div>
  );
} 