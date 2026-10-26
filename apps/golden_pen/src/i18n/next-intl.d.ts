import type messages from "../../messages/fa.json";
import type { AppLocale } from "./routing";

declare module "next-intl" {
  interface AppConfig {
    Locale: AppLocale;
    Messages: typeof messages;
  }
}
