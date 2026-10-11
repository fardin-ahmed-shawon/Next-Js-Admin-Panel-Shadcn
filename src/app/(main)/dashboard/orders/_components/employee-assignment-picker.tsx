"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AssignmentEmployee = {
  id: number;
  full_name: string;
  employee_detail?: {
    department_id?: number | null;
    designation_id?: number | null;
    department?: { id?: number; name: string } | null;
    designation?: { id?: number; title: string } | null;
  } | null;
};

export function EmployeeAssignmentPicker({
  employees,
  value,
  onChange,
  loading,
  disabled,
  allowUnassigned = false,
}: {
  employees: AssignmentEmployee[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  disabled?: boolean;
  allowUnassigned?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [designation, setDesignation] = useState("all");
  const [sort, setSort] = useState("name");
  const deptKey = (employee: AssignmentEmployee) =>
    String(employee.employee_detail?.department_id ?? employee.employee_detail?.department?.id ?? "none");
  const desigKey = (employee: AssignmentEmployee) =>
    String(employee.employee_detail?.designation_id ?? employee.employee_detail?.designation?.id ?? "none");
  const departments = useMemo(
    () =>
      Array.from(
        new Map(
          employees.map((employee) => [
            deptKey(employee),
            employee.employee_detail?.department?.name || "No department",
          ]),
        ).entries(),
      ).sort((a, b) => a[1].localeCompare(b[1])),
    [employees],
  );
  const departmentEmployees = employees.filter((employee) => department === "all" || deptKey(employee) === department);
  const designations = Array.from(
    new Map(
      departmentEmployees.map((employee) => [
        desigKey(employee),
        employee.employee_detail?.designation?.title || "No designation",
      ]),
    ).entries(),
  ).sort((a, b) => a[1].localeCompare(b[1]));
  const filtered = departmentEmployees
    .filter(
      (employee) =>
        (designation === "all" || desigKey(employee) === designation) &&
        [
          employee.full_name,
          String(employee.id),
          employee.employee_detail?.department?.name,
          employee.employee_detail?.designation?.title,
        ].some((text) => text?.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())),
    )
    .sort((a, b) => {
      const primary =
        sort === "department"
          ? (a.employee_detail?.department?.name || "").localeCompare(b.employee_detail?.department?.name || "")
          : sort === "designation"
            ? (a.employee_detail?.designation?.title || "").localeCompare(b.employee_detail?.designation?.title || "")
            : 0;
      return primary || a.full_name.localeCompare(b.full_name);
    });
  const selected = employees.find((employee) => String(employee.id) === value);
  const filteredSelection = selected && !filtered.some((employee) => employee.id === selected.id);
  const unavailableSelection = value && value !== "unassigned" && !loading && !selected;
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Search employees</Label>
        <Input
          aria-label="Search employees"
          placeholder="Name, user ID, department or designation"
          value={search}
          disabled={disabled}
          onChange={(event) => {
            setSearch(event.target.value);
            onChange("");
          }}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Department</Label>
          <Select
            value={department}
            disabled={disabled || loading}
            onValueChange={(next) => {
              setDepartment(next);
              setDesignation("all");
              onChange("");
            }}
          >
            <SelectTrigger aria-label="Filter department" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Designation</Label>
          <Select
            value={designation}
            disabled={disabled || loading}
            onValueChange={(next) => {
              setDesignation(next);
              onChange("");
            }}
          >
            <SelectTrigger aria-label="Filter designation" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All designations</SelectItem>
              {designations.map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {loading ? "Loading employees…" : filtered.length + " matching employees"}
        </p>
        <Select value={sort} onValueChange={setSort} disabled={disabled}>
          <SelectTrigger aria-label="Sort employees" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by name</SelectItem>
            <SelectItem value="department">Sort by department</SelectItem>
            <SelectItem value="designation">Sort by designation</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Employee</Label>
        <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
          <SelectTrigger aria-label="Choose employee" className="w-full">
            <SelectValue placeholder="Choose employee" />
          </SelectTrigger>
          <SelectContent>
            {allowUnassigned && <SelectItem value="unassigned">Unassigned — remove this assignment</SelectItem>}
            {filteredSelection && <SelectItem value={value}>{selected.full_name} (current selection)</SelectItem>}
            {unavailableSelection && (
              <SelectItem value={value} disabled>
                Current employee is no longer eligible
              </SelectItem>
            )}
            {filtered.map((employee) => (
              <SelectItem key={employee.id} value={String(employee.id)}>
                {[
                  employee.full_name,
                  employee.employee_detail?.department?.name,
                  employee.employee_detail?.designation?.title,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {!loading && filtered.length === 0 && (
        <p className="text-xs text-muted-foreground">No employees match these filters.</p>
      )}
      {(search || department !== "all" || designation !== "all") && (
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-xs"
          disabled={disabled}
          onClick={() => {
            setSearch("");
            setDepartment("all");
            setDesignation("all");
            onChange("");
          }}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
