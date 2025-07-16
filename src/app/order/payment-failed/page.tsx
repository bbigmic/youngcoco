"use client";
import { useRouter } from "next/navigation";
import { useCart } from "../../CartContext";

export default function PaymentFailedPage() {
  const router = useRouter();
  const { item } = useCart();

  return (
    <div className="max-w-4xl mx-auto w-full pt-32 py-16 px-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Płatność nie została zrealizowana</h1>
          <p className="text-lg text-gray-600 mb-8">
            Niestety, płatność nie została przetworzona. Twoje zamówienie nie zostało zrealizowane.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Możliwe przyczyny:</h2>
          <ul className="text-left text-red-700 space-y-2">
            <li>• Nieprawidłowe dane karty kredytowej</li>
            <li>• Niewystarczające środki na koncie</li>
            <li>• Karta została zablokowana przez bank</li>
            <li>• Problem techniczny z systemem płatności</li>
          </ul>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => router.push('/order/summary')} 
            className="bg-[#23611C] text-white rounded px-8 py-3 font-semibold text-base hover:bg-[#115E2B] transition-colors"
          >
            Spróbuj ponownie
          </button>
          <button 
            onClick={() => router.push('/order/cart')} 
            className="block mx-auto border border-[#23611C] text-[#23611C] rounded px-8 py-3 font-semibold text-base bg-white hover:bg-[#F8FFF2] transition-colors"
          >
            Wróć do koszyka
          </button>
          <button 
            onClick={() => router.push('/product')} 
            className="block mx-auto text-[#23611C] font-semibold text-base hover:underline"
          >
            Wróć do produktu
          </button>
        </div>

        {item && (
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Twoje zamówienie:</h3>
            <div className="text-left">
              <p><strong>Produkt:</strong> Young COCO woda kokosowa {item.variant} sztuk</p>
              <p><strong>Ilość:</strong> {item.quantity} zestaw(ów)</p>
              <p><strong>Wartość:</strong> {(PRICES[item.variant as 240 | 96 | 24 | 12] * item.quantity).toFixed(2)} zł</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const PRICES = {
  240: 1053.60,
  96: 421.44,
  24: 105.36,
  12: 55.08,
}; 