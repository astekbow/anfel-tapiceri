import { getSettings, basicSections } from "@/lib/settings";
import SettingsSectionForm from "@/components/admin/SettingsSectionForm";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-pine">Cilësimet</h1>
      <p className="mt-2 text-[15px] text-mink">
        Logoja, kontaktet dhe rrjetet sociale — këto shfaqen në header, footer dhe faqen e kontaktit.
      </p>

      <div className="mt-6 space-y-3">
        {basicSections.map((section, index) => (
          <SettingsSectionForm
            key={section.id}
            section={section}
            values={settings}
            defaultOpen={index === 0}
          />
        ))}

        <details className="group rounded-2xl border border-seam bg-ivory open:border-camel/50">
          <summary className="flex cursor-pointer select-none items-center justify-between px-5 py-4 [&::-webkit-details-marker]:hidden">
            <span className="font-display text-lg text-walnut">Fjalëkalimi i adminit</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 shrink-0 text-mink transition-transform group-open:rotate-180"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <div className="border-t border-seam px-5 py-5">
            <ChangePasswordForm />
          </div>
        </details>
      </div>
    </div>
  );
}
