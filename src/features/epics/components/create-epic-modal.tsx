"use client";

import { ResponsiveModal } from "@/components/responsive-modal";

import { CreateEpicForm } from "../components/create-epic-form";
import { useCreateEpicModal } from "../hooks/use-create-epic-modal";

export const CreateEpicModal = () => {
  const { isOpen, close, open } = useCreateEpicModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close}>
      <CreateEpicForm onCancel={close} />
    </ResponsiveModal>
  );
};
