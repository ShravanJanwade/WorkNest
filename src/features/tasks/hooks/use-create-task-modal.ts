import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

export const useCreateTaskModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-task",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
  );

  const [parentId, setParentId] = useQueryState(
    "parent-task-id",
    parseAsString.withOptions({ clearOnDefault: true }),
  );

  const open = (id?: string) => {
    setIsOpen(true);

    if (typeof id === "string") {
      setParentId(id);
    } else {
      setParentId(null);
    }
  };

  const close = () => {
    setIsOpen(false);
    setParentId(null);
  };

  return {
    isOpen,
    open,
    close,
    setIsOpen,
    parentId,
  };
};
