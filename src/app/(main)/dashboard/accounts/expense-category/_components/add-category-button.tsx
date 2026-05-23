"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CategoryDialog } from "./category-dialog";

export function AddCategoryButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 size-4" />
        Add Category
      </Button>
      <CategoryDialog
        open={open}
        onOpenChange={setOpen}
        mode="add"
      />
    </>
  );
}
