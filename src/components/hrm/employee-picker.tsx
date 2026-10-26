"use client";

import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty } from "@/components/ui/combobox";

export type PickerEmployee = { id: number; full_name: string; employee_detail?: {
  employee_id?: string; department_id?: number; designation_id?: number;
  department?: { name: string }; designation?: { title: string };
} };

export function EmployeePicker({ employees, value, onChange }: { employees: PickerEmployee[]; value: string; onChange: (value: string) => void }) {
  const popupContainer = useRef<HTMLDivElement>(null);
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const departments = Array.from(new Map(employees.filter(e => e.employee_detail?.department_id).map(e => [e.employee_detail!.department_id!, e.employee_detail!.department?.name || "Department"])).entries());
  const designations = Array.from(new Map(employees.filter(e => e.employee_detail?.designation_id && (!department || String(e.employee_detail.department_id) === department)).map(e => [e.employee_detail!.designation_id!, e.employee_detail!.designation?.title || "Designation"])).entries());
  const options = employees.filter(e => (!department || String(e.employee_detail?.department_id) === department) && (!designation || String(e.employee_detail?.designation_id) === designation)).sort((a,b) => a.full_name.localeCompare(b.full_name));
  const selected = employees.find(e => String(e.id) === value) || null;
  return <div ref={popupContainer} className="space-y-2">
    <div className="grid grid-cols-2 gap-2">
      <select aria-label="Filter employees by department" className="h-9 min-w-0 rounded-md border bg-background px-2 text-sm" value={department} onChange={e => {setDepartment(e.target.value);setDesignation("");onChange("");}}><option value="">All departments</option>{departments.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
      <select aria-label="Filter employees by designation" className="h-9 min-w-0 rounded-md border bg-background px-2 text-sm" value={designation} onChange={e => {setDesignation(e.target.value);onChange("");}}><option value="">All designations</option>{designations.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
    </div>
    <Label>Employee</Label>
    <Combobox items={options} value={selected} onValueChange={employee => onChange(employee ? String(employee.id) : "")}
      itemToStringLabel={employee => employee.full_name} itemToStringValue={employee => String(employee.id)}>
      <ComboboxInput aria-label="Search and select employee" placeholder="Search employee name…" className="w-full" showClear />
      <ComboboxContent portalContainer={popupContainer}><ComboboxEmpty>No matching employees.</ComboboxEmpty><ComboboxList>{(employee: PickerEmployee) => <ComboboxItem key={employee.id} value={employee}><div><p>{employee.full_name}</p><p className="text-xs text-muted-foreground">{[employee.employee_detail?.employee_id, employee.employee_detail?.department?.name, employee.employee_detail?.designation?.title].filter(Boolean).join(" · ")}</p></div></ComboboxItem>}</ComboboxList></ComboboxContent>
    </Combobox>
    <p className="text-xs text-muted-foreground">{selected ? "Selected: " + selected.full_name : "Choose an employee from the suggestions."}</p>
  </div>;
}
