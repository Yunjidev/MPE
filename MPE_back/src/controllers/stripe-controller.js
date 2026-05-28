const { sequelize } = require("../../models/index");
const Subscription = sequelize.models.Subscription;
const Enterprise = sequelize.models.Enterprise;
const { normalizeEnterprisePremiumState } = require("../utils/premium");

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith("sk_test_your")) {
    throw new Error("STRIPE_SECRET_KEY non configurée dans le fichier .env");
  }
  return require("stripe")(key);
};

const PLANS = {
  monthly: { unitAmount: 3000, interval: "month", label: "Mensuel — 30 €/mois", type: "monthly" },
  yearly:  { unitAmount: 27000, interval: "year",  label: "Annuel — 270 €/an",  type: "yearly"  },
};

// ─── Création session Stripe ──────────────────────────────────────────────────

exports.createCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripe();
    const { plan, enterprise_id } = req.body;

    const planConfig = PLANS[plan];
    if (!planConfig) return res.status(400).json({ error: "Plan invalide. Utilisez 'monthly' ou 'yearly'." });

    const enterprise = await Enterprise.findByPk(enterprise_id);
    if (!enterprise) return res.status(404).json({ error: "Entreprise non trouvée." });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `Abonnement Premium — ${enterprise.name} (${planConfig.label})` },
            unit_amount: planConfig.unitAmount,
            recurring: { interval: planConfig.interval },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      // Métadonnées sur le checkout ET sur l'abonnement Stripe (pour les webhooks de renouvellement)
      metadata: { enterprise_id: enterprise_id.toString(), plan: planConfig.type },
      subscription_data: {
        metadata: { enterprise_id: enterprise_id.toString(), plan: planConfig.type },
      },
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.FRONTEND_URL || "http://localhost:5173"}/pricing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Vérification session après paiement ──────────────────────────────────────

