import { useState, useRef, useEffect } from 'react';

interface CountryPhoneInputProps {
    value: string;
    onChange: (fullNumber: string) => void;
    required?: boolean;
    label?: string;
    placeholder?: string;
    className?: string;
}

const COUNTRIES = [
    { code: '+55', flag: '🇧🇷', name: 'Brasil' },
    { code: '+351', flag: '🇵🇹', name: 'Portugal' },
    { code: '+34', flag: '🇪🇸', name: 'Espanha' },
    { code: '+1', flag: '🇺🇸', name: 'Estados Unidos' },
    { code: '+43', flag: '🇦🇹', name: 'Áustria' },
    { code: '+44', flag: '🇬🇧', name: 'Reino Unido' },
    { code: '+33', flag: '🇫🇷', name: 'França' },
    { code: '+49', flag: '🇩🇪', name: 'Alemanha' },
    { code: '+39', flag: '🇮🇹', name: 'Itália' },
    { code: '+81', flag: '🇯🇵', name: 'Japão' },
    { code: '+86', flag: '🇨🇳', name: 'China' },
    { code: '+971', flag: '🇦🇪', name: 'Emirados Árabes' },
    { code: '+52', flag: '🇲🇽', name: 'México' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina' },
    { code: '+56', flag: '🇨🇱', name: 'Chile' },
    { code: '+57', flag: '🇨🇴', name: 'Colômbia' },
    { code: '+51', flag: '🇵🇪', name: 'Peru' },
    { code: '+41', flag: '🇨🇭', name: 'Suíça' },
    { code: '+31', flag: '🇳🇱', name: 'Holanda' },
    { code: '+61', flag: '🇦🇺', name: 'Austrália' },
    { code: '+82', flag: '🇰🇷', name: 'Coreia do Sul' },
    { code: '+91', flag: '🇮🇳', name: 'Índia' },
    { code: '+27', flag: '🇿🇦', name: 'África do Sul' },
    { code: '+234', flag: '🇳🇬', name: 'Nigéria' },
    { code: '+20', flag: '🇪🇬', name: 'Egito' },
    { code: '+7', flag: '🇷🇺', name: 'Rússia' },
    { code: '+90', flag: '🇹🇷', name: 'Turquia' },
    { code: '+48', flag: '🇵🇱', name: 'Polônia' },
    { code: '+46', flag: '🇸🇪', name: 'Suécia' },
    { code: '+47', flag: '🇳🇴', name: 'Noruega' },
];

export default function CountryPhoneInput({
    value,
    onChange,
    required = false,
    label = 'WhatsApp',
    className = '',
}: CountryPhoneInputProps) {
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [phone, setPhone] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Parse initial value if provided
    useEffect(() => {
        if (value) {
            const match = COUNTRIES.find(c => value.startsWith(c.code));
            if (match) {
                setSelectedCountry(match);
                setPhone(value.slice(match.code.length).trim());
            } else {
                setPhone(value);
            }
        }
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handlePhoneChange = (newPhone: string) => {
        setPhone(newPhone);
        onChange(`${selectedCountry.code} ${newPhone}`);
    };

    const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
        setSelectedCountry(country);
        setDropdownOpen(false);
        onChange(`${country.code} ${phone}`);
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
                    {label} {!required && <span className="text-white/20 ml-2">(opcional)</span>}
                </label>
            )}
            <div className="flex gap-0 relative">
                {/* Country Selector */}
                <div ref={dropdownRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-1.5 bg-black border border-white/10 border-r-0 px-3 py-4 rounded-l text-sm text-white hover:bg-white/5 transition-colors h-full min-w-[90px] justify-center"
                    >
                        <span className="text-base leading-none">{selectedCountry.flag}</span>
                        <span className="text-white/60 text-xs font-bold">{selectedCountry.code}</span>
                        <svg
                            className={`w-3 h-3 text-white/30 flex-shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl z-50 custom-scrollbar">
                            {COUNTRIES.map((country) => (
                                <button
                                    key={country.code + country.name}
                                    type="button"
                                    onClick={() => handleCountrySelect(country)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${selectedCountry.code === country.code ? 'bg-accent-gold/10 border-l-2 border-accent-gold' : ''
                                        }`}
                                >
                                    <span className="text-lg">{country.flag}</span>
                                    <span className="text-xs font-bold text-white/70 flex-1">{country.name}</span>
                                    <span className="text-xs font-bold text-white/40">{country.code}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Phone Input */}
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required={required}
                    className="flex-1 bg-black border border-white/10 px-5 py-4 text-sm text-white focus:outline-none focus:border-accent-gold/50 transition-all rounded-r"
                />
            </div>
        </div>
    );
}
