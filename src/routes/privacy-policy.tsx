import { Link as RouterLink } from "react-router"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const LAST_UPDATED = "June 27, 2026"
const GRIEVANCE_EMAIL = "programmingnotesbyraj@gmail.com"
const COMPANY_NAME = "AutoInvoice"
const WEBSITE_URL = "https://autoinvoice.app"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3 text-foreground">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function PrivacyPolicy() {
  useDocumentTitle("Privacy Policy")

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10">
          <RouterLink
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </RouterLink>
          <h1 className="mt-6 text-4xl font-bold text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <div className="prose-like">
          <Section title="1. Introduction">
            <p>
              {COMPANY_NAME} ("we", "us", or "our") operates {WEBSITE_URL} (the
              "Service"). This Privacy Policy describes how we collect, use,
              store, and protect your personal information when you use our
              invoicing platform.
            </p>
            <p>
              This policy is published in compliance with the{" "}
              <strong>Information Technology Act, 2000</strong> and the{" "}
              <strong>
                Information Technology (Reasonable Security Practices and
                Procedures and Sensitive Personal Data or Information) Rules,
                2011
              </strong>{" "}
              (SPDI Rules), and is aligned with the{" "}
              <strong>Digital Personal Data Protection Act, 2023</strong> (DPDP
              Act) and the{" "}
              <strong>Digital Personal Data Protection Rules, 2025</strong>{" "}
              notified by the Ministry of Electronics and Information Technology
              (MeitY).
            </p>
            <p>
              By registering for or using the Service, you consent to the
              collection and use of your information as described in this
              Privacy Policy.
            </p>
          </Section>

          <Section title="2. Data We Collect">
            <p>We collect the following categories of personal data:</p>

            <div className="rounded-lg border bg-muted/30 overflow-hidden mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Data
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Why we collect it
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-3">Full name, email address</td>
                    <td className="px-4 py-3">Personal data</td>
                    <td className="px-4 py-3">
                      Account creation and identification
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Password (hashed)</td>
                    <td className="px-4 py-3">Account security</td>
                    <td className="px-4 py-3">Authentication</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Business name, owner name</td>
                    <td className="px-4 py-3">Business data</td>
                    <td className="px-4 py-3">
                      Populating invoices and documents
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      Phone number, business address
                    </td>
                    <td className="px-4 py-3">Personal data</td>
                    <td className="px-4 py-3">
                      Contact and invoice generation
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-foreground">
                      GST number
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      Sensitive personal data (SPDI)
                    </td>
                    <td className="px-4 py-3">
                      GST-compliant invoice generation
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Customer names, contacts</td>
                    <td className="px-4 py-3">Third-party personal data</td>
                    <td className="px-4 py-3">
                      Managing your customer records
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Invoice and transaction data</td>
                    <td className="px-4 py-3">Financial data</td>
                    <td className="px-4 py-3">Invoice history and insights</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-3">
              <strong className="text-foreground">Note on SPDI:</strong> Your
              GST number constitutes Sensitive Personal Data or Information
              (SPDI) under the IT Rules. We collect it only with your explicit
              consent and solely for the purpose of generating GST-compliant
              invoices.
            </p>
          </Section>

          <Section title="3. How We Use Your Data">
            <p>
              We use your personal data strictly for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Creating and managing your {COMPANY_NAME} account</li>
              <li>
                Generating invoices, quotations, challans, and proforma
                documents
              </li>
              <li>Sending payment reminders via WhatsApp to your customers</li>
              <li>Providing insights and reports on your business activity</li>
              <li>Responding to your support requests</li>
              <li>
                Sending product updates and tips (only if you have subscribed)
              </li>
              <li>
                Complying with applicable Indian laws and legal obligations
              </li>
            </ul>
            <p>
              We follow the principle of{" "}
              <strong className="text-foreground">data minimisation</strong> —
              we collect only what is necessary for the purposes stated above.
            </p>
          </Section>

          <Section title="4. Legal Basis for Processing">
            <p>
              Under the DPDP Act, 2023, we process your personal data based on:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                <strong className="text-foreground">Consent</strong> — you
                provide consent at registration and when entering business
                details
              </li>
              <li>
                <strong className="text-foreground">
                  Contractual necessity
                </strong>{" "}
                — processing required to deliver the Service you signed up for
              </li>
              <li>
                <strong className="text-foreground">Legal obligation</strong> —
                when we are required to retain records under Indian tax or
                company law
              </li>
            </ul>
            <p>
              You may withdraw your consent at any time by deleting your account
              (see Section 8).
            </p>
          </Section>

          <Section title="5. Third-Party Sharing">
            <p>
              We do <strong className="text-foreground">not sell</strong> your
              personal data to any third party. We share data only in the
              following limited circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                <strong className="text-foreground">WhatsApp</strong> — when you
                choose to send reminders to customers via WhatsApp, their phone
                number and reminder message are transmitted to WhatsApp servers
                (operated by Meta Platforms, Inc.). This transmission is
                governed by WhatsApp's own Privacy Policy.
              </li>
              <li>
                <strong className="text-foreground">
                  Cloud infrastructure providers
                </strong>{" "}
                — our hosting providers may process data on our behalf under
                strict confidentiality terms.
              </li>
              <li>
                <strong className="text-foreground">Legal requirements</strong>{" "}
                — if required by a court order, government authority, or
                applicable Indian law.
              </li>
            </ul>
            <p>
              We obtain your prior permission before disclosing your SPDI to any
              third party, except where disclosure is mandated by law.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your personal data for as long as your account is active
              or as needed to provide the Service. Specifically:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                Account data is deleted within{" "}
                <strong className="text-foreground">30 days</strong> of account
                deletion
              </li>
              <li>
                Invoice records may be retained for up to{" "}
                <strong className="text-foreground">7 years</strong> where
                required under the Income Tax Act, 1961 or GST laws
              </li>
              <li>
                Anonymised or aggregated data (with no personal identifiers) may
                be retained indefinitely for analytics
              </li>
            </ul>
            <p>
              After the retention period, data is securely deleted or
              anonymised.
            </p>
          </Section>

          <Section title="7. Security Practices">
            <p>
              We implement reasonable security practices and procedures as
              required under the IT (SPDI) Rules, 2011, including:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                All passwords are stored using industry-standard hashing
                (bcrypt)
              </li>
              <li>Data in transit is encrypted using TLS/HTTPS at all times</li>
              <li>Access controls limit who can view personal data</li>
              <li>Regular security reviews of our infrastructure and code</li>
            </ul>
            <p>
              In the event of a data breach that may affect your rights or
              interests, we will notify you and the Data Protection Board of
              India (once operational) within{" "}
              <strong className="text-foreground">72 hours</strong> of becoming
              aware of it, as required by the DPDP Act.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>
              Under the DPDP Act, 2023 and the IT Rules, you have the following
              rights as a Data Principal:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                <strong className="text-foreground">Right to access</strong> —
                request a summary of the personal data we hold about you
              </li>
              <li>
                <strong className="text-foreground">Right to correction</strong>{" "}
                — update your account and business details at any time from your
                Profile settings
              </li>
              <li>
                <strong className="text-foreground">Right to erasure</strong> —
                delete your account and all associated data via the Danger Zone
                in your Profile settings
              </li>
              <li>
                <strong className="text-foreground">
                  Right to withdraw consent
                </strong>{" "}
                — stop using the Service and delete your account at any time
              </li>
              <li>
                <strong className="text-foreground">
                  Right to grievance redressal
                </strong>{" "}
                — raise a complaint with our Grievance Officer (see Section 10)
              </li>
            </ul>
            <p>
              We will respond to all data rights requests within{" "}
              <strong className="text-foreground">30 days</strong> of receipt.
            </p>
          </Section>

          <Section title="9. Cookies">
            <p>
              We use only essential cookies necessary for authentication and
              maintaining your session. We do not use tracking or advertising
              cookies. You can control cookie settings through your browser, but
              disabling essential cookies may prevent you from logging in.
            </p>
          </Section>

          <Section title="10. Grievance Officer">
            <p>
              In accordance with the Information Technology Act, 2000 and the
              SPDI Rules, 2011, we have designated a Grievance Officer to
              address any complaints or concerns regarding the processing of
              your personal data.
            </p>
            <div className="rounded-lg border bg-muted/30 p-4 mt-3">
              <p className="font-semibold text-foreground">Grievance Officer</p>
              <p className="mt-1">{COMPANY_NAME}</p>
              <p>
                Email:{" "}
                <a
                  href={`mailto:${GRIEVANCE_EMAIL}`}
                  className="text-primary underline underline-offset-4"
                >
                  {GRIEVANCE_EMAIL}
                </a>
              </p>
              <p className="mt-2 text-sm">
                We will acknowledge your grievance within{" "}
                <strong className="text-foreground">7 days</strong> and resolve
                it within <strong className="text-foreground">30 days</strong>{" "}
                of receipt.
              </p>
            </div>
            <p className="mt-3">
              If you are not satisfied with our response, you may escalate your
              complaint to the{" "}
              <strong className="text-foreground">
                Data Protection Board of India
              </strong>{" "}
              once it becomes operational under the DPDP Act.
            </p>
          </Section>

          <Section title="11. Children's Privacy">
            <p>
              {COMPANY_NAME} is not directed at children under the age of 18. We
              do not knowingly collect personal data from minors. If you believe
              a minor has provided us with personal data, please contact our
              Grievance Officer and we will delete it promptly.
            </p>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do,
              we will revise the "Last updated" date at the top of this page and
              notify you via email if the changes are material. Your continued
              use of the Service after any changes constitutes your acceptance
              of the updated policy.
            </p>
          </Section>

          <Section title="13. Contact Us">
            <p>
              For any questions about this Privacy Policy or how we handle your
              data, please contact:
            </p>
            <div className="rounded-lg border bg-muted/30 p-4 mt-3">
              <p className="font-semibold text-foreground">{COMPANY_NAME}</p>
              <p>
                Email:{" "}
                <a
                  href={`mailto:${GRIEVANCE_EMAIL}`}
                  className="text-primary underline underline-offset-4"
                >
                  {GRIEVANCE_EMAIL}
                </a>
              </p>
            </div>
          </Section>
        </div>

        <div className="mt-12 pt-6 border-t text-center">
          <RouterLink
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </RouterLink>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
