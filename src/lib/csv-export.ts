export function downloadCSV(data: any[], filename: string) {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((fieldName) => {
            let field = row[fieldName];
            if (field === null || field === undefined) field = "";
            field = String(field);
            if (field.includes(",") || field.includes('"') || field.includes("\n")) {
              field = `"${field.replace(/"/g, '""')}"`;
            }
            return field;
          })
          .join(","),
      ),
    ].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
