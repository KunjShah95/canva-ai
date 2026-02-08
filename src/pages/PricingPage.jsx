import React from 'react';

const PricingPage = () => {
    return (
        <div className="bg-white dark:bg-black min-h-screen pt-32 pb-20 px-6 selection:bg-brand selection:text-white">
            <div className="max-w-7xl mx-auto text-center mb-20 animate-fade-in">
                <span className="text-[10px] font-bold text-brand uppercase tracking-[0.4em] mb-4 block">
                    SIMPLE PRICING
                </span>
                <h1 className="text-5xl md:text-7xl font-serif text-ink dark:text-white leading-tight mb-6">
                    Designed for <br />
                    <span className="italic font-light">Student Budgets</span>
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Start creating for free and upgrade when you're ready to remove watermarks and unlock premium portfolio templates.
                </p>
            </div>

            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-stretch">
                {/* Free Plan */}
                <div className="bg-[#FAFAFA] dark:bg-[#050505] p-12 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col hover:border-brand/50 transition-colors duration-500 group">
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-ink dark:text-white mb-2">Free Plan</h3>
                        <p className="text-sm text-gray-400">Perfect for quick one-off graphics.</p>
                    </div>
                    <div className="mb-8">
                        <span className="text-5xl font-sans font-bold text-ink dark:text-white">$0</span>
                    </div>
                    <ul className="space-y-4 mb-12 flex-grow">
                        <PricingFeature label="AI Background Removal" />
                        <PricingFeature label="One-click Enhancement" />
                        <PricingFeature label="Standard Templates" />
                        <PricingFeature label="Watermarked Exports" isDull />
                        <PricingFeature label="Standard Portfolios" />
                    </ul>
                    <button className="w-full py-4 rounded-full border border-gray-200 dark:border-white/10 text-[11px] font-bold uppercase tracking-widest hover:bg-ink dark:hover:bg-white hover:text-white dark:hover:text-black transition-all">
                        GET STARTED
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-white dark:bg-black p-12 rounded-3xl border-2 border-brand relative flex flex-col shadow-2xl shadow-brand/10 transform scale-105 z-10 overflow-hidden">
                    <div className="absolute top-0 right-0 bg-brand text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
                        Most Popular
                    </div>
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-ink dark:text-white mb-2">Student Pro</h3>
                        <p className="text-sm text-gray-400">Everything you need for a killer portfolio.</p>
                    </div>
                    <div className="mb-8">
                        <span className="text-5xl font-sans font-bold text-ink dark:text-white">$3</span>
                        <span className="text-gray-400 font-bold ml-2">/ month</span>
                    </div>
                    <ul className="space-y-4 mb-12 flex-grow">
                        <PricingFeature label="No Watermarks" highlighted />
                        <PricingFeature label="Premium AI Background Box" highlighted />
                        <PricingFeature label="Pro Template Library" highlighted />
                        <PricingFeature label="Priority AI Processing" />
                        <PricingFeature label="Save Unlimited Drafts" />
                    </ul>
                    <button className="w-full py-4 rounded-full bg-brand text-white text-[11px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-brand/30">
                        UPGRADE TO PRO
                    </button>
                </div>
            </div>

            {/* FAQ Preview */}
            <div className="max-w-3xl mx-auto mt-32 text-center">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-12 italic">Common Questions</h4>
                <div className="space-y-10 text-left">
                    <div>
                        <h5 className="font-bold text-ink dark:text-white mb-2">Can I cancel anytime?</h5>
                        <p className="text-sm text-gray-500 leading-relaxed">Yes, Student Pro is a no-commitment monthly subscription. Cancel whenever you want from your dashboard.</p>
                    </div>
                    <div>
                        <h5 className="font-bold text-ink dark:text-white mb-2">Is there a student discount?</h5>
                        <p className="text-sm text-gray-500 leading-relaxed">Our pricing is already optimized for students. At just $3/mo, it's cheaper than a cup of coffee!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PricingFeature = ({ label, isDull, highlighted }) => (
    <li className={`flex items-center gap-3 text-sm ${isDull ? 'opacity-40 line-through' : 'opacity-100'}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`w-4 h-4 ${highlighted ? 'text-brand' : 'text-gray-300'}`}>
            <path d="M5 13l4 4L19 7" />
        </svg>
        <span className={highlighted ? 'font-bold text-ink dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
            {label}
        </span>
    </li>
);

export default PricingPage;
