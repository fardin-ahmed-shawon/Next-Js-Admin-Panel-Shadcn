"use client";

import * as React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddBlockDialog } from "./_components/add-block-dialog";
import { BlocklistStats } from "./_components/blocklist-stats";
import { BlocklistTable } from "./_components/blocklist-table";
import { toast } from "sonner";

export default function BlocklistPage() {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [blocklistData, setBlocklistData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Use environment variables
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1/admin/';
  const BLOCK_LIST_URL = process.env.NEXT_PUBLIC_API_BLOCK_LIST_URL || 'block-list';
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  const cleanPath = BLOCK_LIST_URL.startsWith('/') ? BLOCK_LIST_URL.slice(1) : BLOCK_LIST_URL;
  const API_URL = `${cleanBase}${cleanPath}`;

  // Fetch all blocklist entries
  const fetchBlocklist = async () => {
    try {
      setLoading(true);
      console.log('Fetching from:', API_URL);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      // Handle different response structures
      let dataArray = [];
      if (result.success && Array.isArray(result.data)) {
        dataArray = result.data;
      } else if (Array.isArray(result)) {
        dataArray = result;
      } else if (result.data && Array.isArray(result.data)) {
        dataArray = result.data;
      } else {
        dataArray = [];
      }
      
      // Transform Laravel data to match frontend format
      const formattedData = dataArray.map((item: any) => ({
        id: item.id,
        type: item.block_type === 'ip' ? 'IP' : 'Phone',
        value: item.block_value,
        reason: item.reason || "-",
        status: item.is_active ? "Active" : "Inactive",
        is_active: item.is_active, // Keep the original boolean for updates
        blockedAt: item.blocked_at ? new Date(item.blocked_at).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(',', '\n') : new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(',', '\n'),
        expires: item.expires_at ? new Date(item.expires_at).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(',', '\n') : "Permanent",
      }));
      
      setBlocklistData(formattedData);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error("Failed to connect to API. Make sure Laravel backend is running");
      setBlocklistData([]);
    } finally {
      setLoading(false);
    }
  };



  // Toggle status (Unblock/Re-block)
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          is_active: newStatus
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(newStatus ? "Entry re-blocked successfully." : "Entry unblocked successfully.");
        await fetchBlocklist();
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error("Failed to update status");
    }
  };



  // Add new block entry
  const handleAddBlock = async (newBlock: { block_type: string; block_value: string; reason?: string; expires_at?: string }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(newBlock),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Block entry added successfully.");
        await fetchBlocklist();
        setIsAddOpen(false);
      } else {
        if (result.errors) {
          const errors = Object.values(result.errors).flat();
          toast.error(errors.join(', '));
        } else {
          toast.error(result.message || "Failed to add block entry");
        }
      }
    } catch (error) {
      console.error('Add error:', error);
      toast.error("Failed to add block entry");
    }
  };

  // Delete block entry
  const handleDeleteBlock = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Entry deleted successfully.");
        await fetchBlocklist();
      } else {
        toast.error(result.message || "Failed to delete entry");
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete entry");
    }
  };

  React.useEffect(() => {
    fetchBlocklist();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl tracking-tight">Blocklist</h1>
            <p className="text-muted-foreground text-sm">Manage blocked IPs and phone numbers.</p>
          </div>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Blocklist</h1>
          <p className="text-muted-foreground text-sm">Manage blocked IPs and phone numbers.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Add Block
          </Button>
          <AddBlockDialog 
            open={isAddOpen} 
            onOpenChange={setIsAddOpen}
            onAddBlock={handleAddBlock}
          />
        </div>
      </div>

      <BlocklistStats data={blocklistData} />
      <BlocklistTable 
        data={blocklistData} 
        onDelete={handleDeleteBlock}
        onToggleStatus={handleToggleStatus}
        onRefresh={fetchBlocklist}
      />
    </div>
  );
}