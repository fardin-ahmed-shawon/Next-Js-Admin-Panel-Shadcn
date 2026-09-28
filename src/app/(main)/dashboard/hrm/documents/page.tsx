"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  User,
  Plus,
  ArrowLeft,
  FileCheck,
  Award,
  Briefcase,
  FileBadge,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  useHrmDocuments,
  useHrmEmployees,
  uploadHrmDocument,
  deleteHrmDocument,
  DocumentRecord,
} from "@/hooks/useHrm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DOCUMENT_CATEGORIES = [
  { value: "all", label: "All Categories", icon: FileText },
  { value: "cv", label: "CV / Resume", icon: FileText },
  { value: "contract", label: "Employment Contract", icon: Briefcase },
  { value: "offer_letter", label: "Offer Letter", icon: FileCheck },
  { value: "joining_letter", label: "Joining Letter", icon: FileCheck },
  { value: "certificate", label: "Educational Certificates", icon: Award },
  { value: "id_record", label: "NID / Passport Records", icon: FileBadge },
  { value: "training", label: "Training Certificates", icon: Award },
  { value: "performance", label: "Performance Documents", icon: Sparkles },
];

export default function EmployeeDocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formCategory, setFormCategory] = useState("cv");
  const [formTitle, setFormTitle] = useState("");
  const [formExpiryDate, setFormExpiryDate] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formVerified, setFormVerified] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { documents, loading, refetch } = useHrmDocuments({
    user_id: selectedUserId !== "all" ? Number(selectedUserId) : undefined,
    document_type: selectedCategory !== "all" ? selectedCategory : undefined,
  });

  const { employees } = useHrmEmployees();

  const filteredDocs = documents.filter((doc) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = doc.title.toLowerCase().includes(q);
    const empMatch = doc.user?.full_name?.toLowerCase().includes(q);
    const typeMatch = doc.document_type.toLowerCase().includes(q);
    return titleMatch || empMatch || typeMatch;
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployeeId) {
      toast.error("Please select an employee");
      return;
    }
    if (!formTitle.trim()) {
      toast.error("Please enter a document title");
      return;
    }
    if (!selectedFile) {
      toast.error("Please choose a file to upload");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("user_id", formEmployeeId);
      formData.append("document_type", formCategory);
      formData.append("title", formTitle);
      formData.append("file", selectedFile);
      if (formExpiryDate) formData.append("expiry_date", formExpiryDate);
      if (formNotes) formData.append("notes", formNotes);
      formData.append("verified", formVerified ? "1" : "0");

      await uploadHrmDocument(formData);
      toast.success("Employee document archived successfully!");
      setIsUploadOpen(false);
      // Reset form
      setFormEmployeeId("");
      setFormTitle("");
      setFormExpiryDate("");
      setFormNotes("");
      setSelectedFile(null);
      setFormVerified(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (doc: DocumentRecord) => {
    if (!confirm(`Are you sure you want to delete "${doc.title}"?`)) return;
    try {
      await deleteHrmDocument(doc.id);
      toast.success("Document deleted");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const getCategoryBadge = (type: string) => {
    switch (type) {
      case "cv":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">CV / Resume</Badge>;
      case "contract":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Contract</Badge>;
      case "offer_letter":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Offer Letter</Badge>;
      case "joining_letter":
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Joining Letter</Badge>;
      case "certificate":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Certificates</Badge>;
      case "id_record":
        return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">NID / ID Records</Badge>;
      case "training":
        return <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">Training</Badge>;
      case "performance":
        return <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">Performance</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/hrm"
              className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> HRM Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Employee Document Vault
          </h1>
          <p className="text-sm text-muted-foreground">
            Central repository for employee records: CV, Contract, Offer & Joining Letters, NID, and Certificates
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2 shadow-sm">
          <UploadCloud className="h-4 w-4" /> Upload Document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Total Documents</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">{documents.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Archived files across all categories</CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Verified Records</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {documents.filter((d) => d.verified).length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Officially authenticated HR docs</CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Legal Contracts & Offers</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">
              {documents.filter((d) => ["contract", "offer_letter", "joining_letter"].includes(d.document_type)).length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Employment agreements & letters</CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Total Employees Covered</CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-600">
              {new Set(documents.map((d) => d.user_id)).size}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Staff members with records</CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <div className="overflow-x-auto pb-1">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="bg-muted/50 p-1 h-auto flex flex-wrap gap-1">
            {DOCUMENT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="text-xs px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, employee name, or document type..."
            className="pl-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Filter by Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={String(emp.id)}>
                  {emp.full_name} ({emp.employee_detail?.employee_id || `#${emp.id}`})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground animate-pulse">
          Loading document repository...
        </div>
      ) : filteredDocs.length === 0 ? (
        <Card className="border-dashed py-12 text-center">
          <CardContent className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">No documents found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No employee documents match the selected filters. Upload contracts, CVs, offer letters, or certificates.
            </p>
            <Button onClick={() => setIsUploadOpen(true)} variant="outline" size="sm" className="gap-2">
              <Plus className="h-3.5 w-3.5" /> Upload First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="border-border/60 hover:shadow-md transition-shadow group flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <User className="h-3 w-3" /> {doc.user?.full_name || "Unknown Staff"}
                      </p>
                    </div>
                  </div>
                  {doc.verified ? (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[10px] gap-1 px-1.5">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      Pending
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-3">
                <div className="flex items-center justify-between text-xs">
                  {getCategoryBadge(doc.document_type)}
                  <span className="text-[11px] text-muted-foreground uppercase font-mono">
                    {doc.file_type || "FILE"} {doc.file_size ? `• ${(doc.file_size / 1024).toFixed(0)} KB` : ""}
                  </span>
                </div>

                {doc.expiry_date && (
                  <div className="text-xs flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-1.5 rounded">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>Expires: {doc.expiry_date}</span>
                  </div>
                )}

                {doc.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded italic">
                    "{doc.notes}"
                  </p>
                )}
              </CardContent>
              <div className="border-t border-border/40 px-6 py-2.5 flex items-center justify-between bg-muted/10 text-xs">
                <span className="text-[11px] text-muted-foreground">
                  {new Date(doc.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1">
                  <a
                    href={doc.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-xs py-1 px-2 rounded hover:bg-primary/10 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View / Download
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(doc)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleUpload}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-primary" /> Archive Employee Document
              </DialogTitle>
              <DialogDescription>
                Upload contracts, CV, certificates, or NID records to the staff document vault.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="doc-emp" className="text-xs font-semibold">
                  Employee <span className="text-destructive">*</span>
                </Label>
                <Select value={formEmployeeId} onValueChange={setFormEmployeeId} required>
                  <SelectTrigger id="doc-emp">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        {emp.full_name} ({emp.employee_detail?.designation?.title || emp.employee_detail?.designation?.name || "Employee"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="doc-cat" className="text-xs font-semibold">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger id="doc-cat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cv">CV / Resume</SelectItem>
                      <SelectItem value="contract">Employment Contract</SelectItem>
                      <SelectItem value="offer_letter">Offer Letter</SelectItem>
                      <SelectItem value="joining_letter">Joining Letter</SelectItem>
                      <SelectItem value="certificate">Certificates</SelectItem>
                      <SelectItem value="id_record">NID / ID Records</SelectItem>
                      <SelectItem value="training">Training Certificate</SelectItem>
                      <SelectItem value="performance">Performance Document</SelectItem>
                      <SelectItem value="other">Other Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="doc-expiry" className="text-xs font-semibold">
                    Expiry Date (Optional)
                  </Label>
                  <Input
                    id="doc-expiry"
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doc-title" className="text-xs font-semibold">
                  Document Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="doc-title"
                  placeholder="e.g. Signed Employment Contract 2026, NID Scan, Master's Certificate"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doc-file" className="text-xs font-semibold">
                  File Attachment <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="doc-file"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                />
                <p className="text-[11px] text-muted-foreground">Supported: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doc-notes" className="text-xs font-semibold">
                  Notes / Remarks
                </Label>
                <Input
                  id="doc-notes"
                  placeholder="Additional context or verification notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="doc-verified"
                  checked={formVerified}
                  onChange={(e) => setFormVerified(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <Label htmlFor="doc-verified" className="text-xs cursor-pointer font-medium">
                  Mark as Officially Verified by HR
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Uploading..." : "Upload & Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
