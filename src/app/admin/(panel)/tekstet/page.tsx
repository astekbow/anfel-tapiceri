import { getSettings, textSections } from "@/lib/settings";
import SettingsSectionForm from "@/components/admin/SettingsSectionForm";

export default async function AdminTextsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-pine">Tekstet e faqes</h1>
      <p className="mt-2 text-[15px] text-mink">
        Çdo titull, paragraf dhe foto e faqes publike ndryshohet këtu. Hapni një seksion, bëni
        ndryshimet dhe klikoni &quot;Ruaj seksionin&quot;.
      </p>
      <div className="mt-6 space-y-3">
        {textSections.map((section, index) => (
          <SettingsSectionForm
            key={section.id}
            section={section}
            values={settings}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
