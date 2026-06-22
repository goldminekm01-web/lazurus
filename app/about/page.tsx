import type { Metadata } from "next";
import { Shield, Search, AlertTriangle, Users, Star } from "lucide-react";

export const metadata: Metadata = {
    title: "About Lazurus — White Hat Hackers Fighting Crypto Fraud",
    description:
        "Lazurus is a community of white hat hackers determined to keep the digital world safe — especially the wildly under-regulated crypto space. Meet our founders Park Jin Hyok, Ri Ho Nam, and Loi Liang Yang, and read our success stories in crypto scam tracing and fund recovery.",
    openGraph: {
        title: "About Lazurus — White Hat Hackers Fighting Crypto Fraud",
        description:
            "Lazurus is a community of white hat hackers determined to keep the digital world safe — especially the wildly under-regulated crypto space. Meet our founders and read our success stories in crypto scam tracing and fund recovery.",
        url: "https://lazurusgroup.com/about",
        siteName: "Lazurus",
        type: "website",
        images: [
            {
                url: "https://lazurusgroup.com/og-default.jpg",
                width: 1200,
                height: 630,
                alt: "Lazurus — White Hat Hackers Fighting Crypto Fraud",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "About Lazurus — White Hat Hackers Fighting Crypto Fraud",
        description:
            "A community of white hat hackers fighting crypto scams, tracing stolen funds, and recovering assets for victims.",
        images: ["https://lazurusgroup.com/og-default.jpg"],
    },
};

const founders = [
    {
        name: "Park Jin Hyok",
        role: "Co-Founder & Lead Investigator",
        bio: "A veteran cybersecurity researcher with deep expertise in blockchain forensics and on-chain tracing. Park has spearheaded dozens of high-profile crypto scam investigations and is relentless in his pursuit of justice for fraud victims.",
        initials: "PJH",
    },
    {
        name: "Ri Ho Nam",
        role: "Co-Founder & Head of Operations",
        bio: "Ri brings extensive experience in digital asset recovery, social-engineering analysis, and coordinated takedowns of fraudulent networks. His operational precision has been decisive in returning millions to scam victims.",
        initials: "RHN",
    },
    {
        name: "Loi Liang Yang",
        role: "Co-Founder & Chief Intelligence Officer",
        bio: "Loi is a pioneering threat intelligence analyst with a track record of infiltrating and dismantling organised crypto fraud syndicates. His deep-cover OSINT methods and ability to map illicit wallet networks have made him one of the most effective investigators in the space.",
        initials: "LLY",
    },
];

const pillars = [
    {
        icon: Shield,
        title: "White Hat Principles",
        desc: "Every operation we run follows strict ethical guidelines. We never engage in unauthorized access — our tools are always directed at protecting, not harming.",
    },
    {
        icon: Search,
        title: "Crypto Scam Tracing",
        desc: "Using on-chain analytics, mixer-tracing techniques, and OSINT, we follow stolen funds across blockchains and expose the actors behind them.",
    },
    {
        icon: AlertTriangle,
        title: "Fraud Asset Recovery",
        desc: "We coordinate directly with exchanges, law enforcement, and legal partners to freeze and recover digitally-stolen assets for victims.",
    },
    {
        icon: Users,
        title: "Community Intelligence",
        desc: "Our global network of vetted researchers shares intelligence in real-time, making us faster and more effective than any lone actor.",
    },
];

export default function AboutPage() {
    return (
        <div className="bg-white text-gray-900">

            {/* Hero */}
            <section className="bg-[#0a0a0a] text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-block px-3 py-1 bg-[#e8a020]/20 text-[#e8a020] text-xs font-mono tracking-widest uppercase rounded-full mb-6">
                        White Hat · Blockchain Security · Crypto Justice
                    </span>
                    <h1 className="font-display font-bold text-4xl sm:text-5xl leading-tight mb-6">
                        We Are <span className="text-[#e8a020]">Lazurus</span>
                    </h1>
                    <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                        A community of white hat hackers determined to keep the digital world safe —
                        with a relentless focus on the wildly unregulated crypto frontier.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
                <h2 className="font-display font-bold text-3xl text-gray-900 mb-6">Our Mission</h2>
                <div className="prose prose-lg max-w-none text-gray-700 space-y-5">
                    <p>
                        The cryptocurrency world moves fast, and regulation has struggled to keep up.
                        Scammers, rug-pull artists, and sophisticated fraud rings exploit this gap every day,
                        draining billions from ordinary people who simply wanted a fair shot at financial freedom.
                        <strong className="text-gray-900"> Lazurus exists to fight back.</strong>
                    </p>
                    <p>
                        We are a community of white hat hackers, blockchain forensic analysts, and digital
                        investigators who volunteer our skills to expose fraud, trace stolen crypto, and push
                        for real accountability in the decentralized space. We don't wait for governments to
                        catch up — we act now.
                    </p>
                    <p>
                        This website is where we publish our <strong className="text-gray-900">success stories</strong>:
                        documented cases of crypto scam tracing, fund recovery operations, takedown
                        coordination, and the tactics we used to bring fraudsters to justice. Think of it as
                        our public case file — open, transparent, and built to warn and educate the
                        community we protect.
                    </p>
                </div>
            </section>

            {/* Pillars */}
            <section className="bg-gray-50 py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-display font-bold text-3xl text-gray-900 mb-10 text-center">
                        What We Do
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {pillars.map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="bg-white rounded-xl border border-gray-100 p-6 flex gap-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="shrink-0 w-10 h-10 rounded-lg bg-[#e8a020]/10 flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-[#e8a020]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Founders */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
                <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">
                    Meet the Founders
                </h2>
                <p className="text-gray-600 mb-10 text-lg">
                    Lazurus was built by three investigators who refused to accept that scammers
                    could operate freely with no consequence.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {founders.map((f) => (
                        <div
                            key={f.name}
                            className="rounded-2xl border border-gray-100 bg-white shadow-sm p-8 flex flex-col gap-4 hover:shadow-md transition-shadow"
                        >
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-full bg-[#0a0a0a] flex items-center justify-center shrink-0">
                                <span className="text-[#e8a020] font-display font-bold text-lg">
                                    {f.initials}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-xl text-gray-900">{f.name}</h3>
                                <p className="text-[#e8a020] text-sm font-mono tracking-wide mb-3">{f.role}</p>
                                <p className="text-gray-600 text-sm leading-relaxed">{f.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quote / CTA */}
            <section className="bg-[#0a0a0a] py-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <Star className="w-8 h-8 text-[#e8a020] mx-auto mb-6" />
                    <blockquote className="text-white font-display font-semibold text-2xl sm:text-3xl leading-snug mb-6">
                        "Justice in the crypto world won't come from silence. It comes from
                        people who refuse to look away."
                    </blockquote>
                    <p className="text-gray-400 text-sm mb-8">— Park Jin Hyok, Co-Founder, Lazurus</p>
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#e8a020] text-[#0a0a0a] font-semibold text-sm rounded-lg hover:bg-[#e8a020]/90 transition-colors"
                    >
                        Read Our Case Files →
                    </a>
                </div>
            </section>

            {/* Ethics note */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-sm text-gray-500 italic text-center">
                    Lazurus operates exclusively within the bounds of ethical, white hat cybersecurity.
                    We do not engage in unauthorized system access. All investigations are conducted
                    using legal, open-source, and consented methods. Information published here is
                    intended to educate the public and support fraud prevention.
                </div>
            </section>
        </div>
    );
}
