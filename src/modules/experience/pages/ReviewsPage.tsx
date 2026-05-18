import { reviews } from '../experienceData';
import { ExperienceLayout } from '../components/ExperienceLayout';

export function ReviewsPage() {
  return (
    <ExperienceLayout title="Avaliacoes">
      <section className="space-y-3">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-text-primary">{review.target}</p>
                <p className="text-sm text-text-secondary">{review.author}</p>
              </div>
              <p className="font-semibold text-brand-primary">{review.rating}/5</p>
            </div>
            <p className="mt-3 text-sm text-text-secondary">{review.body}</p>
          </article>
        ))}
      </section>
    </ExperienceLayout>
  );
}
