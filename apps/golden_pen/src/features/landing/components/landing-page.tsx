import { ArrowLeft, ArrowUpLeft, Feather } from "lucide-react";
import { useTranslations } from "next-intl";

import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";

import { LandingFeatures } from "./landing-features";
import { LandingOffice } from "./landing-office";
import { LandingPlans } from "./landing-plans";
import { LandingPreview } from "./landing-preview";

import styles from "./landing.module.css";

const faqKeys = ["ai", "credits", "team", "start"] as const;

export function LandingPage() {
  const t = useTranslations("Landing");
  return (
    <div className={styles.landing} id="top">
      <a href="#main-content" className={styles.skip}>
        {t("skip")}
      </a>
      <header className={styles.header}>
        <a href="#top" className={styles.brand}>
          <span className={styles.brandMark}>
            <Feather aria-hidden="true" />
          </span>
          <span>
            <strong>{t("brand")}</strong>
            <small>{t("brandCaption")}</small>
          </span>
        </a>
        <nav aria-label={t("navLabel")} className={styles.nav}>
          <a href="#features">{t("navFeatures")}</a>
          <a href="#workflow">{t("navWorkflow")}</a>
          <a href="#plans">{t("navPlans")}</a>
          <a href="#faq">{t("navFaq")}</a>
        </nav>
        <Link href={ROUTES.login} className={styles.headerCta}>
          {t("login")}
          <ArrowUpLeft size={17} aria-hidden="true" />
        </Link>
      </header>
      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span />
              {t("eyebrow")}
            </p>
            <h1 id="hero-title">
              {t("heroLine1")}
              <br />
              <em>{t("heroLine2")}</em>
            </h1>
            <p className={styles.lead}>{t("heroCopy")}</p>
            <div className={styles.actions}>
              <Link href={ROUTES.login} className={styles.primary}>
                {t("heroCta")}
                <ArrowLeft size={19} aria-hidden="true" />
              </Link>
              <a className={styles.textLink} href="#features">
                {t("explore")}
                <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className={styles.heroNote}>{t("heroNote")}</p>
          </div>
          <LandingPreview />
          <div className={styles.heroBottom}>
            <span>{t("heroIndex")}</span>
            <span aria-hidden="true">↓</span>
          </div>
        </section>
        <div className={styles.ribbon}>
          {(["ribbon1", "ribbon2", "ribbon3", "ribbon4", "ribbon5"] as const).map((key) => (
            <span key={key}>
              {t(key)}
              <i aria-hidden="true">✦</i>
            </span>
          ))}
        </div>
        <LandingFeatures />
        <LandingOffice />
        <LandingPlans />
        <section id="faq" className={styles.faq} aria-labelledby="faq-title">
          <div>
            <p className={styles.eyebrow}>{t("faqEyebrow")}</p>
            <h2 id="faq-title">{t("faqTitle")}</h2>
          </div>
          <div>
            {faqKeys.map((key) => (
              <details key={key} className={styles.faqItem}>
                <summary>
                  {t(`faqs.${key}.q`)}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{t(`faqs.${key}.a`)}</p>
              </details>
            ))}
          </div>
        </section>
        <section className={styles.final} aria-labelledby="final-title">
          <Feather className={styles.finalFeather} aria-hidden="true" />
          <p className={styles.eyebrow}>{t("finalEyebrow")}</p>
          <h2 id="final-title">{t("finalTitle")}</h2>
          <p>{t("finalCopy")}</p>
          <Link href={ROUTES.login} className={styles.goldButton}>
            {t("finalCta")}
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
        </section>
      </main>
      <footer className={styles.footer}>
        <div>
          <strong>{t("brand")}</strong>
          <p>{t("footerNote")}</p>
        </div>
        <span>{t("footerVision")}</span>
        <a href="#top">{t("backTop")} ↑</a>
      </footer>
    </div>
  );
}
