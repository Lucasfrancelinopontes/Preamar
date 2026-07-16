import CadastroPescador from "../../page";

export default function EditarPescadorPage({ params }) {
    return <CadastroPescador editId={params.id} />;
}
