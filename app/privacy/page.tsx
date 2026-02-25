import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy — Lazarus",
};

export default function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
            <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-400 text-sm mb-8">Last updated: February 2025</p>
            <div className="prose max-w-none text-gray-700 space-y-4 text-sm leading-relaxed">
                <p>
                    Lazarus (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed to
                    protecting your personal information. This Privacy Policy explains how we collect, use,
                    and safeguard your data when you visit our website.
                </p>
                <h2 className="font-display font-bold text-lg text-gray-900 mt-6">Data We Collect</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Email address (if you subscribe to our newsletter)</li>
                    <li>Anonymous usage data via analytics (page views, referrer)</li>
                    <li>Cookies required for site function</li>
                </ul>
                <h2 className="font-display font-bold text-lg text-gray-900 mt-6">How We Use Your Data</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li>To send our newsletter (if subscribed)</li>
                    <li>To improve site content and performance</li>
                    <li>We do not sell or share your data with third parties</li>
                </ul>
                <h2 className="font-display font-bold text-lg text-gray-900 mt-6">Your Rights</h2>
                <p>
                    You have the right to access, correct, or delete your personal data. To unsubscribe from
                    our newsletter, use the link at the bottom of any email. For data deletion requests,
                    contact us at privacy@antigravity.news.
                </p>
                <h2 className="font-display font-bold text-lg text-gray-900 mt-6">Contact</h2>
                <p>
                    Questions? Email us at{" "}
                    <a href="mailto:privacy@antigravity.news" className="text-blue-600 hover:underline">
                        privacy@antigravity.news
                    </a>
                </p>
            </div>
        </div>
    );
}
