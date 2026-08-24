// Returns the live waitlist count shown on the site: a fixed baseline
// (signups collected before this Notion database existed / from a
// separate earlier list, ~400 as of 2026-08) plus the live row count in
// the "Signups from Website" Notion database. Runs server-side only —
// the Notion token never reaches the browser. Requires two Netlify
// environment variables:
//   NOTION_TOKEN        - Notion internal integration secret
//   NOTION_DATABASE_ID  - id of the "Signups from Website" database
// Optional:
//   WAITLIST_BASE_COUNT - overrides the 400 baseline below, no redeploy needed
//
// Response is cached at the CDN for 5 minutes (s-maxage=300) so a burst
// of visitors doesn't turn into a burst of Notion API calls.

const DEFAULT_BASE_COUNT = 400;

exports.handler = async function () {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  const baseCount = Number(process.env.WAITLIST_BASE_COUNT) || DEFAULT_BASE_COUNT;

  if (!token || !databaseId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing NOTION_TOKEN or NOTION_DATABASE_ID' }),
    };
  }

  try {
    let count = 0;
    let cursor = undefined;
    let hasMore = true;

    while (hasMore) {
      const res = await fetch(
        `https://api.notion.com/v1/databases/${databaseId}/query`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page_size: 100,
            start_cursor: cursor,
            filter: {
              property: 'Email',
              email: { is_not_empty: true },
            },
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Notion API ${res.status}: ${text}`);
      }

      const data = await res.json();
      count += data.results.length;
      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ count: baseCount + count, notionCount: count, baseCount }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
