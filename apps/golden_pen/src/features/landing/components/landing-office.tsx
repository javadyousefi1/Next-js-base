import {
  CalendarDays,
  FolderOpen,
  Landmark,
  Users,
  ArrowDownLeft,
  ShieldCheck,
  MessagesSquare,
} from "lucide-react";
import { useTranslations } from "next-intl";

import styles from "./landing.module.css";

const steps = ["intake", "prepare", "manage", "defend"] as const;
const office = [
  { key: "cases", icon: FolderOpen },
  { key: "calendar", icon: CalendarDays },
  { key: "finance", icon: Landmark },
  { key: "team", icon: Users },
] as const;

export function LandingOffice() {
  const t = useTranslations("Landing");
  return (
    <>
      <section id="workflow" className={styles.workflow} aria-labelledby="workflow-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>{t("workflowEyebrow")}</p>
            <h2 id="workflow-title">{t("workflowTitle")}</h2>
          </div>
          <p>{t("workflowCopy")}</p>
        </div>
        <ol className={styles.steps}>
          {steps.map((key) => (
            <li key={key}>
              <span>{t(`steps.${key}.number`)}</span>
              <h3>{t(`steps.${key}.title`)}</h3>
              <p>{t(`steps.${key}.text`)}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className={styles.office} aria-labelledby="office-title">
        <div className={styles.officeIntro}>
          <p className={styles.eyebrow}>{t("officeEyebrow")}</p>
          <h2 id="office-title">{t("officeTitle")}</h2>
          <p>{t("officeCopy")}</p>
          <ArrowDownLeft size={64} strokeWidth={1} aria-hidden="true" />
        </div>
        <div className={styles.officeGrid}>
          {office.map(({ key, icon: Icon }) => (
            <article key={key}>
              <Icon size={28} strokeWidth={1.3} aria-hidden="true" />
              <h3>{t(`office.${key}.title`)}</h3>
              <p>{t(`office.${key}.text`)}</p>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.ecosystem} aria-labelledby="ecosystem-title">
        <h2 id="ecosystem-title">{t("ecosystemTitle")}</h2>
        <div>
          <article>
            <MessagesSquare size={25} strokeWidth={1.4} aria-hidden="true" />
            <h3>{t("portalTitle")}</h3>
            <p>{t("portalText")}</p>
          </article>
          <article>
            <ShieldCheck size={25} strokeWidth={1.4} aria-hidden="true" />
            <h3>{t("platformTitle")}</h3>
            <p>{t("platformText")}</p>
          </article>
        </div>
        <p className={styles.supportNote}>{t("supportNote")}</p>
      </section>
    </>
  );
}
