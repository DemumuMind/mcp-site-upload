-- Fix incorrect Visit URL for Linear MCP server.
update public.servers
set
  repo_url = 'https://linear.app/docs/mcp',
  updated_at = now()
where slug = 'linear';
