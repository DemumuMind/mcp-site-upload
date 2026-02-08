import type { Locale } from "@/lib/i18n";

export type LocalizedText = {
  en: string;
  ru: string;
};

export type LegalSection = {
  id: string;
  title: LocalizedText;
  paragraph?: LocalizedText;
  bullets?: LocalizedText[];
};

export const legalEmail = "demumumind@gmail.com";
export const legalGmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(legalEmail)}`;

const legalLastUpdatedIso = "2026-02-08T14:17:00Z";

const enMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const ruMonths = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function getLegalLastUpdatedValue(locale: Locale): string {
  const timestamp = new Date(legalLastUpdatedIso);
  const day = timestamp.getUTCDate();
  const month = timestamp.getUTCMonth() + 1;
  const year = timestamp.getUTCFullYear();

  const wordsEn = `${enMonths[month - 1]} ${day}, ${year}`;
  const wordsRu = `${day} ${ruMonths[month - 1]} ${year}`;

  if (locale === "ru") {
    const ruNumeric = `${pad2(day)}.${pad2(month)}.${year}`;
    return `${ruNumeric} (${wordsRu})`;
  }

  const usNumeric = `${pad2(month)}/${pad2(day)}/${year}`;
  return `${usNumeric} (${wordsEn})`;
}

export const privacySections: LegalSection[] = [
  {
    id: "scope",
    title: {
      en: "1. Scope",
      ru: "1. Область действия",
    },
    paragraph: {
      en: "This Privacy Policy explains how DemumuMind handles information when you use our website, sign in, and submit MCP servers.",
      ru: "Эта Политика конфиденциальности объясняет, как DemumuMind обрабатывает информацию при использовании сайта, входе в аккаунт и отправке MCP-серверов.",
    },
  },
  {
    id: "collect",
    title: {
      en: "2. Information We Collect",
      ru: "2. Какие данные мы собираем",
    },
    bullets: [
      {
        en: "Account data: name, email, and authentication details.",
        ru: "Данные аккаунта: имя, email и сведения об авторизации.",
      },
      {
        en: "Usage and device data: pages viewed, approximate location, device/browser details, and cookies.",
        ru: "Данные об использовании и устройстве: просмотренные страницы, примерная геолокация, сведения об устройстве/браузере и cookies.",
      },
      {
        en: "Submission data: descriptions and other text you provide in forms and tools.",
        ru: "Данные отправки: описания и другой текст, который вы указываете в формах и инструментах.",
      },
      {
        en: "Payment metadata (if paid features are enabled): handled by payment providers, without full card data.",
        ru: "Платежные метаданные (если включены платные функции): обрабатываются платежными провайдерами без хранения полных данных карты.",
      },
      {
        en: "Communications: support requests and feedback.",
        ru: "Коммуникации: обращения в поддержку и обратная связь.",
      },
    ],
  },
  {
    id: "use",
    title: {
      en: "3. How We Use Information",
      ru: "3. Как мы используем данные",
    },
    bullets: [
      {
        en: "Provide and improve the catalog, moderation, and MCP workflows.",
        ru: "Предоставление и улучшение каталога, модерации и MCP-workflow.",
      },
      {
        en: "Process authentication, submissions, and optional billing operations.",
        ru: "Обработка авторизации, отправок и (при наличии) биллинга.",
      },
      {
        en: "Prevent abuse, fraud, and security incidents.",
        ru: "Предотвращение злоупотреблений, мошенничества и инцидентов безопасности.",
      },
      {
        en: "Analyze aggregated usage metrics to improve product quality.",
        ru: "Анализ агрегированных метрик использования для улучшения качества продукта.",
      },
    ],
  },
  {
    id: "sharing",
    title: {
      en: "4. Data Sharing",
      ru: "4. Передача данных",
    },
    paragraph: {
      en: "We do not sell personal data. We share limited data with service providers (for example hosting, auth, analytics, and payment providers) under contractual protections.",
      ru: "Мы не продаем персональные данные. Ограниченный объем данных может передаваться сервис-провайдерам (например, хостинг, авторизация, аналитика и платежи) на основе договорных гарантий.",
    },
  },
  {
    id: "cookies",
    title: {
      en: "5. Cookies and Analytics",
      ru: "5. Cookies и аналитика",
    },
    paragraph: {
      en: "We use cookies and analytics to operate and improve the service, including locale and theme preferences.",
      ru: "Мы используем cookies и аналитику для работы и улучшения сервиса, включая сохранение локали и темы.",
    },
  },
  {
    id: "retention",
    title: {
      en: "6. Retention",
      ru: "6. Сроки хранения",
    },
    bullets: [
      {
        en: "Account data is retained while the account is active and for a limited period after verified deletion requests.",
        ru: "Данные аккаунта хранятся, пока аккаунт активен, и ограниченный период после подтвержденного запроса на удаление.",
      },
      {
        en: "Submission and moderation records can be retained for anti-fraud and dispute handling.",
        ru: "Записи об отправках и модерации могут храниться для антифрода и урегулирования споров.",
      },
      {
        en: "Operational and security logs are retained for a limited period unless longer retention is legally required.",
        ru: "Операционные и security-логи хранятся ограниченный срок, если более длительный срок не требуется законом.",
      },
    ],
  },
  {
    id: "rights",
    title: {
      en: "7. Your Rights",
      ru: "7. Ваши права",
    },
    paragraph: {
      en: "Depending on your location, you may have rights to access, correct, delete, or export your data and to object to certain processing.",
      ru: "В зависимости от вашей юрисдикции вы можете иметь право на доступ, исправление, удаление или экспорт данных, а также на возражение против определенной обработки.",
    },
  },
  {
    id: "security",
    title: {
      en: "8. Security",
      ru: "8. Безопасность",
    },
    paragraph: {
      en: "We apply reasonable technical and organizational safeguards to protect information.",
      ru: "Мы применяем разумные технические и организационные меры для защиты информации.",
    },
  },
];

export const termsSections: LegalSection[] = [
  {
    id: "acceptance",
    title: {
      en: "1. Acceptance of Terms",
      ru: "1. Принятие условий",
    },
    paragraph: {
      en: "By using DemumuMind MCP, you agree to these Terms of Service.",
      ru: "Используя DemumuMind MCP, вы соглашаетесь с настоящими Условиями использования.",
    },
  },
  {
    id: "eligibility",
    title: {
      en: "2. Eligibility and Account",
      ru: "2. Допуск и аккаунт",
    },
    bullets: [
      {
        en: "You must have legal capacity to accept these terms.",
        ru: "Вы должны иметь право принимать эти условия.",
      },
      {
        en: "You are responsible for your account credentials and security.",
        ru: "Вы несете ответственность за учетные данные и безопасность аккаунта.",
      },
    ],
  },
  {
    id: "service",
    title: {
      en: "3. Service Description",
      ru: "3. Описание сервиса",
    },
    paragraph: {
      en: "DemumuMind MCP provides catalog and workflow tools for discovering and managing MCP integrations.",
      ru: "DemumuMind MCP предоставляет инструменты каталога и workflow для поиска и управления MCP-интеграциями.",
    },
  },
  {
    id: "aup",
    title: {
      en: "4. Acceptable Use",
      ru: "4. Допустимое использование",
    },
    bullets: [
      {
        en: "No illegal activity, fraud, or rights violations.",
        ru: "Запрещены незаконная деятельность, мошенничество и нарушение прав третьих лиц.",
      },
      {
        en: "No malware, exploit payloads, or deliberate service disruption.",
        ru: "Запрещены вредоносные программы, exploit-payload и умышленное нарушение работы сервиса.",
      },
      {
        en: "No unauthorized access attempts or bypass of technical protections.",
        ru: "Запрещены попытки несанкционированного доступа и обход технических ограничений.",
      },
    ],
  },
  {
    id: "content",
    title: {
      en: "5. User Submissions",
      ru: "5. Пользовательские отправки",
    },
    bullets: [
      {
        en: "You retain ownership of your content.",
        ru: "Вы сохраняете права на свой контент.",
      },
      {
        en: "You grant us a non-exclusive license to host and moderate submitted content for service operation.",
        ru: "Вы предоставляете нам неисключительную лицензию на размещение и модерацию отправленного контента для работы сервиса.",
      },
    ],
  },
  {
    id: "third-party",
    title: {
      en: "6. Third-Party Services",
      ru: "6. Сторонние сервисы",
    },
    paragraph: {
      en: "Some functionality depends on third-party providers governed by their own policies.",
      ru: "Часть функциональности зависит от сторонних провайдеров, которые работают по собственным политикам.",
    },
  },
  {
    id: "fees",
    title: {
      en: "7. Fees and Billing",
      ru: "7. Тарифы и биллинг",
    },
    paragraph: {
      en: "If paid features are enabled, pricing and billing terms are shown before purchase.",
      ru: "Если включены платные функции, условия цены и биллинга показываются до покупки.",
    },
  },
  {
    id: "ip",
    title: {
      en: "8. Intellectual Property",
      ru: "8. Интеллектуальная собственность",
    },
    paragraph: {
      en: "The platform, brand, and software are protected by intellectual property laws.",
      ru: "Платформа, бренд и программное обеспечение защищены законодательством об интеллектуальной собственности.",
    },
  },
  {
    id: "liability",
    title: {
      en: "9. Disclaimer and Limitation of Liability",
      ru: "9. Ограничение ответственности",
    },
    bullets: [
      {
        en: "The service is provided as-is and as-available.",
        ru: "Сервис предоставляется на условиях as-is и as-available.",
      },
      {
        en: "To the extent permitted by law, we are not liable for indirect or consequential damages.",
        ru: "В пределах, допустимых законом, мы не несем ответственность за косвенный или последующий ущерб.",
      },
    ],
  },
  {
    id: "termination",
    title: {
      en: "10. Suspension and Termination",
      ru: "10. Блокировка и прекращение доступа",
    },
    paragraph: {
      en: "We may suspend access for violations, abuse, or security risks.",
      ru: "Мы можем ограничить доступ при нарушениях, злоупотреблениях или рисках безопасности.",
    },
  },
  {
    id: "changes",
    title: {
      en: "11. Changes to Terms",
      ru: "11. Изменения условий",
    },
    paragraph: {
      en: "We may update these Terms and publish changes with an updated date.",
      ru: "Мы можем обновлять Условия и публиковать изменения с новой датой обновления.",
    },
  },
];
