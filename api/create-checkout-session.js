const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const services = {
  starter: {
    name: "Starter Marketing",
    amount: 200
  },
  basic: {
    name: "Basic Marketing",
    amount: 500
  },
  standard: {
    name: "Standard Marketing",
    amount: 1000
  },
  premium: {
    name: "Premium Marketing",
    amount: 2000
  }
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { serviceId, target } = req.body;

    const service = services[serviceId];

    if (!service || !target) {
      return res.status(400).json({
        error: "Invalid order"
      });
    }

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: service.name
              },
              unit_amount: service.amount
            },
            quantity: 1
          }
        ],

        metadata: {
          serviceId,
          target: String(target).slice(0, 500)
        },

        success_url:
          "https://YOUR-VERCEL-DOMAIN.vercel.app/?payment=success",

        cancel_url:
          "https://YOUR-VERCEL-DOMAIN.vercel.app/?payment=cancelled"
      });

    return res.status(200).json({
      checkoutUrl: session.url
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Stripe Checkout creation failed"
    });
  }
};
