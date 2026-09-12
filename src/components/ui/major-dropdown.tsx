"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CustomDropdown } from "./custom-dropdown";

const majorNames: Record<string, string> = {
  Computer_Science: "Computer Science",
  Information_Systems: "Information Systems",
  Artificial_Intelligence: "Artificial Intelligence",
  Decision_Support_and_Operations_Research: "Decision Support & Operations Research",
  Information_Technology: "Information Technology",
};

export function MajorDropdown({ currentId }: { currentId: string }) {
  const router = useRouter();

  const options = Object.entries(majorNames).map(([id, name]) => ({ id, name }));

  return (
    <CustomDropdown
      value={currentId}
      options={options}
      onChange={(newId) => router.push(`/majors/${newId}`)}
      triggerStyle={{
        background: 'rgba(128,128,128,0.1)',
        border: 'none',
        borderRadius: '9999px',
        padding: '0.5rem 1rem',
        fontWeight: 500,
        width: 'auto'
      }}
      dropdownStyle={{
        minWidth: '200px',
        right: 0,
        left: 'auto',
        borderRadius: '1rem'
      }}
    />
  );
}
