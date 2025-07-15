"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../CartContext";

export default function CustomerFormPage() {
  const router = useRouter();
  const { setCustomer, item } = useCart();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    tel: "",
    street: "",
    house: "",
    zip: "",
    city: "",
    invoice: false,
    company: "",
    nip: "",
    invoiceStreet: "",
    invoiceHouse: "",
    invoiceZip: "",
    invoiceCity: "",
    consent1: false,
    consent2: false,
  });
  const [errors, setErrors] = useState<{[k:string]: string}>({});

  function validate() {
    const e: {[k:string]: string} = {};
    if (!form.firstName) e.firstName = "Imię jest wymagane";
    if (!form.lastName) e.lastName = "Nazwisko jest wymagane";
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Poprawny email jest wymagany";
    if (!form.tel || !/^\+?\d{7,}$/.test(form.tel)) e.tel = "Telefon jest wymagany";
    if (!form.street) e.street = "Ulica jest wymagana";
    if (!form.house) e.house = "Nr domu jest wymagany";
    if (!form.zip) e.zip = "Kod pocztowy jest wymagany";
    if (!form.city) e.city = "Miasto jest wymagane";
    if (!form.consent1) e.consent1 = "Zgoda na regulamin jest wymagana";
    if (form.invoice) {
      if (!form.company) e.company = "Nazwa firmy jest wymagana";
      if (!form.nip) e.nip = "NIP jest wymagany";
      if (!form.invoiceStreet) e.invoiceStreet = "Ulica jest wymagana";
      if (!form.invoiceHouse) e.invoiceHouse = "Nr domu jest wymagany";
      if (!form.invoiceZip) e.invoiceZip = "Kod pocztowy jest wymagany";
      if (!form.invoiceCity) e.invoiceCity = "Miasto jest wymagane";
    }
    return e;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length === 0) {
      console.log('Saving customer data:', form);
      setCustomer(form);
      router.push("/order/summary");
    }
  }

  // PODSUMOWANIE KOSZYKA
  let summary = null;
  if (item) {
    const PRICES = { 24: 105.36, 12: 55.08 };
    const DELIVERY_COST = 13.99; // domyślnie jak w koszyku
    const variant = item.variant as 24 | 12;
    const netto = Math.round(PRICES[variant] * item.quantity * 100) / 100;
    const brutto = netto;
    const deliveryCost = brutto >= 200 ? 0 : DELIVERY_COST;
    const total = Math.round((brutto + deliveryCost) * 100) / 100;
    summary = (
      <>
        <div className="flex justify-between mb-2 text-[#171717]">
          <span>Wartość netto</span>
          <span className="font-semibold">{netto.toFixed(2)} zł</span>
        </div>
        <div className="flex justify-between mb-2 text-[#171717]">
          <span>Wartość brutto</span>
          <span className="font-semibold">{brutto.toFixed(2)} zł</span>
        </div>
        <div className="flex justify-between mb-2 text-[#171717]">
          <span>Koszt dostawy</span>
          <span className="font-semibold">{deliveryCost.toFixed(2)} zł</span>
        </div>
        <hr className="my-2 border-[#E6F7C7]" />
        <div className="flex justify-between text-lg font-bold">
          <span>Razem</span>
          <span>{total.toFixed(2)} zł</span>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full pt-32 py-16 px-4">
      <div className="mb-10">
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#23611C] text-white flex items-center justify-center font-bold text-sm md:text-base">1</div>
            <span className="font-semibold text-sm md:text-base">Twoje zamówienie</span>
          </div>
          <div className="h-0.5 w-4 md:w-8 bg-[#23611C] hidden sm:block"></div>
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#23611C] text-white flex items-center justify-center font-bold text-sm md:text-base">2</div>
            <span className="font-semibold text-sm md:text-base">Dane klienta</span>
          </div>
          <div className="h-0.5 w-4 md:w-8 bg-[#BDBDBD] hidden sm:block"></div>
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#BDBDBD] text-white flex items-center justify-center font-bold text-sm md:text-base">3</div>
            <span className="font-semibold text-[#BDBDBD] text-sm md:text-base">Podsumowanie</span>
          </div>
          <div className="h-0.5 w-4 md:w-8 bg-[#BDBDBD] hidden sm:block"></div>
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#BDBDBD] text-white flex items-center justify-center font-bold text-sm md:text-base">4</div>
            <span className="font-semibold text-[#BDBDBD] text-sm md:text-base">Potwierdzenie</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-8">Dane klienta</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-12">
        <form className="flex-1" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-8">Dane Osobowe</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Imię" className="w-full border rounded-lg px-4 py-3" />
            {errors.firstName && <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>}
          </div>
          <div>
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Nazwisko" className="w-full border rounded-lg px-4 py-3" />
            {errors.lastName && <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>}
          </div>
          <div>
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border rounded-lg px-4 py-3" />
            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
          </div>
          <div>
            <input name="tel" value={form.tel} onChange={handleChange} placeholder="Tel" className="w-full border rounded-lg px-4 py-3" />
            {errors.tel && <div className="text-red-500 text-xs mt-1">{errors.tel}</div>}
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4 mt-8">Adres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <input name="street" value={form.street} onChange={handleChange} placeholder="Ulica" className="w-full border rounded-lg px-4 py-3" />
            {errors.street && <div className="text-red-500 text-xs mt-1">{errors.street}</div>}
          </div>
          <div>
            <input name="house" value={form.house} onChange={handleChange} placeholder="Nr Domu" className="w-full border rounded-lg px-4 py-3" />
            {errors.house && <div className="text-red-500 text-xs mt-1">{errors.house}</div>}
          </div>
          <div>
            <input name="zip" value={form.zip} onChange={handleChange} placeholder="Kod Pocztowy" className="w-full border rounded-lg px-4 py-3" />
            {errors.zip && <div className="text-red-500 text-xs mt-1">{errors.zip}</div>}
          </div>
          <div>
            <input name="city" value={form.city} onChange={handleChange} placeholder="Miasto" className="w-full border rounded-lg px-4 py-3" />
            {errors.city && <div className="text-red-500 text-xs mt-1">{errors.city}</div>}
          </div>
        </div>
        <div className="flex items-center mb-4">
          <input type="checkbox" name="invoice" checked={form.invoice} onChange={handleChange} className="mr-2 w-5 h-5 accent-[#A1C63A]" id="invoiceCheck" />
          <label htmlFor="invoiceCheck" className="text-[#23611C] font-semibold">Chcę otrzymać fakturę</label>
        </div>
        {form.invoice && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <input name="company" value={form.company} onChange={handleChange} placeholder="Nazwa Firmy" className="w-full border rounded-lg px-4 py-3" />
              {errors.company && <div className="text-red-500 text-xs mt-1">{errors.company}</div>}
            </div>
            <div>
              <input name="nip" value={form.nip} onChange={handleChange} placeholder="NIP" className="w-full border rounded-lg px-4 py-3" />
              {errors.nip && <div className="text-red-500 text-xs mt-1">{errors.nip}</div>}
            </div>
            <div>
              <input name="invoiceStreet" value={form.invoiceStreet} onChange={handleChange} placeholder="Ulica" className="w-full border rounded-lg px-4 py-3" />
              {errors.invoiceStreet && <div className="text-red-500 text-xs mt-1">{errors.invoiceStreet}</div>}
            </div>
            <div>
              <input name="invoiceHouse" value={form.invoiceHouse} onChange={handleChange} placeholder="Nr Domu" className="w-full border rounded-lg px-4 py-3" />
              {errors.invoiceHouse && <div className="text-red-500 text-xs mt-1">{errors.invoiceHouse}</div>}
            </div>
            <div>
              <input name="invoiceZip" value={form.invoiceZip} onChange={handleChange} placeholder="Kod Pocztowy" className="w-full border rounded-lg px-4 py-3" />
              {errors.invoiceZip && <div className="text-red-500 text-xs mt-1">{errors.invoiceZip}</div>}
            </div>
            <div>
              <input name="invoiceCity" value={form.invoiceCity} onChange={handleChange} placeholder="Miasto" className="w-full border rounded-lg px-4 py-3" />
              {errors.invoiceCity && <div className="text-red-500 text-xs mt-1">{errors.invoiceCity}</div>}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3 mb-8 mt-8">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="consent1" checked={form.consent1} onChange={handleChange} className="w-5 h-5 accent-[#A1C63A]" />
            <span>Lorem ipsum dolor sit amet, regulamin, polityka prywatności itd.</span>
          </label>
          {errors.consent1 && <div className="text-red-500 text-xs mt-1">{errors.consent1}</div>}
          <label className="flex items-center gap-2">
            <input type="checkbox" name="consent2" checked={form.consent2} onChange={handleChange} className="w-5 h-5 accent-[#A1C63A]" />
            <span>Lorem ipsum dolor sit amet, zgoda marketingowa itd.</span>
          </label>
        </div>
        <button type="submit" className="w-full bg-[#23611C] text-white rounded py-3 font-semibold text-base">Przejdź dalej</button>
      </form>
      {/* Podsumowanie z prawej */}
      <div className="w-full md:w-80 bg-white border border-[#E6F7C7] rounded-xl p-6 h-fit">
        <div className="font-semibold text-lg mb-4">Podsumowanie</div>
        {summary}
        <button className="w-full border border-[#23611C] text-[#23611C] rounded mt-3 py-3 font-semibold text-base bg-white" onClick={() => router.push('/order/cart')}>
          Wróć do szczegółów zamówienia
        </button>
      </div>
      </div>
    </div>
  );
} 