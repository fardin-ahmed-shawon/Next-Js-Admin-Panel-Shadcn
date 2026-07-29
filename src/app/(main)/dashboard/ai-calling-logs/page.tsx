"use client";

import React, { useState } from "react";
import { useAiCallingLogs } from "@/hooks/useAiCallingLogs";
import { Loader2, Bot, Calendar, Phone, CheckCircle2, XCircle, Search, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function AiCallingLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  
  const { logs, pagination, isLoading, mutate } = useAiCallingLogs({
    page,
    per_page: 20,
    search: search || undefined
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Pending</Badge>;
    const s = status.toLowerCase();
    if (s === "completed" || s === "success") return <Badge className="bg-emerald-500/15 text-emerald-600 border-none">Completed</Badge>;
    if (s === "failed" || s === "error") return <Badge variant="destructive">Failed</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight flex items-center gap-2">
            <Bot className="size-8 text-indigo-500" />
            AI Calling Logs
          </h1>
          <p className="text-muted-foreground text-sm">Monitor and review all AI automated calls to customers.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Call History</CardTitle>
          <CardDescription>View detailed logs of all AI interactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <form onSubmit={handleSearch} className="flex max-w-sm w-full relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by Order ID or Call ID..." 
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>
          </div>

          <div className="rounded-md border relative">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Info</TableHead>
                  <TableHead>Call ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result / Reason</TableHead>
                  <TableHead>Disposition</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Recording</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                      No call logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: any) => {
                    const { date, time } = formatDate(log.created_at);
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{log.order_id}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="size-3" /> {date} &bull; {time}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{log.call_id || "N/A"}</code>
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{log.result || "—"}</span>
                            {log.reason && <span className="text-xs text-muted-foreground mt-0.5">{log.reason}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.disposition ? (
                            <Badge variant="outline" className="text-xs font-normal">
                              {log.disposition}
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          {log.duration_seconds ? (
                            <span className="text-sm">{log.duration_seconds} sec</span>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          {log.recording_url ? (
                            <a href={log.recording_url} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline text-sm font-medium">
                              Listen Audio
                            </a>
                          ) : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.current_page} of {pagination.last_page}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                      className={page === pagination.last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
