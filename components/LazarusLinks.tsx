import React from "react";
import { ExternalLink, Shield, Database, Lock } from "lucide-react";

export default function LazarusLinks() {
    const links = [
        {
            title: "Lazarus Group Intel",
            description: "Deep dive into the history, tactics, and operations of the elite collective.",
            url: "https://www.bugcrowd.com/glossary/lazarus-group/",
            icon: Shield,
        },
        {
            title: "Historic Operations",
            description: "A decade of Lazarus: Analyzing the North Korean scourge (NCC Group).",
            url: "https://www.nccgroup.com/the-lazarus-group-north-korean-scourge-for-plus10-years/",
            icon: Lock,
        },
        {
            title: "Recent Investigation",
            description: "BBC report on the modern footprint of global digital exploits.",
            url: "https://www.bbc.com/news/articles/c2kgndwwd7lo",
            icon: Database,
        },
        {
            title: "Blockchain Forensics",
            description: "Advanced methodology for tracing obfuscated crypto transactions.",
            url: "https://www.chainalysis.com/blog/categories/blockchain-forensics/",
            icon: Database,
        },
    ];

    return (
        <section className="bg-gray-900 rounded-2xl p-6 border border-gray-800 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="w-16 h-16 text-[#e8a020]" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#e8a020] animate-pulse" />
                    <h3 className="font-display font-bold text-sm text-white uppercase tracking-widest">
                        Lazarus Intel Node
                    </h3>
                </div>

                <div className="space-y-4">
                    {links.map((link) => (
                        <a
                            key={link.title}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-xl bg-gray-800/50 border border-gray-800 hover:border-[#e8a020]/30 hover:bg-gray-800 transition-all group/item"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-gray-900 group-hover/item:bg-[#e8a020]/10 transition-colors">
                                    <link.icon className="w-4 h-4 text-gray-400 group-hover/item:text-[#e8a020]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white text-xs font-bold mb-0.5 flex items-center gap-1">
                                        {link.title}
                                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/item:opacity-50 transition-opacity" />
                                    </h4>
                                    <p className="text-gray-400 text-[10px] leading-tight">
                                        {link.description}
                                    </p>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800">
                    <p className="text-[10px] text-gray-500 font-mono text-center">
                        SECURE_CONNECTION_ESTABLISHED // LAZ_V1.4
                    </p>
                </div>
            </div>
        </section>
    );
}
