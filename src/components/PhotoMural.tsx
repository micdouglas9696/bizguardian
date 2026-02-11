import { useState, useEffect, useRef } from 'react';

const PHOTO_IDS = [
    "19TAgWmgA6RukgFIEN2AihEO9UvI4X1vS", "1PqVANkS047ti6WviKrMqUtDP7sJRg_vT", "1hcFZh114K7hVDVY3mD06MrXPZhzqwG9N",
    "1gXB_ESWiOF4lidUWuRJwn9v3BSkGdiu0", "1d7lzJ6AQ3KSqE5q-LT47Z3K29POR2HLB", "1fDIiPPUA3wW35y1QPJFJPbzX9UtDqk14",
    "1Y0y9jP8rNjK093sPJ1J7f4WcBRHHxZx-", "1Bgs3XltRlPHCtzVAUVkn_rTFfs93f5Fk", "18GJjO2tZoie_qAVrDsD7Sq-Os2wOABsd",
    "1fWn4JCr4elGzurfjEhBmLjn34suI433q", "1BktuNtIXcQUqeH4iK-8BNt6ehltDRRUe", "1zyfPI6d_pOKp7NTfKtr27f3RZZeFs9nT",
    "19ApaNZguHe5YjZp8KtbBIXEJVDB83TCd", "1w5mtye1BCU4QHavWHXvreuOryf4wxOoI", "1vayJKq4xtdX2x_gFJBhlqUpo8iV_hnor",
    "1n1jeYyu79_YbK8ci2zNga004enzUxV__", "1bRQRJyGFEtIHJHFWuYOxz3RjusDyVTGA", "1HKLnEo05ofu4vQ4pDC2X2VScbth6GqKu",
    "1kj1wxppudwRerM8JEFmEz5fz0_w2whno", "19w4ebSjrqWd4E7Cju5sD7IKXBcMuv_Hf", "1e_9OGV_SveEysrq0R_bD0lbOj_5PVY2g",
    "1KgA4AhEuhtCQYbOUjTW4ATxJPmp8Meye", "12PfWYYYxSOYfxAyl7gLY3VmWWyCE3v5o", "15n-vPJsNyXlAXi7hKr_cAuLRrmPB3j8i",
    "1It8zQ2zN0AC0c_FXbszFCBCcSzWFcoag", "1C-5jNGlpyw5W1iEiGDDYi63QTXQupoVW", "1xL0vNmulgBkY6qwpBRLSLp_i_stgIX2j",
    "1LSl0VjImaxpof0cktcqIams-mhBdSGri", "19kdWhWZe7KxIK7-R7qc7DhAlbh4gC747", "19RnPzeT8Jp9ud_APjytmqeMTAIGh6ULF",
    "1RxJz3nW3jGXCv0fyMiwy8RfgG5LQmByj", "11EJQ_joZRVhX0c4SCHWEpta6wB8_Vy25", "1efsBEesdE7lDKBvIG7Jv5v0-91tgJ5cf",
    "1ccBiOdBk5SCrdr438OJ7hT1mIbNBRXnd", "1znX-a6Xh5agUq3Eo0rE_vFPHOjV2RYUB", "1E8pUS5H-nqc8Hdn0Rk4zUz8TjoMWTYhd",
    "1D7bc5zwfKM9AbAeo0aolgRQGcOBfVdht", "1WONYxYreurSi_7YAs0tJacZ1v-OpM7Af", "1bD1VQ1OJ8r_6-RbZKTCnahnmHsqA3gRS",
    "1nSqOJs9Aw_lknD0t5fP9rEoXYlwt3ami", "17kXNlGxw56DrGk_6gRVuWeCt7hg715e7", "1LY3hxiMIAos0wtesojp55ALzqu_eGOqy",
    "1H63Un2DWgmPqRaRum6owgIuT9RJ-UaqT", "1ABAmTWcFiyq-y3sbBUwMNTgx0DyNk0A2", "11vx2LL5C2UD8I-T-XaJoWVayfedEmW2R",
    "1JdcmYLgRKxw97jB3bpE8z5JJczUMaG-0", "1JL-AlMYldHa3o6xEU_Zi5-D90cxtKyv4", "1z-4-KLUrR1dJnkrzW0tYwklzVitIaaJT",
    "1P1Y2n6kn2usuBO-d1oauRw-Uq31hk89y", "15-49lLaiVHlbQ2WMa5SRhJCJDsr30J0B", "1GJFbyci7BUWKrlmV4SSBMEK5dSkFslKm",
    "1b4JlGfZshYozdmshRgexNJ5HvusAfGZo", "1FqiuktoMKoN0G8iuA9eSU7fveD9BE5gK", "1Bw0ki_CQvQktpiDi6OKINkSD33-ZLTZW",
    "15ZcZvHdPPtHJfR1wXncQaH1YAzsaWRDt", "1OJjamRmV6T3vDZOMBXUboxhawFFjRBys", "1zAhaoyhTS4F7UGaPamtdR6YkzBLik7BM",
    "1pCZeoYdjppBRuqMxZROBTJg7bcXw3ZMI", "1A37bOZIbYuB_N2XruK1vMBJEiFsHSdSQ", "1dt_W4G80L6H9A3hs0MBGzMwooJlYsPhX",
    "1czvJW9aTTglnzmb3MTlW1AL7m28EXzke", "1euAYa-2Wt7d1cuJi1N_np6Z7FW_MtRyl", "1r7K1qpyHFJfvaF7ZyXK0qv_muTFbRpIq",
    "1W5L58fLFNwYwcxopsCuvBpOjUvHHDDoJ", "1ecSBD2wN3SoiGFZ3PXYbUhP1R6CC2FO1", "18DvpKpwxTqynlgu1bLs7X91fy-olV2_m",
    "1oWSyln0TtBSWp4Pk33QNsFlRHtskXJUv", "1o_YIL5Tsmq_qKiOOMLUbnSj3rNWCpGdl", "1YMG7M0nUpmc5ujI2QdXUpaoSvqS9MDhA",
    "1SEjNePHXWqZTZaC6Q0r4UyIOHjtdA_Ns", "1Q0HxtWL7DF1F9GULOHTcrZTCz2XrPY7E", "1dHh21WQ5WKS1vHJXN81HWwnWzUT-WaOO",
    "1UWUS0DzjKJLNjUAz-gfxzz5MAJSCzW72", "1SYkX0yjf--tgODZjHthJWWCvb8kyeMwL", "1Gxwm9exYYfll6T4Rw8f2DpZgLnY_w354",
    "1etKPbqsramnhMu3HbFDnhbeTMGXnuu5q", "1iIioeAr682Mvv7EnNorbl469JnxiLgmX", "1OVEGC0CJIpUTGChjyd__LzVUgtVYi1D_",
    "1GR28m_KJEufJj6pjZ2PrKurGBZsSduGn", "1HBYLYpSDjXd4_iuNcmP8ynKgokwnXhOB", "1yYoo0Zcmganr6omYoMTIeI3a6fqlL-Z_",
    "1omt0qrlLCXN3j1XN7K0bWgTDRhvjyb-F", "1VF3GU3k30wHeWs1-IU0vFOzqRE2Z7F2S", "1HfA3kSVkYrF8M6UlyAf4YfBqEWcxhhFH",
    "11NOnbsU-DlK0tCZZ2CCsGzuCL3lLlDQm", "10ioCHcuG2E1OylycdbM2KOFMXCy7M_iu", "1AXLLmvBSKGiG3ivOCWIOimsUuedU9-Y7",
    "1nFc5eWiApl4xWduD0UjygO5SeAmVO4nM", "1tIf0IfH8sNG24kk3N-vJUq78XFwk7twc", "1cjll5karfzwHhu3GgrH69v6x8EXkUouQ",
    "1UzDuM5SvKlqA0ng_sMLitS8F3UBF3XFT", "18CPo4RI_rCeut2nQ6qzSm5csgnbc1DOk", "16_KnxTCtzf3end_nKYLgtef5VrbVu6cq",
    "1Y9qejdHqv_SsvRxfX2PVjecXCusPeK1A", "1oPp7WsFZ05NqDfDxMyztzPodU7te7n2w", "1U95GVG24wAJo2kjxdTrF896u4QMd9uyT",
    "1JEZUIq3zj679x5VzG2cVraSjxX_jnQk4", "1usJmmBbz4uQCpgJGELzXXQncxR0rx4PC", "1f6rV1NthDpalED8aY24EKWp9jWRiNa9t",
];

