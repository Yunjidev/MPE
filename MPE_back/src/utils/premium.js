"use strict";

const VALID_DURATIONS = {
  month: { months: 1 },
  year: { years: 1 },
};

const sanitizeDuration = (value) => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.toLowerCase().trim();
  if (VALID_DURATIONS[normalized]) {
    return normalized;
  }
  return null;
};

const addDurationToDate = (start, duration) => {
  const increment = VALID_DURATIONS[duration];
  if (!increment) {
    throw new Error(`Durée invalide: ${duration}`);
  }
  const result = new Date(start);
  if (increment.months) {
    result.setMonth(result.getMonth() + increment.months);
  }
  if (increment.years) {
    result.setFullYear(result.getFullYear() + increment.years);
  }
  return result;
};

const evaluateManualPremium = (entity) => {
  if (!entity) {
    return { manualActive: false, manualExpired: false };
  }
  const manualEnd =
    entity.premiumManualEnd || entity.dataValues?.premiumManualEnd || null;
  if (!manualEnd) {
    return { manualActive: false, manualExpired: false };
  }
  const endDate = new Date(manualEnd);
  const now = new Date();
  if (Number.isNaN(endDate.getTime())) {
    return { manualActive: false, manualExpired: false };
  }
  if (endDate <= now) {
    return { manualActive: false, manualExpired: true };
  }
  return { manualActive: true, manualExpired: false };
};

const normalizeEnterprisePremiumState = async (
  enterpriseInstance,
  hasActiveSubscription,
) => {
  const { manualActive, manualExpired } = evaluateManualPremium(
    enterpriseInstance,
  );

  let needsSave = false;

  if (manualExpired) {
    enterpriseInstance.premiumManualStart = null;
    enterpriseInstance.premiumManualEnd = null;
    needsSave = true;
  }

  const effectiveManualActive = manualExpired ? false : manualActive;
  const shouldBePremium = effectiveManualActive || hasActiveSubscription;

  if (enterpriseInstance.isPremium !== shouldBePremium) {
    enterpriseInstance.isPremium = shouldBePremium;
    needsSave = true;
  }

  if (needsSave) {
    await enterpriseInstance.save();
  }

  return {
    manualActive: effectiveManualActive,
    manualExpired,
    shouldBePremium,
  };
};

module.exports = {
  sanitizeDuration,
  addDurationToDate,
  evaluateManualPremium,
  normalizeEnterprisePremiumState,
};

