import { PageHeader, Block } from "@/components/admin/PageHeader";
import { CopyForm, ListManager } from "@/components/admin/ModuleSections";

export const metadata = { title: "Testimonials & Reviews" };

export default function TestimonialsPage() {
  return (
    <>
      <PageHeader title="Testimonials & Reviews" description="Visitors can leave a review on the website. Each one waits here as “Pending” and is shown publicly only after you approve it. Never publish anything that is not a genuine review." />
      <ListManager id="testimonials" title="Reviews" />
      <Block>
        <CopyForm id="reviewsCopy" title="Reviews section text" description="The heading and introduction of the “Leave a review” section." />
      </Block>
    </>
  );
}
