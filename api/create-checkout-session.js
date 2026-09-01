const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const services = {
  starter: {
    name: "400 Followers",
    amount: 200
  },

  basic: {
    name: "800 Followers",
    amount: 500
  },

  standard: {
    name: "900 Followers",
    amount: 1000
  },

  premium: {
    name: "1000 Followers",
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
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        error: "Stripe secret key is not configured"
      });
    }

    const { serviceId, target } = req.body || {};

    if (!serviceId || !target) {
      return res.status(400).json({
        error: "Service and username/profile URL are required"
      });
    }

    const service = services[serviceId];

    if (!service) {
      return res.status(400).json({
        error: "Invalid service"
      });
    }

    const cleanTarget = String(target).trim();

    if (cleanTarget.length < 2) {
      return res.status(400).json({
        error: "Invalid username/profile URL"
      });
    }

    const session = await stripe.checkout.sessions.create({

      mode: "payment",

      managed_payments: {
        enabled: false
      },

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
        service_id: serviceId,
        target: cleanTarget.slice(0, 500)
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

    console.error("Stripe error:", error);

    return res.status(500).json({
      error: error.message || "Stripe Checkout creation failed"
    });
  }
};
