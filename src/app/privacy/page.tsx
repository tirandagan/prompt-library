import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | PromptForge",
    description: "Privacy Policy for PromptForge",
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="prose prose-slate max-w-none space-y-12">
                <section>
                    <h2 className="text-2xl font-bold mb-4">Summary</h2>
                    <p className="text-muted-foreground mb-4">
                        This privacy notice describes how and why <strong>6FootMedia LLC</strong> ("we," "us," or "our") might collect, store, use, and/or share ("process") your information when you use our services ("Services"), such as when you visit our website or engage with us in other related ways.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                    
                    <h3 className="text-xl font-semibold mb-2">Personal Information You Disclose to Us</h3>
                    <p className="text-muted-foreground mb-4">
                        We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                        <li>Names and Contact Data (email addresses, phone numbers)</li>
                        <li>Passwords and Security Data (for authentication)</li>
                        <li>Payment Data (collected by our payment processors if applicable)</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-2">Information Automatically Collected</h3>
                    <p className="text-muted-foreground mb-4">
                        Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information.
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                        <li><strong>Log and Usage Data:</strong> Service-related, diagnostic, usage, and performance information our servers automatically collect.</li>
                        <li><strong>Device Data:</strong> Information about your computer, phone, tablet, or other device you use to access the Services.</li>
                        <li><strong>Location Data:</strong> Information about your device's location, which can be either precise or imprecise.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                    <p className="text-muted-foreground mb-4">
                        We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                        <li>To facilitate account creation and authentication and otherwise manage user accounts.</li>
                        <li>To deliver and facilitate delivery of services to the user.</li>
                        <li>To respond to user inquiries/offer support to users.</li>
                        <li>To send administrative information to you.</li>
                        <li>To enable user-to-user communications.</li>
                        <li>To request feedback.</li>
                        <li>To protect our Services (fraud monitoring and prevention).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">3. Cookies and Tracking Technologies</h2>
                    <p className="text-muted-foreground mb-4">
                        We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.
                    </p>
                    <p className="text-muted-foreground">
                        Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">4. How We Keep Your Information Safe</h2>
                    <p className="text-muted-foreground mb-4">
                        We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">5. Your Privacy Rights</h2>
                    <p className="text-muted-foreground mb-4">
                        Depending on your location, you may have certain rights regarding your personal information:
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                        <li><strong>Right to Access:</strong> You may have the right to request access to the personal information we collect from you.</li>
                        <li><strong>Right to Correction:</strong> You may request correction of your personal data if it is incorrect or no longer relevant.</li>
                        <li><strong>Right to Deletion:</strong> You may ask to delete the personal information we have collected from you.</li>
                        <li><strong>Right to Opt-Out:</strong> You may request to opt out from future selling or sharing of your personal information to third parties.</li>
                    </ul>
                    <p className="text-muted-foreground">
                        To exercise these rights, you can contact us by email at tiran@6footmedia.com. We will consider and act upon any request in accordance with applicable data protection laws.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">6. Updates to This Policy</h2>
                    <p className="text-muted-foreground mb-4">
                        We may update this privacy notice from time to time. The updated version will be indicated by an updated "Last updated" date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.
                    </p>
                </section>

                <section className="border-t pt-8">
                    <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                    <p className="text-muted-foreground mb-4">
                        If you have questions or comments about this notice, you may email us at:
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
