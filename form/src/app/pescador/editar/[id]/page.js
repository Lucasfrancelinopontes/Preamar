import CadastroPescador from "../../page";

export default async function EditarPescadorPage({ params }) {
    const resolvedParams = await params;
    return <CadastroPescador editId={resolvedParams?.id} />;
}