const getThumbnailUrl = (id: string, size = 220) =>
    `https://lh3.googleusercontent.com/d/${id}=w${size}-h${size}-c`;

function LazyImage({ id, index }: { id: string; index: number }) {
    const [loaded, setLoaded] = useState(false);
    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
            { rootMargin: '200px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="relative aspect-square overflow-hidden group bg-zinc-900/80">
            {inView && (
                <img
                    src={getThumbnailUrl(id)}
                    alt={`Memória ${index + 1}`}
                    className={`w-full h-full object-cover grayscale brightness-[0.35] group-hover:grayscale-0 group-hover:brightness-110 group-hover:saturate-[1.2] group-hover:scale-110 transition-all duration-700 ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setLoaded(true)}
                />
            )}
            {!loaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-pulse" />
            )}
        </div>
    );
}

export default function PhotoMural() {
    const [revealed, setRevealed] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); } },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="relative py-16 sm:py-20 md:py-28 lg:py-32 bg-black overflow-hidden">
            {/* Header — Centered + Scroll Reveal */}
            <div className={`max-w-3xl mx-auto px-6 md:px-12 text-center mb-12 sm:mb-16 md:mb-20 transition-all duration-1000 ease-out ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <span className="text-accent-gold font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[9px] sm:text-[10px] block mb-4 sm:mb-6">
                    Mural de Conexões
                </span>
                <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white mb-4 sm:mb-6 leading-tight">
                    38 Anos de <br /><span className="text-accent-gold italic">História.</span>
                </h3>
                <p className="text-white/30 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] leading-relaxed max-w-sm mx-auto">
                    Um mosaico vivo da jornada que construiu a BizGuardian World Connections.
                </p>
            </div>

            {/* Mural Grid — responsive from 4 cols (mobile) to 20 cols (4k) */}
            <div className={`relative transition-all duration-1200 ease-out delay-300 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-14 xl:grid-cols-16 2xl:grid-cols-20 gap-[1px] sm:gap-[2px]">
                    {PHOTO_IDS.map((id, index) => (
                        <LazyImage key={id} id={id} index={index} />
                    ))}
                </div>

                {/* Netflix-style vignette: all edges fade to black */}
                <div className="absolute inset-0 pointer-events-none z-10" style={{
                    boxShadow: 'inset 0 0 80px 40px rgba(0,0,0,0.95), inset 0 0 160px 80px rgba(0,0,0,0.6)'
                }} />
                <div className="absolute inset-x-0 top-0 h-16 sm:h-20 md:h-28 bg-gradient-to-b from-black via-black/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 md:h-28 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 left-0 w-8 sm:w-16 md:w-24 bg-gradient-to-r from-black via-black/70 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-8 sm:w-16 md:w-24 bg-gradient-to-l from-black via-black/70 to-transparent z-10 pointer-events-none" />
            </div>
        </section>
    );
}
