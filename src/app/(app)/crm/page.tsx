import { CrmView } from "@/components/crm/crm-view";
import { getCrmLeads } from "@/lib/actions/crm";

export default async function CrmPage() {
    const leads = await getCrmLeads();

    return <CrmView initialLeads={leads} />;
}
