export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Find Your Item",
      description:
        "Browse our extensive catalog or search for a specific product. Filter by category, price, and availability to find the perfect match.",
    },
    {
      number: 2,
      title: "Request to Rent",
      description:
        "Select your rental dates and send a request to the owner. You'll be notified as soon as your request is approved.",
    },
    {
      number: 3,
      title: "Arrange Pickup & Return",
      description:
        "Coordinate with the owner for a smooth pickup. Enjoy your rental, and return it on the agreed-upon date. It's that simple!",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-jet font-serif">
          How It Works
        </h2>
        <p className="text-lg text-taupe mt-4 max-w-3xl mx-auto">
          Renting on TradeBridge is simple, secure, and convenient. Get started
          in just three easy steps.
        </p>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <div className="bg-jet text-isabelline rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
                {step.number}
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-jet">
                {step.title}
              </h3>
              <p className="mt-2 text-taupe">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
