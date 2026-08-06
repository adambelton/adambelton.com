const publicDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

export function formatPublicDate(date: string) {
  return publicDateFormatter.format(new Date(`${date}T00:00:00Z`));
}
