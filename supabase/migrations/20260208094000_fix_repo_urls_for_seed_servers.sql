-- Backfill normalized Visit links for seeded MCP servers.
with repo_updates (slug, repo_url) as (
  values
    ('linear', 'https://linear.app/docs/mcp'),
    ('google-drive', 'https://developers.google.com/drive/api'),
    ('brave-search', 'https://brave.com/search/api/'),
    ('apify', 'https://docs.apify.com/api/v2'),
    ('weatherkit', 'https://weatherkit.apple.com'),
    ('slack', 'https://api.slack.com'),
    ('github', 'https://docs.github.com/en/rest'),
    ('notion', 'https://developers.notion.com/reference/intro'),
    ('airtable', 'https://airtable.com/developers/web/api/introduction'),
    ('stripe', 'https://docs.stripe.com/api'),
    ('gitlab', 'https://docs.gitlab.com/api/'),
    ('asana', 'https://developers.asana.com/docs'),
    ('jira', 'https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/'),
    ('postgres', 'https://www.postgresql.org/docs/'),
    ('shopify', 'https://shopify.dev/docs/api'),
    ('hubspot', 'https://developers.hubspot.com/docs/api/overview'),
    ('trello', 'https://developer.atlassian.com/cloud/trello/rest/'),
    ('discord', 'https://discord.com/developers/docs/intro'),
    ('figma', 'https://www.figma.com/developers/api'),
    ('sentry', 'https://docs.sentry.io/api/')
)
update public.servers as servers
set
  repo_url = repo_updates.repo_url,
  updated_at = now()
from repo_updates
where servers.slug = repo_updates.slug;
