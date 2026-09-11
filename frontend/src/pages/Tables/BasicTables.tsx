import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="العملاء | CRM"
        description="قائمة عملاء نظام إدارة علاقات العملاء"
      />
      <PageBreadcrumb pageTitle="العملاء" />
      <div className="space-y-6">
        <ComponentCard title="قائمة العملاء">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
