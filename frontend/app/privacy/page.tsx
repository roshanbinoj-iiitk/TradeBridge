"use client";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 py-16 min-h-screen mt-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-serif text-jet mb-4">
          Privacy Policy
        </h1>
        <p className="text-taupe mb-8">
          Your privacy is important to us. This policy explains how TradeBridge
          collects, uses, and protects your information.
        </p>

        <section className="space-y-4 text-taupe text-sm leading-relaxed">
          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide when creating an account (name,
              email, role), listing items, or making bookings. We also collect
              technical data like device and usage information to improve the
              service.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              2. How We Use Data
            </h2>
            <p>
              We use collected data to operate the platform, process payments,
              communicate with users, and provide customer support. We may use
              aggregated data for analytics and improvement.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              3. Sharing & Disclosure
            </h2>
            <p>
              We do not sell personal data. We may share information with
              service providers, payment processors, and when required by law.
              We also share necessary data with lenders and borrowers to
              facilitate bookings.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              4. Security
            </h2>
            <p>
              We implement reasonable measures to protect your data, but no
              system is completely secure. Report any suspected breaches to our
              support team immediately.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              5. Cookies & Tracking
            </h2>
            <p>
              We use cookies and similar technologies for authentication,
              preferences, and analytics. You can control cookies through your
              browser settings.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              6. Your Rights
            </h2>
            <p>
              Depending on your jurisdiction, you may have rights to access,
              correct, or delete your personal data. To exercise these rights,
              contact our support team.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              7. Third-Party Links
            </h2>
            <p>
              Our platform may contain links to third-party websites. We are not
              responsible for their privacy practices.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically. We will post
              changes on this page and, if required, notify users through the
              platform.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">Contact</h2>
            <p>
              Questions about privacy?{" "}
              <a href="/contact" className="text-jet hover:underline">
                Contact our support team
              </a>
              .
            </p>
          </div>
        </section>

        <div className="mt-10 text-sm text-taupe">
          <p>Last updated: September 5, 2025</p>
        </div>
      </div>
    </div>
  );
}