exports.verifySession = async (req, res) => {
  try {
    const stripe = getStripe();
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return res.status(400).json({ error: "Paiement non complété." });
    }

    const { enterprise_id, plan } = session.metadata;
    const enterpriseId = parseInt(enterprise_id);

    const enterprise = await Enterprise.findByPk(enterpriseId);
    if (!enterprise) return res.status(404).json({ error: "Entreprise non trouvée." });

    // Éviter la double création (session déjà traitée dans les 10 dernières minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recent = await Subscription.findOne({
      where: { Enterprise_id: enterpriseId, status: "active" },
      order: [["createdAt", "DESC"]],
    });

    if (recent && recent.createdAt > tenMinutesAgo) {
      return res.json({ message: "Abonnement déjà actif.", alreadyProcessed: true });
    }

    const start_date = new Date();
    const end_date = new Date(start_date);
    if (plan === "monthly") end_date.setMonth(end_date.getMonth() + 1);
    else end_date.setFullYear(end_date.getFullYear() + 1);

    // Stocker le stripe_subscription_id pour les webhooks futurs
    const stripeSubscriptionId = session.subscription;

    await Subscription.create({
      subscription_type: plan === "monthly" ? "monthly" : "yearly",
      status: "active",
      start_date,
      end_date,
      stripe_subscription_id: stripeSubscriptionId || null,
      Enterprise_id: enterpriseId,
    });

    enterprise.isPremium = true;
    await enterprise.save();

    res.json({ message: "Abonnement premium activé avec succès.", enterprise_id: enterpriseId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Abonnement courant de l'entreprise ──────────────────────────────────────

exports.getMySubscription = async (req, res) => {
  try {
    const { enterpriseId } = req.params;

    const enterprise = await Enterprise.findOne({
      where: { id: enterpriseId, User_id: req.user.id },
    });
    if (!enterprise) return res.status(403).json({ error: "Accès refusé." });

    const subscription = await Subscription.findOne({
      where: { Enterprise_id: enterpriseId, status: "active" },
      order: [["createdAt", "DESC"]],
    });

    res.json({ subscription: subscription || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Résiliation abonnement ───────────────────────────────────────────────────

exports.cancelSubscription = async (req, res) => {
  try {
    const { enterprise_id } = req.body;

    const enterprise = await Enterprise.findOne({
      where: { id: enterprise_id, User_id: req.user.id },
    });
    if (!enterprise) return res.status(403).json({ error: "Accès refusé." });

    const subscription = await Subscription.findOne({
      where: { Enterprise_id: enterprise_id, status: "active" },
      order: [["createdAt", "DESC"]],
    });

    // Pas de subscription en DB (premium manuel via toggle admin) → juste révoquer isPremium
    if (!subscription) {
      enterprise.isPremium = false;
      await enterprise.save();
      return res.json({
        message: "Accès Premium révoqué.",
        cancelAtPeriodEnd: false,
      });
    }

    if (subscription.stripe_subscription_id) {
      const stripe = getStripe();
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
      return res.json({
        message: "Renouvellement automatique annulé. Votre accès Premium reste actif jusqu'à la fin de la période en cours.",
        end_date: subscription.end_date,
        cancelAtPeriodEnd: true,
      });
    }

    // Abonnement manuel (sans Stripe) : résiliation immédiate
    subscription.status = "inactive";
    await subscription.save();
    enterprise.isPremium = false;
    await enterprise.save();

    return res.json({
      message: "Abonnement résilié avec succès.",
      cancelAtPeriodEnd: false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Webhook Stripe ───────────────────────────────────────────────────────────

exports.handleWebhook = async (req, res) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  if (webhookSecret) {
    const sig = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("❌ Webhook signature invalide:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // Pas de secret configuré (dev local sans Stripe CLI) : on fait confiance au body
    event = req.body;
  }

  try {
    switch (event.type) {

      // ── Renouvellement réussi ──────────────────────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        // Ignorer la première facture (déjà gérée par verifySession)
        if (invoice.billing_reason === "subscription_create") break;

        const stripeSubId = invoice.subscription;
        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubId);
        const enterpriseId = stripeSubscription.metadata?.enterprise_id;
        const plan = stripeSubscription.metadata?.plan;

        if (!enterpriseId) {
          console.warn("Webhook invoice.payment_succeeded : enterprise_id manquant dans metadata");
          break;
        }

        const sub = await Subscription.findOne({
          where: { Enterprise_id: parseInt(enterpriseId), status: "active" },
          order: [["createdAt", "DESC"]],
        });

        if (sub) {
          const newEnd = new Date(sub.end_date);
          if (plan === "monthly") newEnd.setMonth(newEnd.getMonth() + 1);
          else newEnd.setFullYear(newEnd.getFullYear() + 1);
          sub.end_date = newEnd;
          await sub.save();
          console.log(`✅ Renouvellement entreprise ${enterpriseId} → fin : ${newEnd.toLocaleDateString()}`);
        }
        break;
      }

      // ── Abonnement supprimé / expiré côté Stripe ──────────────────────────
      case "customer.subscription.deleted": {
        const stripeSubscription = event.data.object;
        const enterpriseId = stripeSubscription.metadata?.enterprise_id;

        if (!enterpriseId) break;

        const enterprise = await Enterprise.findByPk(parseInt(enterpriseId));
        if (enterprise) {
          enterprise.isPremium = false;
          await enterprise.save();
        }

        await Subscription.update(
          { status: "inactive" },
          { where: { Enterprise_id: parseInt(enterpriseId), status: "active" } }
        );

        console.log(`🔴 Abonnement supprimé pour entreprise ${enterpriseId}`);
        break;
      }

      // ── Échec de paiement ─────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const stripeSubId = invoice.subscription;
        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubId);
        const enterpriseId = stripeSubscription.metadata?.enterprise_id;

        if (enterpriseId) {
          console.warn(`⚠️ Échec de paiement pour entreprise ${enterpriseId}`);
          // On ne désactive pas encore — Stripe réessaie automatiquement
          // La désactivation se fera via customer.subscription.deleted si tous les essais échouent
        }
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error("❌ Erreur traitement webhook:", error);
    res.status(500).json({ error: error.message });
  }
};
