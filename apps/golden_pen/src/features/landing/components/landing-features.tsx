import { AudioLines, Check, FilePenLine, MessageSquareText, Scale, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import styles from "./landing.module.css";

const bars = [
  18, 30, 44, 24, 50, 35, 59, 40, 25, 48, 62, 37, 52, 27, 43, 58, 31, 21, 44, 35, 56, 24, 40, 18,
];

export function LandingFeatures() {
  const t = useTranslations("Landing");
  return (
    <section id="features" className={styles.features} aria-labelledby="features-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>{t("featuresEyebrow")}</p>
          <h2 id="features-title">{t("featuresTitle")}</h2>
        </div>
        <p>{t("featuresCopy")}</p>
      </div>
      <article className={styles.documentFeature}>
        <div className={styles.documentCopy}>
          <FilePenLine size={30} strokeWidth={1.3} aria-hidden="true" />
          <p className={styles.tag}>{t("documentTag")}</p>
          <h3>{t("documentTitle")}</h3>
          <p>{t("documentCopy")}</p>
          <ol className={styles.documentSteps}>
            {(["documentStep1", "documentStep2", "documentStep3"] as const).map((key) => (
              <li key={key}>
                <Check size={15} aria-hidden="true" />
                {t(key)}
              </li>
            ))}
          </ol>
          <small>{t("documentOutput")}</small>
        </div>
        <div className={styles.documentVisual}>
          <div className={styles.largePaper}>
            <div className={styles.paperTop}>
              <FilePenLine size={22} aria-hidden="true" />
              <span>{t("documentVersion")}</span>
            </div>
            <h4>{t("documentPaper")}</h4>
            <div className={styles.paperLines} aria-hidden="true">
              <span />
              <span />
            </div>
            <strong>{t("documentPaperSub")}</strong>
            <p>{t("documentPaperBody")}</p>
            <div className={styles.paperLines} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className={styles.paperSignature} aria-hidden="true">
              ∿
            </div>
          </div>
          <div className={styles.annotation}>
            <Sparkles size={18} aria-hidden="true" />
            <strong>{t("documentComment")}</strong>
            <p>{t("documentCommentBody")}</p>
          </div>
          <span className={styles.checked}>
            <Check size={14} aria-hidden="true" />
            {t("documentChecked")}
          </span>
        </div>
      </article>
      <div className={styles.toolsGrid}>
        <article className={styles.toolCard}>
          <MessageSquareText size={27} strokeWidth={1.4} aria-hidden="true" />
          <h3>{t("chatTitle")}</h3>
          <p>{t("chatCopy")}</p>
          <div className={styles.chatVisual}>
            <span>{t("chatExample")}</span>
            <span>
              <Sparkles size={14} aria-hidden="true" />
              {t("chatAnswer")}
            </span>
          </div>
        </article>
        <article className={styles.toolCard}>
          <AudioLines size={27} strokeWidth={1.4} aria-hidden="true" />
          <h3>{t("voiceTitle")}</h3>
          <p>{t("voiceCopy")}</p>
          <div className={styles.waveVisual}>
            <div aria-hidden="true">
              {bars.map((height, index) => (
                <i key={index} style={{ height }} />
              ))}
            </div>
            <span>{t("voiceTag")}</span>
            <small>{t("voiceTime")}</small>
          </div>
        </article>
        <article className={styles.courtCard}>
          <Scale size={28} strokeWidth={1.4} aria-hidden="true" />
          <span className={styles.tag}>{t("courtTag")}</span>
          <h3>{t("courtTitle")}</h3>
          <p>{t("courtCopy")}</p>
          <div className={styles.courtVisual}>
            <span aria-hidden="true">«</span>
            <p>{t("courtQuestion")}</p>
            <small>{t("courtReport")}</small>
          </div>
        </article>
      </div>
      <p className={styles.aiNote}>
        <Sparkles size={16} aria-hidden="true" />
        {t("aiNote")}
      </p>
    </section>
  );
}
