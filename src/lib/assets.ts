/** Marketing and UI image assets under public/media. */
const img = (name: string) => `/media/${name}`;

export const assets = {
  logo: "/logo-dashboard.svg",
  logoMark: "/favicon.svg",
  logoAlt: "/logo-dashboard.svg",

  heroBg: img("hero-bg.png"),
  divider: img("divider.png"),
  dividerAlt: img("divider-alt.png"),
  abstractLine: img("abstract-line.png"),

  heroPins: {
    left: img("hero-pin-left.png"),
    right: img("hero-pin-right.png"),
    rightAlt: img("hero-pin-right-alt.png"),
  },
  stickyNote: img("sticky-note-alt.png"),
  messenger: img("messenger.png"),
  abstractLeft: img("abstract-left.png"),
  abstractRight: img("abstract-right.png"),
  abstractOrb: img("abstract-orb.png"),
  abstractShape: img("abstract-shape.png"),
  stickyNoteCard: img("sticky-note.png"),
  activityCard: img("activity-card.png"),
  railLeft: img("rail-left.png"),
  railRight: img("rail-right.png"),
  plusCircle: img("plus-circle.png"),

  logos: [
    img("logo-partner-1.png"),
    img("logo-partner-2.png"),
    img("logo-partner-3.png"),
    img("logo-partner-4.png"),
    img("logo-partner-5.png"),
    img("logo-partner-6.png"),
    img("logo-partner-7.png"),
    img("logo-partner-8.png"),
  ],
  logoWide: [
    img("logo-wide-1.png"),
    img("logo-wide-2.png"),
    img("logo-wide-3.png"),
  ],

  featureMain: img("feature-main.png"),
  featureCard1: img("feature-card-1.png"),
  featureCard2: img("feature-card-2.png"),
  featureCard3: img("feature-card-3.png"),

  cxBanner: img("cx-banner.png"),
  cxVideo: img("cx-video.png"),
  cxPhoto: img("cx-photo.png"),
  clip: img("clip.png"),
  numbersBg: img("numbers-bg.png"),
  doodleArrow: img("doodle-arrow.png"),
  pillMark: img("pill-mark.png"),

  systemLeft: img("system-left.png"),
  systemRight: img("system-right.png"),
  systemVisual: img("system-visual.png"),
  systemVisual2: img("system-visual-2.png"),
  systemAccent: img("system-accent.png"),

  platform: img("platform.png"),
  platformAlt: img("platform-alt.png"),
  howItWorks: img("how-it-works.png"),
  howSteps: [
    img("how-step-1.png"),
    img("how-step-2.png"),
    img("how-step-3.png"),
    img("how-step-4.png"),
  ],

  context1: img("context-1.png"),
  context2: img("context-2.png"),
  context3: img("context-3.png"),
  context4: img("context-4.png"),

  /** ValleyNote-branded product UI mockups. */
  generated: {
    organizeNotes: "/marketing/generated/organize-notes.png",
    organizeTags: "/marketing/generated/organize-tags.png",
    askChat: "/marketing/generated/ask-chat.png",
    askQuickReplies: "/marketing/generated/ask-quick-replies.png",
    askIntent: "/marketing/generated/ask-intent.png",
    howSummary: "/marketing/generated/how-summary.png",
  },

  compare: img("compare.png"),
  compareDecor: [
    img("compare-decor-1.png"),
    img("compare-decor-2.png"),
  ],

  benefit1: img("benefit-1.png"),
  benefit2: img("benefit-2.png"),
  benefit3: img("benefit-3.png"),
  benefit4: img("benefit-4.png"),

  growth: img("growth.png"),
  growth2: img("growth-2.png"),
  growthCards: [
    img("growth-card-1.png"),
    img("growth-card-2.png"),
    img("growth-card-3.png"),
    img("growth-card-4.png"),
  ],

  ctaBg: img("cta-bg.png"),
  ctaWide: img("cta-wide.png"),
  ctaMap: img("cta-map.png"),
  /** Blue glass “window” card used in the global CTA stats. */
  ctaStatCard: img("cta-stat-card.png"),
  /** Soft pin / spotlight on floating CTA stats cards. */
  ctaStatPin: img("cta-stat-pin.png"),
  finalCta: img("final-cta.png"),
  finalDecor: img("final-decor.png"),
  footerBg: img("footer-bg.png"),

  blogs: [
    img("blog-1.png"),
    img("blog-2.png"),
    img("blog-3.png"),
  ],
  blogBanner: img("blog-banner.png"),
  blogAlt: [
    img("blog-alt-1.png"),
    img("blog-alt-2.png"),
  ],

  avatars: [
    img("avatar-1.png"),
    img("avatar-2.png"),
    img("avatar-3.png"),
    img("avatar-4.png"),
    img("avatar-5.png"),
    img("avatar-6.png"),
    img("avatar-7.png"),
    img("avatar-8.png"),
  ],

  people: [
    img("person-1.png"),
    img("person-2.png"),
    img("person-3.png"),
    img("person-4.png"),
  ],

  integrations: {
    shopify: img("integration-shopify.png"),
    gmail: img("integration-gmail.png"),
    telegram: img("integration-telegram.png"),
    instagram: img("integration-instagram.png"),
    facebook: img("integration-facebook.png"),
    slack: img("integration-slack.png"),
    linkedin: img("integration-linkedin.png"),
    notion: img("integration-notion.png"),
  },

  integrationIcons: [
    img("integration-icon-1.png"),
    img("integration-icon-2.png"),
    img("integration-icon-3.png"),
    img("integration-icon-4.png"),
    img("integration-icon-5.png"),
    img("integration-icon-6.png"),
    img("integration-icon-7.png"),
  ],

  icons: {
    social: img("icon-social.png"),
    messaging: img("icon-messaging.png"),
    notification: img("icon-notification.png"),
    gmail: img("icon-gmail.png"),
    check: img("icon-check.png"),
    spark: img("icon-spark.png"),
    plus: img("plus-circle.png"),
    arrow: img("icon-arrow.png"),
    chevron: img("icon-chevron.png"),
    menu: img("icon-menu.png"),
    close: img("icon-close.png"),
    star: img("icon-star.png"),
    user: img("icon-user.png"),
    retrieval: img("icon-retrieval.png"),
    chatbot: img("icon-chatbot.png"),
    action: img("icon-action.png"),
    insight: img("icon-insight.png"),
    security: img("icon-security.png"),
    global: img("icon-global.png"),
    support: img("icon-support.png"),
  },

  countryFlags: [
    img("flag-us.png"),
    img("flag-italy.png"),
    img("flag-south-africa.png"),
    img("flag-australia.png"),
    img("flag-sweden.png"),
    img("flag-south-korea.png"),
    img("flag-greece.png"),
    img("flag-denmark.png"),
    img("flag-india.png"),
    img("flag-france.png"),
    img("flag-uk.png"),
    img("flag-germany.png"),
  ],

  /** Flag + label pairs for the global CTA marquee. */
  countries: [
    { name: "United States", flag: img("flag-us.png") },
    { name: "Italy", flag: img("flag-italy.png") },
    { name: "South Africa", flag: img("flag-south-africa.png") },
    { name: "Australia", flag: img("flag-australia.png") },
    { name: "Sweden", flag: img("flag-sweden.png") },
    { name: "South Korea", flag: img("flag-south-korea.png") },
    { name: "Greece", flag: img("flag-greece.png") },
    { name: "Denmark", flag: img("flag-denmark.png") },
    { name: "India", flag: img("flag-india.png") },
    { name: "France", flag: img("flag-france.png") },
    { name: "United Kingdom", flag: img("flag-uk.png") },
    { name: "Germany", flag: img("flag-germany.png") },
  ],

  floating: {
    pinA: img("floating-pin-a.png"),
    pinB: img("floating-pin-b.png"),
    note: img("paperclip-left.png"),
    note2: img("paperclip-right.png"),
    clip: img("floating-clip.png"),
    abstract: img("final-decor.png"),
    abstract2: img("floating-abstract-2.png"),
  },

  paperclipLeft: img("paperclip-left.png"),
  paperclipRight: img("paperclip-right.png"),
  logoWhite: img("logo-white.png"),
  footerWordmark: img("footer-bg.png"),
  footerPattern: img("footer-pattern.png"),
  footerLine: img("abstract-line.png"),

  portraitAvatar: img("portrait-avatar.png"),
  glowSideAccents: img("glow-side-accents.png"),
};
