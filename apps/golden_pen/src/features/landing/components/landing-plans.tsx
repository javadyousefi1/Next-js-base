import { cn } from "@repo/ui/lib/utils";
import { ArrowLeft, Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";

import styles from "./landing.module.css";

const plans = [
  { key: "free", items: [0, 1, 2, 3] },
  { key: "silver", items: [0, 1, 2, 3] },
  { key: "gold", items: [0, 1, 2, 3, 4] },
  { key: "platinum", items: [0, 1, 2, 3, 4] },
] as const;

export function LandingPlans() {
  const t = useTranslations("Landing");
  return (
    <section id="plans" className={styles.plans} aria-labelledby="plans-title">
      <div className={styles.centerHeading}>
        <p className={styles.eyebrow}>{t("plansEyebrow")}</p>
        <h2 id="plans-title">{t("plansTitle")}</h2>
        <p>{t("plansCopy")}</p>
      </div>
      <div className={styles.planGrid}>
        {plans.map(({ key, items }) => (
          <article key={key} className={cn(styles.plan, key === "gold" && styles.featuredPlan)}>
            {key === "gold" && <span className={styles.planBadge}>{t("planFeatured")}</span>}
            <h3>{t(`plans.${key}.name`)}</h3>
            <p>{t(`plans.${key}.caption`)}</p>
            <div className={styles.price}>
              <strong>{t(`plans.${key}.price`)}</strong>
              <small>{t("currency")}</small>
            </div>
            <Link href={ROUTES.login} className={styles.planButton}>
              {t("planCta")}
              <ArrowLeft size={16} aria-hidden="true" />
            </Link>
            <ul>
              {items.map((index) => (
                <li key={index}>
                  <Check size={15} aria-hidden="true" />
                  {t(`plans.${key}.items.${index}`)}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className={styles.planNote}>{t("planNote")}</p>
    </section>
  );
}
