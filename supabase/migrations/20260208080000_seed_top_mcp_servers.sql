-- Cold-start seed dataset for DemumuMind MCP.
-- Idempotent upsert by `slug`.

with seed_data (
  name,
  slug,
  description,
  server_url,
  category,
  auth_type,
  tags,
  repo_url,
  status,
  verification_level
) as (
  values
    ('Linear', 'linear', 'Manage issues, projects, and cycles from your AI workflows.', 'https://mcp.linear.app/sse', 'Project Management', 'oauth', array['verified','official'], 'https://linear.app/docs/mcp', 'active', 'official'),
    ('Google Drive', 'google-drive', 'Search, read, and organize documents in Google Drive.', 'https://mcp.gdrive.dev/sse', 'Productivity', 'oauth', array['popular'], 'https://developers.google.com/drive/api', 'active', 'community'),
    ('Brave Search', 'brave-search', 'Web and news search API for agent grounding.', 'https://mcp.brave.com/sse', 'Search', 'api_key', array['search','web'], 'https://brave.com/search/api/', 'active', 'partner'),
    ('Apify', 'apify', 'Run scrapers and data pipelines from MCP-enabled clients.', 'https://mcp.apify.dev/sse', 'Data', 'api_key', array['automation','scraping'], 'https://docs.apify.com/api/v2', 'active', 'community'),
    ('WeatherKit', 'weatherkit', 'Simple weather retrieval for forecasts and conditions.', 'https://mcp.weatherkit.dev/sse', 'Utilities', 'none', array['open'], 'https://weatherkit.apple.com', 'active', 'community'),
    ('Slack', 'slack', 'Send and query channel messages with workspace auth.', 'https://mcp.slack.dev/sse', 'Communication', 'oauth', array['team'], 'https://api.slack.com', 'active', 'official'),
    ('GitHub', 'github', 'Access repositories, pull requests, and issues for coding agents.', 'https://mcp.github.com/sse', 'Developer Tools', 'oauth', array['verified','dev'], 'https://docs.github.com/en/rest', 'active', 'official'),
    ('Notion', 'notion', 'Create and update pages/databases from agent flows.', 'https://mcp.notion.dev/sse', 'Knowledge', 'oauth', array['docs'], 'https://developers.notion.com/reference/intro', 'active', 'partner'),
    ('Airtable', 'airtable', 'Read/write records from Airtable bases with typed operations.', 'https://mcp.airtable.dev/sse', 'Productivity', 'oauth', array['tables'], 'https://airtable.com/developers/web/api/introduction', 'active', 'community'),
    ('Stripe', 'stripe', 'Access payments, subscriptions, and customer records from MCP.', 'https://mcp.stripe.dev/sse', 'Finance', 'api_key', array['payments'], 'https://docs.stripe.com/api', 'active', 'partner'),
    ('GitLab', 'gitlab', 'Manage merge requests, issues, and repositories in GitLab.', 'https://mcp.gitlab.dev/sse', 'Developer Tools', 'oauth', array['git','devops'], 'https://docs.gitlab.com/api/', 'active', 'partner'),
    ('Asana', 'asana', 'Manage tasks and projects in Asana from AI agents.', 'https://mcp.asana.dev/sse', 'Project Management', 'oauth', array['tasks','team'], 'https://developers.asana.com/docs', 'active', 'official'),
    ('Jira', 'jira', 'Read and mutate Jira tickets for planning and triage workflows.', 'https://mcp.jira.dev/sse', 'Project Management', 'oauth', array['issues','enterprise'], 'https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/', 'active', 'official'),
    ('Postgres', 'postgres', 'Query Postgres databases using controlled read/write operations.', 'https://mcp.postgres.dev/sse', 'Data', 'none', array['database','sql'], 'https://www.postgresql.org/docs/', 'active', 'community'),
    ('Shopify', 'shopify', 'Operate products, orders, and inventory from Shopify stores.', 'https://mcp.shopify.dev/sse', 'Commerce', 'oauth', array['ecommerce'], 'https://shopify.dev/docs/api', 'active', 'partner'),
    ('HubSpot', 'hubspot', 'Manage CRM entities like contacts, deals, and activities.', 'https://mcp.hubspot.dev/sse', 'CRM', 'oauth', array['sales','marketing'], 'https://developers.hubspot.com/docs/api/overview', 'active', 'partner'),
    ('Trello', 'trello', 'Create cards and organize boards for lightweight project tracking.', 'https://mcp.trello.dev/sse', 'Project Management', 'oauth', array['kanban'], 'https://developer.atlassian.com/cloud/trello/rest/', 'active', 'community'),
    ('Discord', 'discord', 'Send and read Discord channel messages with bot integrations.', 'https://mcp.discord.dev/sse', 'Communication', 'oauth', array['chat','community'], 'https://discord.com/developers/docs/intro', 'active', 'community'),
    ('Figma', 'figma', 'Access file nodes, comments, and exports from Figma projects.', 'https://mcp.figma.dev/sse', 'Design', 'oauth', array['ui','assets'], 'https://www.figma.com/developers/api', 'active', 'partner'),
    ('Sentry', 'sentry', 'Inspect issues, releases, and alerts from Sentry projects.', 'https://mcp.sentry.dev/sse', 'Developer Tools', 'oauth', array['observability'], 'https://docs.sentry.io/api/', 'active', 'official')
)
insert into public.servers (
  name,
  slug,
  description,
  server_url,
  category,
  auth_type,
  tags,
  repo_url,
  status,
  verification_level
)
select
  name,
  slug,
  description,
  server_url,
  category,
  auth_type,
  tags,
  repo_url,
  status,
  verification_level
from seed_data
on conflict (slug)
do update set
  name = excluded.name,
  description = excluded.description,
  server_url = excluded.server_url,
  category = excluded.category,
  auth_type = excluded.auth_type,
  tags = excluded.tags,
  repo_url = excluded.repo_url,
  status = excluded.status,
  verification_level = excluded.verification_level,
  updated_at = now();
