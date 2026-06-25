import { MessagesTable } from "./_components/messages-table";

async function getMessages() {
  let apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin";
  const messageEndpoint = process.env.NEXT_PUBLIC_API_MESSAGE_URL || "messages";

  const baseUrl = apiUrl.replace(/\/$/, "");
  const url = `${baseUrl}/${messageEndpoint}`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages`);
    }

    const result = await response.json();

    // Extract messages from response
    let messagesData = [];
    if (result.success && result.data) {
      if (result.data.data && Array.isArray(result.data.data)) {
        messagesData = result.data.data;
      } else if (Array.isArray(result.data)) {
        messagesData = result.data;
      }
    }

    // Transform to match the component's expected format
    return messagesData.map((message: any) => ({
      id: message.id?.toString(),
      full_name: message.full_name,
      subject: message.subject,
      message: message.message,
      date: message.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
      email: message.email,
      phone: message.phone,
    }));
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export default async function MessagesPage() {
  const messages = await getMessages();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Messages</h1>
          <p className="text-muted-foreground text-sm">View and manage all incoming messages from your website.</p>
        </div>
      </div>

      <MessagesTable initialMessages={messages} />
    </div>
  );
}
