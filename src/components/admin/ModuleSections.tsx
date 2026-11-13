import { SINGLETONS, RESOURCES } from "@/admin/registry";
import { loadOptions, loadResource, loadSingleton } from "@/admin/data";
import { ResourceManager } from "./ResourceManager";
import { SingletonForm } from "./SingletonForm";
import { Block } from "./PageHeader";

/** Server components that load the data for one form / one list and hand it to the client editor. */
export async function CopyForm({ id, title, description }: { id: string; title?: string; description?: string }) {
  const def = { ...SINGLETONS[id] };
  if (title) def.title = title;
  if (description) def.description = description;
  return <SingletonForm def={def} row={await loadSingleton(def)} />;
}

export async function ListManager({ id, title, description }: { id: string; title?: string; description?: string }) {
  const def = RESOURCES[id];
  const [{ rows, childRows }, options] = await Promise.all([loadResource(def), loadOptions()]);
  return (
    <Block title={title ?? `Manage ${def.plural}`} description={description ?? def.description}>
      <ResourceManager def={def} rows={rows} childRows={childRows} options={options} />
    </Block>
  );
}
