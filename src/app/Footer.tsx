import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-[#181818] text-[#ededed] pt-16 pb-8 px-4 md:px-24 2xl:px-80 mt-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 md:gap-0">
        {/* Lewa kolumna */}
        <div className="flex flex-col items-start gap-6 max-w-md">
          <Image src="/logo.png" alt="Young Coco logo" className="w-24 h-auto mb-2" width={96} height={40} />
          <div className="text-sm md:text-base text-[#ededed]">
            Dołącz do społeczności, która wybiera świadomie.<br />
            Zostań z nami – i z naturą.<br />
            <span className="block mt-2">Instagram <span className="text-[#A1C63A]">@youngcocowater</span></span>
          </div>
        </div>
        {/* Prawa kolumna */}
        <div className="flex flex-col items-end w-full md:w-auto">
          <div className="flex gap-8 mb-8 md:mb-4 text-sm md:text-base">
            <a href="#" className="hover:text-[#A1C63A] transition">Regulamin</a>
            <a href="#" className="hover:text-[#A1C63A] transition">Polityka Prywatności</a>
          </div>
          <div className="flex gap-6 mt-2 text-[#A1C63A]">
            {/* Instagram */}
            <a href="#" aria-label="Instagram" className="hover:opacity-80 transition"><img src="/social-icons/instagram.svg" alt="Instagram" width={28} height={28} /></a>
            {/* Facebook */}
            <a href="#" aria-label="Facebook" className="hover:opacity-80 transition"><img src="/social-icons/facebook.svg" alt="Facebook" width={28} height={28} /></a>
            {/* YouTube */}
            <a href="#" aria-label="YouTube" className="hover:opacity-80 transition"><img src="/social-icons/youtube.svg" alt="YouTube" width={28} height={28} /></a>
            {/* TikTok */}
            <a href="#" aria-label="TikTok" className="hover:opacity-80 transition"><img src="/social-icons/tiktok.svg" alt="TikTok" width={28} height={28} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
} 