import { CalendarDays, Check, FileText, FolderOpen, Landmark, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import styles from "./landing.module.css";

export function LandingPreview() {
  const t = useTranslations("Landing");
  return (
    <figure className={styles.preview}>
      <div className={styles.orbit} aria-hidden="true" />
      <div className={styles.workspace}>
        <div className={styles.workspaceHeader}>
          <span>
            <FolderOpen size={19} aria-hidden="true" />
            {t("previewOffice")}
          </span>
          <span className={styles.windowDots} aria-hidden="true">
            •••
          </span>
        </div>
        <div className={styles.workspaceBody}>
          <div className={styles.caseHeading}>
            <div>
              <small>{t("previewSub")}</small>
              <h2>{t("previewCase")}</h2>
              <p>{t("previewClient")}</p>
            </div>
            <span className={styles.status}>{t("previewStatus")}</span>
          </div>
          <div className={styles.miniMeeting}>
            <CalendarDays size={20} aria-hidden="true" />
            <div>
              <strong>{t("previewMeeting")}</strong>
              <small>
                {t("previewDate")} · {t("previewBranch")}
              </small>
            </div>
            <b>{t("previewTime")}</b>
          </div>
          <div className={styles.previewDocument}>
            <FileText size={22} aria-hidden="true" />
            <h3>{t("previewDoc")}</h3>
            <small>{t("previewDocMeta")}</small>
            <hr />
            <strong>{t("previewClause")}</strong>
            <p>{t("previewBody")}</p>
            <div className={styles.paperLines} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className={styles.miniFooter}>
            <span>
              <FileText size={14} aria-hidden="true" />
              {t("previewArchive")}
            </span>
            <span>
              <Landmark size={14} aria-hidden="true" />
              {t("previewFinance")}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.aiFloat}>
        <span className={styles.aiIcon}>
          <Sparkles size={19} aria-hidden="true" />
        </span>
        <strong>{t("previewAi")}</strong>
        <p>{t("previewAiText")}</p>
        <small>
          <Check size={13} aria-hidden="true" />
          {t("previewAiTag")}
        </small>
      </div>
      <figcaption>{t("previewLabel")}</figcaption>
    </figure>
  );
}
