import Link from "next/link";
import LegalPageShell, {
  LegalList,
  LegalSection,
} from "@/components/legal/LegalPageShell";

export const metadata = {
  title: "Privacy Policy — ValleyNote",
  description:
    "Privacy Policy for ValleyNote by Moonlight Valley LLC. How we collect, use, and protect your notes, account data, and billing information.",
};

const EFFECTIVE_DATE = "November 6, 2026";

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Privacy Policy"
      description="This Policy explains how Moonlight Valley LLC collects, uses, and shares information when you use ValleyNote."
      effectiveDate={EFFECTIVE_DATE}
    >
      <LegalSection title="1. Who we are">
        <p>
          ValleyNote is operated by <strong className="font-semibold text-ink">Moonlight Valley LLC</strong>{" "}
          (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). For privacy requests, email{" "}
          <a href="mailto:hello@valleynote.com" className="text-blue hover:underline">
            hello@valleynote.com
          </a>{" "}
          or use our{" "}
          <Link href="/contact" className="text-blue hover:underline">
            contact form
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>
          <strong className="font-semibold text-ink">Account information.</strong>{" "}
          Name, email address, password (stored hashed), optional profile image,
          locale/theme preferences, and email verification status.
        </p>
        <p>
          <strong className="font-semibold text-ink">Notebook content.</strong>{" "}
          Notes, notebooks, tags, versions/history, attachments (images and
          other uploads), video embeds you add, voice recordings and
          transcripts, chat threads with Ask my notes, and related metadata such
          as favorites or trash state.
        </p>
        <p>
          <strong className="font-semibold text-ink">AI &amp; search data.</strong>{" "}
          Text or audio you send to AI features; embeddings and chunks derived
          from your notes so semantic search and Ask my notes can work; AI usage
          counters for plan limits.
        </p>
        <p>
          <strong className="font-semibold text-ink">Session &amp; device data.</strong>{" "}
          Session tokens, approximate IP address, and user agent for signed-in
          sessions and security (for example viewing and revoking active
          sessions in Settings).
        </p>
        <p>
          <strong className="font-semibold text-ink">Billing data.</strong> Plan,
          subscription status, renewal/cancellation flags, and Whop membership
          or payment identifiers needed to fulfill purchases. Card details are
          handled by Whop and its payment processors—we do not store full card
          numbers on ValleyNote servers.
        </p>
        <p>
          <strong className="font-semibold text-ink">Communications.</strong>{" "}
          Messages you send via the contact form or support email, and
          transactional emails (verification, password reset, billing-related
          notices).
        </p>
        <p>
          <strong className="font-semibold text-ink">Usage &amp; diagnostics.</strong>{" "}
          Limited product analytics and logs (for example feature errors or
          health checks) to keep the Service reliable and secure.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use information">
        <LegalList
          items={[
            "Provide, sync, and secure your notebooks and account",
            "Power AI writing tools, transcription, summarization, auto-title/tag, task extraction, semantic search, and Ask my notes",
            "Enforce Free / Plus / Pro / Enterprise plan limits (notes, storage, AI actions)",
            "Process subscriptions and fulfill payments via Whop",
            "Send essential service emails and respond to support requests",
            "Detect abuse, prevent fraud, and comply with legal obligations",
            "Improve product quality using aggregated or de-identified insights where possible",
          ]}
        />
        <p>
          We do <strong className="font-semibold text-ink">not</strong> sell your
          personal information or private note content. We do{" "}
          <strong className="font-semibold text-ink">not</strong> use your
          private notes to train public AI models.
        </p>
      </LegalSection>

      <LegalSection title="4. AI processing">
        <p>
          When you use AI features, relevant portions of your content may be
          sent to third-party model providers solely to generate the response or
          embedding you requested. Providers process that data under their terms
          and our configuration. You should avoid pasting secrets or regulated
          data into notes or prompts unless you accept that risk.
        </p>
        <p>
          Ask my notes answers from your own notebooks and is designed to cite
          the notes it used. It is not a general web search engine.
        </p>
      </LegalSection>

      <LegalSection title="5. How we share information">
        <p>We share information only as needed to run ValleyNote:</p>
        <LegalList
          items={[
            "Infrastructure and database hosting providers",
            "AI / transcription / embedding providers for requested features",
            "Email delivery providers for transactional mail",
            "Whop and payment processors for checkout and subscription management",
            "Professional advisors or authorities when required by law or to protect rights and safety",
            "A successor entity if we are involved in a merger, acquisition, or asset transfer (with notice where required)",
          ]}
        />
        <p>
          We do not share your notebooks with other ValleyNote users unless you
          explicitly use a future sharing feature designed for that purpose.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies and similar technologies">
        <p>
          We use essential cookies and similar storage for authentication,
          session security, and basic preferences. These are required for the
          Service to function. We do not use third-party advertising cookies to
          track you across unrelated sites.
        </p>
      </LegalSection>

      <LegalSection title="7. Data retention">
        <p>
          We keep account and note data while your account is active. Deleted
          notes may remain in trash for a period before permanent deletion.
          Backups and logs may persist for a limited time. Billing records may be
          retained as needed for accounting, fraud prevention, and legal
          compliance. You may request account deletion by contacting us.
        </p>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>
          We use industry-standard measures such as encrypted transport (HTTPS),
          hashed passwords, and access controls. No method of transmission or
          storage is 100% secure. Please use a strong unique password and protect
          your devices.
        </p>
      </LegalSection>

      <LegalSection title="9. Your choices and rights">
        <LegalList
          items={[
            "Access and update profile details in Settings",
            "Export or copy note content using available product tools, or request help via support",
            "Cancel subscriptions and manage sessions in Settings",
            "Request correction, deletion, or a copy of personal data where applicable law grants those rights",
            "Opt out of non-essential marketing emails if we send them (transactional mail will continue)",
          ]}
        />
        <p>
          Depending on where you live (for example the EEA, UK, or certain US
          states), you may have additional rights. Contact{" "}
          <a href="mailto:hello@valleynote.com" className="text-blue hover:underline">
            hello@valleynote.com
          </a>{" "}
          to exercise them. We may need to verify your request.
        </p>
      </LegalSection>

      <LegalSection title="10. International transfers">
        <p>
          We may process and store information in the United States and other
          countries where we or our processors operate. Where required, we use
          appropriate safeguards for cross-border transfers.
        </p>
      </LegalSection>

      <LegalSection title="11. Children’s privacy">
        <p>
          ValleyNote is not directed to children under 13. We do not knowingly
          collect personal information from children under 13. If you believe a
          child has provided us data, contact us and we will take appropriate
          steps to delete it.
        </p>
      </LegalSection>

      <LegalSection title="12. Enterprise customers">
        <p>
          Organizations on Enterprise plans may receive additional contractual
          terms, including a Data Processing Agreement (DPA) where appropriate.
          Contact us via{" "}
          <Link href="/contact" className="text-blue hover:underline">
            Contact
          </Link>{" "}
          to discuss security reviews and custom agreements.
        </p>
      </LegalSection>

      <LegalSection title="13. Changes to this Policy">
        <p>
          We may update this Privacy Policy from time to time. The effective date
          at the top will change when we do. Continued use of ValleyNote after an
          update means you acknowledge the revised Policy.
        </p>
      </LegalSection>

      <LegalSection title="14. Contact">
        <p>
          Moonlight Valley LLC — ValleyNote Privacy
          <br />
          Email:{" "}
          <a href="mailto:hello@valleynote.com" className="text-blue hover:underline">
            hello@valleynote.com
          </a>
          <br />
          Related:{" "}
          <Link href="/terms" className="text-blue hover:underline">
            Terms of Service
          </Link>
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
