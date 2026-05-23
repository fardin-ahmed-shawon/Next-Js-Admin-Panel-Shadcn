import { MessagesTable } from "./_components/messages-table";

export default function MessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Messages</h1>
          <p className="text-muted-foreground text-sm">View and manage all incoming messages from your website.</p>
        </div>
      </div>

      <MessagesTable />
    </div>
  );
}
