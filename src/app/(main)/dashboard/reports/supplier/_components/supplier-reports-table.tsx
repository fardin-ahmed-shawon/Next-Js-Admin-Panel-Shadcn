"use client";

import * as React from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Users, Phone, Mail, MapPin, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { SupplierReportItem } from "@/hooks/useSupplierReports";

interface SupplierReportsTableProps {
  data: SupplierReportItem[];
  isLoading: boolean;
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;

  // Filters & Sorting
  searchVal: string;
  setSearchVal: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortDir: string;
  setSortDir: (val: string) => void;

  onFilterSubmit: () => void;
  onReset: () => void;
}

export function SupplierReportsTable({
  data = [],
  isLoading,
  currentPage,
  lastPage,
  total,
  from,
  to,
  onPageChange,
  searchVal,
  setSearchVal,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  onFilterSubmit,
  onReset,
}: SupplierReportsTableProps) {
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const getStatusBadge = (status: string | undefined, totalDue: number, totalPurchase: number) => {
    if (totalDue === 0 && totalPurchase > 0) {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-none text-[10px] px-2 py-0.5 uppercase font-medium">
          Paid
        </Badge>
      );
    }
    if (status === "partial" || (totalDue > 0 && totalDue < totalPurchase)) {
      return (
        <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-none text-[10px] px-2 py-0.5 uppercase font-medium">
          Partial Due
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/15 text-red-600 hover:bg-red-500/25 border-none text-[10px] px-2 py-0.5 uppercase font-medium">
        Due
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Supplier Purchase & Payment Summary</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        {/* Table Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 px-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by supplier name, phone, email..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onFilterSubmit()}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-9 text-sm">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Fully Paid</SelectItem>
              <SelectItem value="partial">Partially Paid</SelectItem>
              <SelectItem value="due">Due / Unpaid</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" onClick={onFilterSubmit} className="h-9 px-4">
            Filter
          </Button>

          <Button variant="outline" size="sm" onClick={onReset} className="h-9 px-3">
            Reset
          </Button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto border-t">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead className="min-w-[200px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-medium"
                    onClick={() => handleSort("supplier_name")}
                  >
                    Supplier Name & Details
                    <ArrowUpDown className="ml-2 size-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="text-center w-[120px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 font-medium"
                    onClick={() => handleSort("purchase_count")}
                  >
                    Purchases
                    <ArrowUpDown className="ml-2 size-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="text-right min-w-[150px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-mr-3 ml-auto h-8 font-medium"
                    onClick={() => handleSort("total_purchase_amount")}
                  >
                    Total Purchase
                    <ArrowUpDown className="ml-2 size-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="text-right min-w-[140px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-mr-3 ml-auto h-8 font-medium"
                    onClick={() => handleSort("total_paid_amount")}
                  >
                    Total Paid
                    <ArrowUpDown className="ml-2 size-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="text-right min-w-[140px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-mr-3 ml-auto h-8 font-medium"
                    onClick={() => handleSort("total_due_amount")}
                  >
                    Total Due
                    <ArrowUpDown className="ml-2 size-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="text-center w-[120px]">Status</TableHead>
                <TableHead className="text-right w-[140px]">Last Purchase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center"><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40 mb-1.5" /><Skeleton className="h-3 w-28" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-56 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
                      <Users className="size-10 text-muted-foreground/50 stroke-[1.5]" />
                      <span className="font-medium text-base">No supplier records found</span>
                      <p className="text-sm max-w-sm text-center">
                        No supplier purchase activities match your current search or date filter.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => {
                  const itemIndex = from ? from + index : index + 1;
                  const totalPurchase = Number(item.total_purchase_amount || 0);
                  const totalPaid = Number(item.total_paid_amount || 0);
                  const totalDue = Number(item.total_due_amount || 0);

                  return (
                    <TableRow key={item.supplier_id || index} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {itemIndex}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 font-medium text-foreground text-sm">
                            <span>{item.supplier_name}</span>
                            {item.supplier_id > 0 && (
                              <Link
                                href={`/dashboard/suppliers`}
                                className="text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                title="View Supplier"
                              >
                                <ExternalLink className="size-3" />
                              </Link>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            {item.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="size-3" /> {item.phone}
                              </span>
                            )}
                            {item.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="size-3" /> {item.email}
                              </span>
                            )}
                            {item.address && (
                              <span className="flex items-center gap-1 truncate max-w-[200px]" title={item.address}>
                                <MapPin className="size-3 shrink-0" /> {item.address}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs">
                          {item.purchase_count} {item.purchase_count === 1 ? "Lot" : "Lots"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-foreground text-sm">
                        ৳{totalPurchase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                        ৳{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-bold">
                        <span className={totalDue > 0 ? "text-red-500" : "text-muted-foreground/60"}>
                          ৳{totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(item.payment_status, totalDue, totalPurchase)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {item.last_purchase_date ? (
                          <div className="flex items-center justify-end gap-1">
                            <Calendar className="size-3 text-muted-foreground/60" />
                            <span>{new Date(item.last_purchase_date).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/40 italic">Never</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between gap-4 px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{from}</span> to{" "}
              <span className="font-medium text-foreground">{to}</span> of{" "}
              <span className="font-medium text-foreground">{total}</span> suppliers
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground mr-2">
                Page {currentPage} of {lastPage}
              </span>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => onPageChange(Math.min(currentPage + 1, lastPage))}
                disabled={currentPage === lastPage || isLoading}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => onPageChange(lastPage)}
                disabled={currentPage === lastPage || isLoading}
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
