import { ChurchForm } from "../../ChurchForm";
import { createChurchAction } from "../../actions";

export default function NewChurchPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold">Nova igreja</h1>
      <ChurchForm action={createChurchAction} submitLabel="Criar igreja" withChurch withAdmin />
    </div>
  );
}
