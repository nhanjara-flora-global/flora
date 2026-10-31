export function ArticleBody({
  html,
  className = "prose-legacy",
}: {
  html: string;
  className?: string;
}) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
