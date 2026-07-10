import type { DemoChoice, DemoNode } from "@/lib/types";
import { Section } from "@/components/admin/node-editor-ui";

export function ChoiceEditor({
  choices,
  nodes,
  onUpdateChoice,
  onDeleteChoice,
}: {
  choices: DemoChoice[];
  nodes: DemoNode[];
  onUpdateChoice: (index: number, patch: Partial<DemoChoice>) => void;
  onDeleteChoice: (index: number) => void;
}) {
  return (
    <Section title="选项和走向">
      <div className="grid gap-3">
        {choices.length === 0 ? (
          <p className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-500">
            这个节点还没有选项。点击“添加选项”或“添加剧情”开始延展。
          </p>
        ) : null}

        {choices.map((choice, index) => (
          <div
            key={choice.id}
            className="grid gap-2 rounded-lg bg-zinc-50 p-3 md:grid-cols-[1fr_190px_auto]"
          >
            <input
              value={choice.text}
              onChange={(event) =>
                onUpdateChoice(index, { text: event.target.value })
              }
              className="input"
            />
            <select
              value={choice.nextNodeId}
              onChange={(event) =>
                onUpdateChoice(index, { nextNodeId: event.target.value })
              }
              className="input"
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onDeleteChoice(index)}
              className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              删除
            </button>
            <textarea
              value={choice.description}
              onChange={(event) =>
                onUpdateChoice(index, { description: event.target.value })
              }
              rows={2}
              className="input md:col-span-3"
            />
          </div>
        ))}
      </div>
    </Section>
  );
}
