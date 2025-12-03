import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Terms of Service | PromptForge",
    description: "Terms of Service for PromptForge",
};

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
                <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="prose prose-slate max-w-none space-y-12">
                {/* 1. Agreement to Terms */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
                    <p className="text-muted-foreground mb-4">
                        We are <strong>6FootMedia LLC</strong> ("Company," "we," "us," "our"), operating the website PromptForge (the "Site").
                        These Terms of Service ("Terms") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and 6FootMedia LLC, concerning your access to and use of the Site and Services.
                    </p>
                    <p className="text-muted-foreground">
                        By accessing the Services, you agree that you have read, understood, and agreed to be bound by all of these Terms. 
                        <strong> IF YOU DO NOT AGREE WITH ALL OF THESE TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong>
                    </p>
                </section>

                {/* 2. API Usage & Security - Keeping this prominent as requested */}
                <section className="bg-yellow-50/50 border-l-4 border-yellow-400 p-6 rounded-r-xl">
                    <h2 className="text-2xl font-bold mb-4 text-yellow-900">2. API Usage and Security</h2>
                    <div className="mb-4">
                        <p className="font-bold text-yellow-800 mb-2">CRITICAL: API Key Responsibility</p>
                        <p className="text-yellow-800/80 text-sm mb-4">
                            We are strictly NOT responsible for any leakage, compromise, or unauthorized use of your API keys (OpenAI, Anthropic, Google, etc.).
                        </p>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        You acknowledge and agree that you are solely responsible for:
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                        <li>Maintaining the absolute confidentiality and security of your API keys.</li>
                        <li>Regularly monitoring your API usage and billing dashboards on your provider's platform.</li>
                        <li>Setting up hard usage limits and billing alerts with your API providers to prevent cost overruns.</li>
                        <li>Immediately revoking and rotating any keys you suspect may have been exposed.</li>
                        <li>Ensuring your keys are never committed to public repositories or shared in unsecured channels.</li>
                    </ul>
                </section>

                {/* 3. Intellectual Property Rights */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">3. Intellectual Property Rights</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <h3 className="text-lg font-semibold text-foreground">Our Intellectual Property</h3>
                        <p>
                            We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").
                        </p>
                        <p>
                            Our Content and Marks are protected by copyright and trademark laws and treaties around the world. The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use only.
                        </p>
                        
                        <h3 className="text-lg font-semibold text-foreground mt-6">Your License to Use</h3>
                        <p>
                            Subject to your compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, revocable license to:
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Access the Services; and</li>
                            <li>Download or print a copy of any portion of the Content to which you have properly gained access solely for your personal, non-commercial use.</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-foreground mt-6">User Submissions</h3>
                        <p>
                            By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services ("Submissions"), you agree to assign to us all intellectual property rights in such Submission. You agree that we shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.
                        </p>
                    </div>
                </section>

                {/* 4. User Representations */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">4. User Representations</h2>
                    <p className="text-muted-foreground mb-4">
                        By using the Services, you represent and warrant that:
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                        <li>You have the legal capacity and you agree to comply with these Legal Terms.</li>
                        <li>You are not a minor in the jurisdiction in which you reside.</li>
                        <li>You will not access the Services through automated or non-human means, whether through a bot, script or otherwise.</li>
                        <li>You will not use the Services for any illegal or unauthorized purpose.</li>
                        <li>Your use of the Services will not violate any applicable law or regulation.</li>
                    </ul>
                </section>

                {/* 5. Prohibited Activities */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">5. Prohibited Activities</h2>
                    <p className="text-muted-foreground mb-4">
                        You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                    </p>
                    <p className="text-muted-foreground mb-2">As a user of the Services, you agree not to:</p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                        <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                        <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                        <li>Circumvent, disable, or otherwise interfere with security-related features of the Services.</li>
                        <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
                        <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
                        <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material that interferes with any party's uninterrupted use and enjoyment of the Services.</li>
                    </ul>
                </section>

                {/* 6. Limitation of Liability */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
                    <p className="text-muted-foreground mb-4 uppercase text-sm font-medium leading-relaxed">
                        In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the Services, even if we have been advised of the possibility of such damages.
                    </p>
                </section>

                {/* 7. Indemnification */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">7. Indemnification</h2>
                    <p className="text-muted-foreground mb-4">
                        You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of:
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                        <li>Use of the Services;</li>
                        <li>Breach of these Legal Terms;</li>
                        <li>Any breach of your representations and warranties set forth in these Legal Terms;</li>
                        <li>Your violation of the rights of a third party, including but not limited to intellectual property rights; or</li>
                        <li>Any overt harmful act toward any other user of the Services.</li>
                    </ul>
                </section>

                {/* 8. Contact Us */}
                <section className="border-t pt-8">
                    <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                    <p className="text-muted-foreground mb-4">
                        In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
                    </p>
                    <div className="font-medium">
                        <p>6FootMedia LLC</p>
                        <p>Attn: Tiran Dagan</p>
                        <p className="text-primary">
                            <a href="mailto:tiran@6footmedia.com">tiran@6footmedia.com</a>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
