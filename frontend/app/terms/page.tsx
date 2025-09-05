"use client";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-6 py-16 min-h-screen mt-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-serif text-jet mb-4">
          Terms of Service
        </h1>
        <p className="text-taupe mb-8">
          These Terms of Service ("Terms") govern your access to and use of
          TradeBridge. Please read them carefully.
        </p>

        <section className="space-y-4 text-taupe text-sm leading-relaxed">
          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using TradeBridge you agree to these Terms. If you
              do not agree, do not use the platform.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              2. Eligibility
            </h2>
            <p>
              You must be at least 18 years old and able to enter into legally
              binding agreements to use the service. Accounts are for individual
              use only unless otherwise stated.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              3. User Accounts & Profiles
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account, for all activity that occurs under your account, and for
              keeping your profile information accurate and up to date.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              4. Listings, Bookings & Payments
            </h2>
            <p>
              Lenders list items with availability and terms. Borrowers request
              bookings for specified dates. All payments processed through the
              platform are subject to the fees and payment policies presented at
              checkout. Refunds and cancellations follow the policies shown when
              you make a booking.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              5. User Conduct
            </h2>
            <p>
              You agree not to use TradeBridge for unlawful activities, to
              misrepresent information, or to harass or defraud other users.
              Respect pickup/delivery agreements and any rules set by lenders.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              6. Intellectual Property
            </h2>
            <p>
              All content provided by TradeBridge, including logos, text and
              designs, is owned by or licensed to the platform. You may not
              reuse TradeBridge assets without permission.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              7. Disclaimers & Limitation of Liability
            </h2>
            <p>
              The platform is provided "as is". To the maximum extent permitted
              by law, TradeBridge disclaims warranties and limits liability for
              direct, indirect, incidental, or consequential damages arising
              from use of the service.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              8. Termination
            </h2>
            <p>
              We may suspend or terminate accounts that violate these Terms or
              pose risks to the community. You may also close your account
              through your profile settings.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              9. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws applicable where TradeBridge
              operates. Any disputes should be raised through the support
              channels first.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-jet mb-2">
              10. Contact
            </h2>
            <p>
              Questions about these Terms?{" "}
              <a href="/contact" className="text-jet hover:underline">
                Contact our support team
              </a>
              .
            </p>
          </div>
        </section>

        <div className="mt-10 text-sm text-taupe">
          <p>
            These Terms may be updated from time to time. We will post changes
            on this page and, where appropriate, provide notice through the
            platform.
          </p>
        </div>
      </div>
    </div>
  );
}
