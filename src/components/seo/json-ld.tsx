/**
 * Renders one or more schema.org nodes as a JSON-LD script. `<` is escaped so the
 * payload can never break out of the <script> tag.
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  const json = JSON.stringify(Array.isArray(data) ? data : [data]).replace(
    /</g,
    "\\u003c",
  );
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
