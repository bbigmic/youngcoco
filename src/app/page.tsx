"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRef } from "react";

// Hook do animacji wejścia sekcji lub elementu
function useSectionInView(animationClass = "animate-fade-in") {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, animClass: inView ? animationClass : "section-hidden" };
}

export default function Home() {
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      // Parallax: ogranicz do max 300px scrolla
      setParallax(Math.min(window.scrollY, 300));
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroSection = useSectionInView("animate-slide-down");
  const whySection = useSectionInView("animate-slide-up");
  const canSection = useSectionInView("animate-slide-left");
  const ecoSection = useSectionInView("animate-zoom-in");
  const instaSection = useSectionInView("animate-slide-right");
  const contactSection = useSectionInView("animate-fade-in");
  // Dla puszki w hero
  const canHero = useSectionInView("can-fly-down");
  // Dla puszki w sekcji wariantu produktu
  const canVariant = useSectionInView("can-fly-left");

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* MENU */}
      {/* USUWAM kod header/navbar oraz footer */}

      {/* GŁÓWNY UKŁAD HERO */}
      <main ref={heroSection.ref} className={`min-h-screen flex flex-col md:flex-row items-center justify-center pt-0 pb-0 px-8 md:px-24 lg:px-32 xl:px-48 2xl:px-64 gap-8 md:gap-0 w-full relative overflow-hidden ${heroSection.animClass}`}>
        {/* Animowana palma w tle */}
        <div className="absolute left-0 top-0 w-full h-full pointer-events-none select-none">
          <Image src="/cien-palmy1.png" alt="Palma tło" width={800} height={600} className="absolute left-0 top-0 w-auto h-screen md:h-full palm-sway-slow" style={{objectFit: 'contain', objectPosition: 'left top', maxWidth: '60%'}} />
        </div>
        {/* LEWA KOLUMNA */}
        <section className="flex-1 flex flex-col justify-center items-start max-w-xl mt-12 md:pr-12 md:-mt-30 z-1">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 mt-24 leading-tight text-[#131313]">YOUNG COCO</h1>
          <p className="text-lg md:text-xl text-gray-700 mb-6">
            Nie musisz wyjeżdżać, by poczuć tropiki.<br />
            Zamknęliśmy w puszce to, co najlepsze w młodym kokosie – jego czystość, lekkość i naturalną siłę.
          </p>
          <p className="text-[#115E2B] font-semibold text-lg mb-8">Jeden łyk. I jesteś tam.</p>
          <div className="bg-[#115E2B] hover:bg-[#0d4a21] text-white font-bold rounded-[8px] w-[210px] h-[60px] flex items-center justify-center text-[14px] shadow-lg transition-all pl-2 cursor-not-allowed">
            Spróbuj YOUNG COCO
            <span className="ml-3 inline-block align-middle w-[18px] h-[18px] rotate-90">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_2030_3508)">
                  <path d="M6 15L12 9L18 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                  <clipPath id="clip0_2030_3508">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </span>
          </div>
        </section>

        {/* PRAWA KOLUMNA */}
        <section className="flex-1 flex flex-col items-center justify-center relative w-full md:-mt-40">
          {/* Zielone koło */}
          <div className="absolute left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0 md:mr-8 lg:mr-16 top-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full z-0" style={{ background: '#A1C63A' }}></div>
          {/* Puszka */}
          <Image ref={canHero.ref} src="/can.png" alt="Puszka Young Coco" width={260} height={360} className={`relative z-10 drop-shadow-xl ${canHero.animClass}`} priority />
          {/* Dekoracje kokosów - różne kawałki */}
            <Image src="/coconut-piece1.png" alt="Kawałek kokosa" width={254} height={254} className="absolute left-2 md:-left-10 top-20 md:top-90 z-21 coconut-piece" style={{transform: `translateY(${parallax * 0.2}px)`}} />
            <Image src="/coconut-piece2.png" alt="Kawałek kokosa" width={254} height={254} className="absolute right-2 md:right-0 bottom-2 md:-bottom-100 z-21 coconut-piece" style={{transform: `translateY(${parallax * 0.15}px)`}} />
            <Image src="/coconut-piece3.png" alt="Kawałek kokosa" width={128} height={128} className="absolute bottom-4 md:-bottom-36 right-4 md:-right-32 z-21 coconut-piece" style={{transform: `translateY(${parallax * 0.3}px)`}} />
            <Image src="/coconut-piece4.png" alt="Kawałek kokosa" width={96} height={96} className="absolute top-1 md:bottom-0 right-2 md:right-2 z-21 coconut-piece" style={{transform: `translateY(${parallax * 0.25}px)`}} />
            <Image src="/coconut-piece5.png" alt="Kawałek kokosa" width={54} height={54} className="hidden md:block absolute top-4 md:top-20 right-4 md:-right-20 z-21 coconut-piece" style={{transform: `translateY(${parallax * 0.4}px)`}} />
        </section>

        {/* UKOŚNY PASEK Z NAPISEM */}
        <section className="absolute w-screen left-1/2 right-1/2 -translate-x-1/2 bottom-[-100px] md:bottom-[180px] z-20 animated-banner" style={{ height: 80 }}>
          <div
            className="absolute w-[110vw] left-1/2 -translate-x-1/2 flex items-center"
            style={{
              background: '#23611C',
              color: '#A1C63A',
              fontWeight: 800,
              fontSize: 32,
              height: 80,
              transform: 'rotate(-10deg)',
              whiteSpace: 'nowrap',
              overflow: 'hidden !important',
            }}
          >
            <div className="animate-marquee flex px-8">
              <span className="mr-16">
                WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp;
                WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp;
                WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp; WAKE THE COCONUT &nbsp;
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* NOWA SEKCJA: DLACZEGO YOUNG COCO? */}
      <section ref={whySection.ref} className={`relative w-full py-42 md:py-24 px-4 md:px-24 lg:px-32 xl:px-48 2xl:px-64 flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24 ${whySection.animClass}`}>
        {/* Dekoracja palma po prawej */}
        <Image src="/cien-palmy2.png" alt="Palma dekoracja" width={600} height={800} className="hidden md:block pointer-events-none select-none absolute right-0 top-0 h-full w-auto z-10 palm-sway-right" style={{maxHeight: '90%', objectFit: 'contain', maxWidth: '50%'}} />
        {/* Lewa kolumna: tekst i lista */}
        <div className="flex-1 max-w-xl">
          <h2 className="text-2xl md:text-2xl font-bold mb-6 text-[#131313]">Czysty kokos. Nic więcej.</h2>
          <p className="text-base md:text-lg text-[#131313] mb-4">
            To nie jest zwykła woda kokosowa.<br />
            To sok życia, wyjęty prosto z młodych, zielonych kokosów.<br />
            Bez dodatków. Bez udawania. Bez kompromisów.<br />
          </p>
          <p className="text-base md:text-lg text-[#131313] mb-6">
            Naturalnie słodka. Nienaturalnie dobra.
          </p>
          <ul className="mt-8 space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-1"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#A1C63A"/><path d="M6 10.5L9 13.5L14 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              <span className="text-[#131313] text-base md:text-lg">100% natura</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#A1C63A"/><path d="M6 10.5L9 13.5L14 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              <span className="text-[#131313] text-base md:text-lg">Bez konserwantów</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#A1C63A"/><path d="M6 10.5L9 13.5L14 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              <span className="text-[#131313] text-base md:text-lg">Zbierana ręcznie, pakowana z troską</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#A1C63A"/><path d="M6 10.5L9 13.5L14 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              <span className="text-[#131313] text-base md:text-lg">Idealna do nawodnienia, odświeżenia, regeneracji</span>
            </li>
          </ul>
        </div>
        {/* Prawa kolumna: nagłówek i zalety */}
        <div className="flex-1 flex flex-col items-center w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-[#131313] mb-12 text-center">Dlaczego Young Coco?</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full">
            {/* Zaleta 1 */}
            <div className="flex flex-col items-center max-w-xs">
              <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                <Image src="/plate.png" alt="" width={96} height={96} className="absolute left-1/2 top-1/2 w-24 h-24 object-contain -translate-x-1/2 -translate-y-1/2" />
                <Image src="/taste.png" alt="Autentyczny smak" width={96} height={96} className="relative w-24 h-24 object-contain translate-y-6" />
              </div>
              <p className="text-[#131313] text-base md:text-lg font-semibold text-center mt-2">Autentyczny, świeży smak</p>
            </div>
            {/* Zaleta 2 */}
            <div className="flex flex-col items-center max-w-xs">
              <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                <Image src="/plate.png" alt="" width={96} height={96} className="absolute left-1/2 top-1/2 w-24 h-24 object-contain -translate-x-1/2 -translate-y-1/2" />
                <Image src="/no-sugar.png" alt="Alternatywa dla słodzonych" width={96} height={96} className="relative w-24 h-24 object-contain translate-y-6" />
              </div>
              <p className="text-[#131313] text-base md:text-lg font-semibold text-center mt-2">Idealna alternatywa dla sztucznie dosładzanych napojów.</p>
            </div>
            {/* Zaleta 3 */}
            <div className="flex flex-col items-center max-w-xs">
              <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                <Image src="/plate.png" alt="" width={96} height={96} className="absolute left-1/2 top-1/2 w-24 h-24 object-contain -translate-x-1/2 -translate-y-1/2" />
                <Image src="/coconut-icon.png" alt="Najwyższa jakość" width={96} height={96} className="relative w-24 h-24 object-contain translate-y-6" />
              </div>
              <p className="text-[#131313] text-base md:text-lg font-semibold text-center mt-2">Wyjątkowe połączenie najwyższej jakości wody z młodych kokosów</p>
            </div>
          </div>
        </div>
        {/* Dekoracje tła */}
        <Image src="/coconut-piece2.png" alt="dekoracja" width={254} height={254} className="absolute left-0 bottom-10 w-24 opacity-80 coconut-piece" />
        <Image src="/coconut-piece1.png" alt="dekoracja" width={254} height={254} className="absolute right-0 top-10 w-24 opacity-80 coconut-piece" />
      </section>


      {/* SEKCJA: Wariant produktu z puszką i zaletami */}
      <section ref={canSection.ref} className={`relative w-full bg-[#FAFAF6] pt-32 pb-20 px-4 md:px-24 lg:px-32 xl:px-48 2xl:px-64 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 overflow-visible ${canSection.animClass}`} style={{overflow: 'visible'}}>
        {/* Dekoracje tła */}
        <Image src="/coconut-piece3.png" alt="kokos dekoracja" width={112} height={112} className="absolute left-1/4 -top-10 w-20 md:w-28 z-10 coconut-piece" style={{zIndex:2}} />
        <Image src="/duzy-zielony-kokos.png" alt="duży kokos" width={384} height={384} className="hidden md:block absolute right-0 -top-32 w-80 lg:w-96 z-30 coconut-piece" style={{zIndex:30}} />
        <Image src="/coconut-piece4.png" alt="kokos dekoracja" width={112} height={112} className="absolute right-10 bottom-0 w-20 md:w-28 z-10 coconut-piece" style={{zIndex:2}} />

        {/* Lewa kolumna: puszka na tle zielonego koła */}
        <div className="relative flex-1 flex items-center justify-center min-w-[320px] max-w-md">
          <div className="absolute left-[-400px] lg:left-[-500px] xl:left-[-600px] top-2/3 -translate-y-1/2 w-[800px] lg:w-[900px] xl:w-[1000px] h-[340px] bg-[#A1C63A] rounded-[130px] -z-10" style={{zIndex:0}}></div>
          <Image ref={canVariant.ref} src="/can.png" alt="Puszka Young Coco" width={320} height={440} className={`w-64 md:w-80 z-10 drop-shadow-2xl ${canVariant.animClass}`} style={{zIndex:2}} />
          {/* Strzałka dekoracyjna */}
          <div className="z-40">
            <ArrowAnimated />
          </div>
        </div>

        {/* Prawa kolumna: zakładki, zalety, przycisk */}
        <div className="flex-1 flex flex-col items-start max-w-2xl w-full z-20">
          {/* Zakładki */}
          <div className="flex gap-4 mb-8 flex-wrap">
            <button className="px-7 py-2 rounded-full bg-[#A1C63A] text-[#115E2B] font-semibold text-lg shadow-sm border-2 border-[#A1C63A] focus:outline-none">Young Coco</button>
            <button className="hidden px-7 py-2 rounded-full bg-white text-[#23611C] font-semibold text-lg border-2 border-[#A1C63A] hover:bg-[#F3F7E7] transition focus:outline-none">Ewentualny kolejny smak</button>
            <button className="hidden px-7 py-2 rounded-full bg-white text-[#23611C] font-semibold text-lg border-2 border-[#A1C63A] hover:bg-[#F3F7E7] transition focus:outline-none">Ewentualny kolejny smak</button>
          </div>
          {/* Zalety w dwóch kolumnach */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 w-full mb-8">
            <div>
              <h3 className="text-[#23611C] text-xl font-bold mb-2">Super nawadnianie</h3>
              <p className="text-[#23611C] text-base">orzeźwiający, bogaty w elektrolity, idealny po treningu lub na upalne dni</p>
            </div>
            <div>
              <h3 className="text-[#23611C] text-xl font-bold mb-2">Lepszy smak</h3>
              <p className="text-[#23611C] text-base">naturalna słodycz kokosa, bez sztucznych dodatków.</p>
            </div>
            <div>
              <h3 className="text-[#23611C] text-xl font-bold mb-2">Prawdziwy orzech kokosowy</h3>
              <p className="text-[#23611C] text-base">delikatny, miękki kawałek orzecha w każdej puszce.</p>
            </div>
            <div>
              <h3 className="text-[#23611C] text-xl font-bold mb-2">100% naturalny</h3>
              <p className="text-[#23611C] text-base">bez konserwantów, barwników i dodatku cukru.</p>
            </div>
          </div>
          {/* Przycisk */}
          {/* <Link href="/product" className="bg-[#115E2B] hover:bg-[#0d4a21] text-white font-bold rounded-[8px] w-[210px] h-[60px] flex items-center justify-center text-[14px] shadow-lg transition-all pl-2 mt-2">
            Kup teraz
            <span className="ml-3 inline-block align-middle w-[18px] h-[18px] text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 18c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm10 0c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zM7.16 16l.94-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 5H6.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12z" fill="currentColor"/>
              </svg>
            </span>
          </Link> */}
        </div>
      </section>
      
            {/* SEKCJA: Nowoczesna świadomość */}
            <section ref={ecoSection.ref} className={`w-full flex flex-col md:flex-row items-center justify-between py-16 md:py-20 px-4 md:px-24 lg:px-32 xl:px-48 2xl:px-64 gap-8 md:gap-16 ${ecoSection.animClass}`}>
        {/* Lewa kolumna: tekst */}
        <div className="flex-1 max-w-lg">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#131313] mb-3 md:mb-4">Od plantacji po Twój łyk – historia czystej świeżości</h2>
          <p className="text-sm md:text-base text-[#131313] mb-3 leading-relaxed">
            Wszystko zaczyna się tam, gdzie słońce całuje liście palm – na certyfikowanych, zrównoważonych plantacjach, gdzie każdy kokos rośnie w harmonii z naturą. Bez pestycydów, bez rabunku środowiska – tylko czysta, odpowiedzialna uprawa.
          </p>
          <p className="text-sm md:text-base text-[#131313] mb-3 leading-relaxed">
            Następnie – delikatny proces przetwarzania, który pozwala zachować naturalny smak i wartości odżywcze. Zero zbędnych dodatków, zero kompromisów.
          </p>
          <p className="text-sm md:text-base text-[#131313] mb-3 leading-relaxed">
            Wreszcie – puszka. Lekka, praktyczna i w 100% nadająca się do recyklingu. Wykonana w 68–75% z aluminium wtórnego, które – w porównaniu z produkcją z surowca pierwotnego – pozwala zaoszczędzić aż 95% energii.
          </p>
          <p className="text-sm md:text-base font-semibold text-[#23611C] mt-4">
            To nie tylko opakowanie – to świadomy wybór. Każda puszka to krok ku czystszej planecie.
          </p>
        </div>
        {/* Prawa kolumna: zdjęcie */}
        <div className="flex-1 flex items-center justify-end w-full max-w-2xl">
          <Image src="/underwater.jpg" alt="Zanieczyszczona woda" width={500} height={400} className="w-[500px] max-w-none h-[400px] object-cover rounded-lg" />
        </div>
      </section>

      {/* SEKCJA: Każda puszka to krok ku czystszej planecie */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between py-16 md:py-20 px-4 md:px-24 lg:px-32 xl:px-48 2xl:px-64 gap-8 md:gap-16">
        {/* Lewa kolumna: zdjęcie */}
        <div className="flex-1 flex items-center justify-start w-full max-w-2xl">
          <Image src="/earth-hands.jpg" alt="Ręce trzymające globus z liśćmi" width={500} height={400} className="w-[500px] max-w-none h-[400px] object-cover rounded-lg" />
        </div>
        {/* Prawa kolumna: tekst */}
        <div className="flex-1 max-w-lg">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#131313] mb-3 md:mb-4">Każda puszka to krok ku czystszej planecie.</h2>
          <p className="text-sm md:text-base text-[#131313] mb-3 leading-relaxed">
            Od A do Z – nasz produkt jest neutralny ekologicznie. Bo wierzymy, że orzeźwienie może być nie tylko smaczne, ale i odpowiedzialne. 🌿
          </p>
          <p className="text-sm md:text-base text-[#131313] mb-3 leading-relaxed">
            Otwierając naszą puszkę, czujesz świeżość tropiku i spokój sumienia. Bo wiemy, że dobre wybory zaczynają się od prostych gestów. Jak jeden łyk kokosowej równowagi.
          </p>
        </div>
      </section>

      {/* SEKCJA: Instagram / Co u Nas? */}
      <section ref={instaSection.ref} className={`w-full py-24 px-4 md:px-24 lg:px-32 xl:px-48 2xl:px-64 ${instaSection.animClass}`}>
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-[#131313]">Co u Nas?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {/* Post 1 */}
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-xs shadow-sm flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Young Coco logo" width={28} height={28} className="w-7 h-7 object-contain" />
                <span className="font-semibold text-[#131313] text-lg">Young Coco</span>
              </div>
              <span className="text-gray-400 text-2xl font-bold">&#8230;</span>
            </div>
            <Image src="/insta1.jpg" alt="Post 1" width={320} height={320} className="w-full aspect-square object-cover rounded-b-xl" />
          </div>
          {/* Post 2 */}
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-xs shadow-sm flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Young Coco logo" width={28} height={28} className="w-7 h-7 object-contain" />
                <span className="font-semibold text-[#131313] text-lg">Young Coco</span>
              </div>
              <span className="text-gray-400 text-2xl font-bold">&#8230;</span>
            </div>
            <Image src="/insta2.jpg" alt="Post 2" width={320} height={320} className="w-full aspect-square object-cover rounded-b-xl" />
          </div>
          {/* Post 3 */}
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-xs shadow-sm flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Young Coco logo" width={28} height={28} className="w-7 h-7 object-contain" />
                <span className="font-semibold text-[#131313] text-lg">Young Coco</span>
              </div>
              <span className="text-gray-400 text-2xl font-bold">&#8230;</span>
            </div>
            <Image src="/insta3.jpg" alt="Post 3" width={320} height={320} className="w-full aspect-square object-cover rounded-b-xl" />
          </div>
          {/* Post 4 */}
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-xs shadow-sm flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Young Coco logo" width={28} height={28} className="w-7 h-7 object-contain" />
                <span className="font-semibold text-[#131313] text-lg">Young Coco</span>
              </div>
              <span className="text-gray-400 text-2xl font-bold">&#8230;</span>
            </div>
            <Image src="/insta4.jpg" alt="Post 4" width={320} height={320} className="w-full aspect-square object-cover rounded-b-xl" />
          </div>
        </div>
      </section>

      {/* SEKCJA: Kontakt */}
      <section id="kontakt" ref={contactSection.ref} className={`w-full bg-[#181818] text-[#ededed] py-12 px-4 md:px-24 lg:px-32 xl:px-48 2xl:px-64 flex flex-col md:flex-row items-center justify-between gap-16 md:gap-24 ${contactSection.animClass}`}>
        {/* Lewa kolumna: tekst */}
        <div className="flex-1 max-w-xl mb-12 md:mb-0">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#ededed]">Masz Pytania?</h2>
          <p className="text-lg text-[#ededed] mb-8">Masz pytania dotyczące naszej wody kokosowej? Chcesz nawiązać współpracę? Napisz do nas! Odpowiemy na wszystkie Twoje pytania.</p>
        </div>
        {/* Prawa kolumna: formularz */}
        <form className="flex-1 max-w-xl flex flex-col gap-6 w-full">
          <input type="text" placeholder="Imię i Nazwisko *" className="bg-[#232323] border border-[#ededed] rounded-lg px-6 py-4 text-[#ededed] placeholder-[#aaa] focus:outline-none focus:border-[#A1C63A] transition" required />
          <input type="text" placeholder="Nazwa Firmy" className="bg-[#232323] border border-[#ededed] rounded-lg px-6 py-4 text-[#ededed] placeholder-[#aaa] focus:outline-none focus:border-[#A1C63A] transition" />
          <input type="email" placeholder="Email *" className="bg-[#232323] border border-[#ededed] rounded-lg px-6 py-4 text-[#ededed] placeholder-[#aaa] focus:outline-none focus:border-[#A1C63A] transition" required />
          <textarea placeholder="Wiadomość" rows={5} className="bg-[#232323] border border-[#ededed] rounded-lg px-6 py-4 text-[#ededed] placeholder-[#aaa] focus:outline-none focus:border-[#A1C63A] transition resize-none" />
          <div className="flex justify-end">
            <button type="submit" className="bg-[#A1C63A] text-[#181818] font-semibold px-10 py-3 rounded-lg shadow-md hover:bg-[#b6e04a] transition flex items-center gap-2">
              Wyślij
              <span className="ml-2 w-[18px] h-[18px] inline-block rotate-90">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_2030_3508)">
                    <path d="M6 15L12 9L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_2030_3508">
                      <rect width="24" height="24" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </span>
            </button>
          </div>
        </form>
      </section>

      {/* STOPKA */}
      {/* USUWAM kod header/navbar oraz footer */}

    </div>
  );
}

// Komponent animowanej strzałki
function ArrowAnimated() {
  const [showTips, setShowTips] = useState(false);
  const [startAnim, setStartAnim] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartAnim(true);
          setTimeout(() => setShowTips(true), 1200);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={`absolute z-20 animate-draw-arrow${startAnim ? '' : ' no-anim'}
        md:left-2/3 md:top-1/2 md:-translate-y-1/2 md:rotate-0 md:block
        left-3/5 bottom-[-100px] top-auto -translate-x-1/2 translate-y-0 rotate-150 block md:bottom-auto md:translate-x-0
      `}
      width="220"
      height="110"
      viewBox="0 0 220 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path className="arrow-main" d="M30 70 Q120 10 110 50 Q100 90 170 60" stroke="#23611C" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path className="arrow-tip" style={{opacity: showTips ? 1 : 0, transition: 'opacity 0.5s'}} d="M170 60 l-16 -10" stroke="#23611C" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path className="arrow-tip" style={{opacity: showTips ? 1 : 0, transition: 'opacity 0.5s'}} d="M170 60 l-8 18" stroke="#23611C" strokeWidth="4" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
