import { PageHeader, Block } from "@/components/admin/PageHeader";
import { CopyForm } from "@/components/admin/ModuleSections";

export const metadata = { title: "Company Content" };

export default function CompanyPage() {
  return (
    <>
      <PageHeader title="Company Content" description="The main wording of the home page: the opening, the company introduction and the closing commitment. Each box saves on its own and updates the website straight away." />
      <div className="space-y-8">
        <Block><CopyForm id="hero" /></Block>
        <Block><CopyForm id="about" /></Block>
        <Block><CopyForm id="commitment" /></Block>
        <Block><CopyForm id="contactCopy" /></Block>
      </div>
    </>
  );
}
