import { Icon } from "@whb/ui";
import { requireAuthenticatedSession } from "@/lib/dashboard-data";
import { getFamilyLibrary } from "@/lib/library-data";
import { countMonthlyGenerations, MONTHLY_QUIZ_CREDITS } from "@/lib/learning";
import { ParentSidebar } from "@/components/parent-sidebar";
import { Brand } from "@/components/brand";
import { UploadPanel } from "@/components/library/upload-panel";
import { ContentReview, GenerationStatusCard } from "@/components/library/content-review";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function ParentLibraryPage() {
  const user = await requireAuthenticatedSession();
  const library = await getFamilyLibrary(user.id);
  const creditsUsed = library.familyId ? await countMonthlyGenerations(library.familyId) : 0;

  return (
    <div className="lg:flex max-w-shell mx-auto min-h-dvh">
      <ParentSidebar activeId="uploads" tagline={library.familyName} />

      <div className="flex-1 px-margin-mobile md:px-margin-tablet lg:px-margin-desktop">
        <div className="lg:hidden pt-unit-6">
          <Brand size="md" href="/parent" />
        </div>

        <header className="flex flex-col max-w-2xl pb-unit-8 pt-unit-6 lg:pt-unit-8 gap-unit-2">
          <div className="flex items-center gap-unit-2 text-label-sm text-secondary">
            <Icon name="upload_file" size={16} />
            <span>Learning Library</span>
          </div>
          <h1 className="font-display text-headline-lg text-on-surface tracking-tight leading-tight">
            Uploads &amp; Review
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Every AI-generated quiz waits here until you approve it. Nothing reaches a
            learner board without your sign-off.
          </p>
        </header>

        <section className="bg-surface-container-lowest rounded-xl p-unit-6 shadow-card mb-unit-8">
          {library.learners.length === 0 ? (
            <div className="flex flex-col items-center gap-unit-3 text-center py-unit-6">
              <Icon name="family_restroom" size={28} className="text-outline" />
              <p className="text-body-sm text-on-surface-variant max-w-sm">
                Add a learner on the overview page before uploading worksheets.
              </p>
            </div>
          ) : (
            <UploadPanel
              learners={library.learners.map((learner) => ({
                id: learner.id,
                fullName: learner.fullName,
              }))}
              creditsUsed={creditsUsed}
              creditsLimit={MONTHLY_QUIZ_CREDITS}
            />
          )}
        </section>

        <section className="flex flex-col gap-unit-4 pb-unit-12">
          <h2 className="font-display text-headline-sm text-on-surface px-unit-1">
            Material history
          </h2>

          {library.materials.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-unit-8 shadow-card text-center flex flex-col items-center gap-unit-3">
              <Icon name="folder_open" size={28} className="text-outline" />
              <p className="text-body-sm text-on-surface-variant">
                No worksheets yet. Your first upload starts the board.
              </p>
            </div>
          ) : (
            library.materials.map((material) => (
              <article
                key={material.id}
                className="bg-surface-container-lowest rounded-xl p-unit-6 shadow-card flex flex-col gap-unit-4"
              >
                <div className="flex items-start justify-between gap-unit-3 flex-wrap">
                  <div className="flex items-center gap-unit-3 min-w-0">
                    <div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <Icon name="description" size={20} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-label-md text-on-surface truncate">
                        {material.fileName}
                      </span>
                      <span className="text-label-sm text-secondary">
                        {formatBytes(material.sizeBytes)} ·{" "}
                        {new Date(material.createdAt).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  {material.extractionState === "FAILED" ? (
                    <span className="text-label-sm text-error">
                      {material.failureReason ?? "Could not read this file."}
                    </span>
                  ) : null}
                </div>

                {material.contents.length === 0 ? (
                  <p className="text-label-sm text-secondary italic">
                    No generation requested for this upload yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-unit-3">
                    {material.contents.map((content) =>
                      content.generationState === "READY" &&
                      content.reviewState === "PENDING_REVIEW" ? (
                        <ContentReview key={content.id} content={content} />
                      ) : (
                        <GenerationStatusCard key={content.id} content={content} />
                      ),
                    )}
                  </div>
                )}
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
