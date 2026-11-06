import Link from "next/link";
import LegalPageShell, {
  LegalList,
  LegalSection,
} from "@/components/legal/LegalPageShell";

export const metadata = {
  title: "Terms of Service — ValleyNote",
  description:
    "Terms of Service for ValleyNote by Moonlight Valley LLC. Covers accounts, AI features, subscriptions, Whop payments, and acceptable use.",
};

const EFFECTIVE_DATE = "November 6, 2026";

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Terms of Service"
      description="These Terms govern your access to and use of ValleyNote, the AI-powered notebook operated by Moonlight Valley LLC."
      effectiveDate={EFFECTIVE_DATE}
    >
      <LegalSection title="1. Agreement">
        <p>
          By creating an account, accessing, or using ValleyNote (&quot;Service&quot;),
          you agree to these Terms of Service (&quot;Terms&quot;) and our{" "}
          <Link href="/privacy" className="text-blue hover:underline">
            Privacy Policy
          </Link>
          . If you do not agree, do not use the Service.
        </p>
        <p>
          The Service is provided by <strong className="font-semibold text-ink">Moonlight Valley LLC</strong>{" "}
          (&quot;ValleyNote,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). Questions:{" "}
          <a href="mailto:hello@valleynote.com" className="text-blue hover:underline">
            hello@valleynote.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. The Service">
        <p>
          ValleyNote is a cloud notebook that helps you capture ideas, organize
          notebooks and tags, embed images and media, record voice notes, search
          by meaning, and use AI tools such as rewrite, summarize, auto-title,
          auto-tag, task extraction, and &quot;Ask my notes&quot; (answers grounded in
          your own notebooks).
        </p>
        <p>
          Features, plan limits, and availability may change as we improve the
          product. Some capabilities (for example voice notes, Ask my notes, or
          higher AI allowances) require a paid plan.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts and eligibility">
        <LegalList
          items={[
            "You must provide accurate registration information and keep your credentials secure.",
            "You are responsible for activity under your account.",
            "You must be at least 13 years old (or the minimum age required in your country). If you are under 18, you need a parent or guardian’s permission.",
            "One person or organization should not create accounts solely to abuse free limits or evade suspension.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Your content">
        <p>
          You retain ownership of notes, notebooks, tags, attachments, chat
          prompts, and other materials you upload or create (&quot;User Content&quot;).
        </p>
        <p>
          You grant Moonlight Valley LLC a limited, worldwide, non-exclusive
          license to host, store, process, transmit, and display User Content
          solely to operate and improve the Service for you—including indexing
          notes for search, generating embeddings for Ask my notes, running AI
          writing actions you request, and providing support when you ask.
        </p>
        <p>
          You represent that you have the rights needed to submit User Content
          and that it does not violate law or these Terms.
        </p>
      </LegalSection>

      <LegalSection title="5. AI features">
        <p>
          AI features may process your selected text, notes, voice recordings
          (for transcription), or chat questions through our infrastructure and
          third-party model providers. Outputs can be inaccurate, incomplete, or
          unsuitable for your purpose. You are responsible for reviewing AI
          suggestions before relying on them.
        </p>
        <p>
          We do not sell your private notes, and we do not use your private note
          content to train public AI models. Usage may count against your plan’s
          monthly AI action allowance.
        </p>
      </LegalSection>

      <LegalSection id="billing" title="6. Plans, payments, and billing">
        <p>
          ValleyNote offers a Free plan and paid plans (currently Plus, Pro, and
          custom Enterprise). Limits typically include note count, storage, and
          AI actions per month. Current pricing is shown on our{" "}
          <Link href="/#pricing" className="text-blue hover:underline">
            pricing
          </Link>{" "}
          page and in Settings → Billing.
        </p>
        <LegalList
          items={[
            <>
              <strong className="font-semibold text-ink">Checkout.</strong> Paid
              subscriptions are processed through Whop checkout embedded on
              ValleyNote. By paying, you also agree to Whop’s applicable terms
              and payment provider terms.
            </>,
            <>
              <strong className="font-semibold text-ink">Billing cycles.</strong>{" "}
              Plans may be billed monthly or yearly. Fees are charged in advance
              for each period unless otherwise stated.
            </>,
            <>
              <strong className="font-semibold text-ink">Renewals.</strong> Paid
              subscriptions renew automatically until you cancel.
            </>,
            <>
              <strong className="font-semibold text-ink">Taxes.</strong> Prices
              may exclude applicable taxes, which can be added at checkout.
            </>,
            <>
              <strong className="font-semibold text-ink">Changes.</strong> We may
              change plan prices or features with notice where required. Changes
              usually apply from the next billing period.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Cancellation, refunds, and downgrades">
        <LegalList
          items={[
            "You can cancel a paid subscription from Settings → Billing. Cancellation at period end keeps access until the current period ends.",
            "After cancellation or failed renewal, your account may return to Free plan limits. Excess notes, storage, or AI usage may be restricted until you upgrade or reduce usage.",
            "Except where required by law, subscription fees are generally non-refundable once a billing period has started. If you believe a charge was made in error, contact hello@valleynote.com promptly.",
            "Enterprise / custom agreements may include different commercial terms stated in a separate order or DPA.",
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Acceptable use">
        <p>You agree not to:</p>
        <LegalList
          items={[
            "Use the Service for unlawful, harmful, or fraudulent activity",
            "Upload malware, or attempt to disrupt, scrape, or reverse engineer the Service beyond permitted APIs",
            "Infringe others’ intellectual property, privacy, or publicity rights",
            "Attempt to access another user’s account or content without authorization",
            "Abuse AI features to generate illegal content, spam, or mass automated misuse",
            "Circumvent plan limits, rate limits, or security controls",
          ]}
        />
        <p>
          We may suspend or terminate accounts that violate these Terms or create
          risk for other users or the Service.
        </p>
      </LegalSection>

      <LegalSection title="9. Intellectual property">
        <p>
          ValleyNote, its branding, interface, software, and documentation are
          owned by Moonlight Valley LLC or its licensors. These Terms do not
          transfer ownership of our IP to you. Feedback you share may be used to
          improve the Service without obligation to you.
        </p>
      </LegalSection>

      <LegalSection title="10. Third-party services">
        <p>
          The Service relies on third parties such as hosting providers, email
          delivery, AI model APIs, and Whop for payments. Their services are
          governed by their own terms. We are not responsible for third-party
          outages or policies outside our control, except as required by law.
        </p>
      </LegalSection>

      <LegalSection title="11. Availability and changes">
        <p>
          We aim for reliable uptime but do not guarantee uninterrupted access.
          We may modify, pause, or discontinue features. If we discontinue the
          Service entirely, we will provide reasonable notice when practicable
          and guidance on exporting your content where feasible.
        </p>
      </LegalSection>

      <LegalSection title="12. Disclaimers">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; TO THE MAXIMUM
          EXTENT PERMITTED BY LAW, WE DISCLAIM WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. AI OUTPUTS ARE
          NOT PROFESSIONAL LEGAL, MEDICAL, FINANCIAL, OR OTHER ADVICE.
        </p>
      </LegalSection>

      <LegalSection title="13. Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, MOONLIGHT VALLEY LLC AND ITS
          AFFILIATES WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, DATA, OR
          GOODWILL. OUR TOTAL LIABILITY FOR CLAIMS ARISING OUT OF THE SERVICE
          WILL NOT EXCEED THE AMOUNTS YOU PAID US FOR THE SERVICE IN THE TWELVE
          (12) MONTHS BEFORE THE CLAIM (OR USD $50 IF YOU ARE ON A FREE PLAN).
        </p>
      </LegalSection>

      <LegalSection title="14. Indemnity">
        <p>
          You will defend and indemnify Moonlight Valley LLC against claims
          arising from your User Content, your misuse of the Service, or your
          violation of these Terms or applicable law, to the extent permitted by
          law.
        </p>
      </LegalSection>

      <LegalSection title="15. Termination">
        <p>
          You may stop using the Service at any time. We may suspend or terminate
          access for violation of these Terms, non-payment, prolonged inactivity,
          or to protect the Service. Provisions that by nature should survive
          (including ownership, disclaimers, and liability limits) will survive
          termination.
        </p>
      </LegalSection>

      <LegalSection title="16. Governing law">
        <p>
          These Terms are governed by the laws of the State of Delaware, USA,
          excluding conflict-of-law rules, unless mandatory consumer protections
          in your country of residence require otherwise. Courts in Delaware will
          have exclusive jurisdiction, subject to those mandatory rights.
        </p>
      </LegalSection>

      <LegalSection title="17. Changes to these Terms">
        <p>
          We may update these Terms from time to time. Material changes will be
          posted on this page with an updated effective date. Continued use after
          changes become effective constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="18. Contact">
        <p>
          Moonlight Valley LLC — ValleyNote
          <br />
          Email:{" "}
          <a href="mailto:hello@valleynote.com" className="text-blue hover:underline">
            hello@valleynote.com
          </a>
          <br />
          Or use our{" "}
          <Link href="/contact" className="text-blue hover:underline">
            contact form
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
