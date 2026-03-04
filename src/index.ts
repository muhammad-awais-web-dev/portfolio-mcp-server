import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const PORTFOLIO_URL = (process.env.PORTFOLIO_URL || 'http://localhost:3000').replace(/\/$/, '');
const MCP_API_KEY = process.env.MCP_API_KEY || '';

if (!MCP_API_KEY) {
  process.stderr.write('Warning: MCP_API_KEY is not set. Requests will fail authentication.\n');
}

// ── Portfolio API caller ────────────────────────────────────────────────────

async function callTool(tool: string, parameters: Record<string, unknown> = {}) {
  const res = await fetch(`${PORTFOLIO_URL}/api/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': MCP_API_KEY,
      'x-mcp-api-key': MCP_API_KEY,
    },
    body: JSON.stringify({ tool, parameters }),
  });

  const json = await res.json() as { success: boolean; data?: unknown; error?: string };

  if (!json.success) {
    throw new Error(json.error || `Tool "${tool}" failed with status ${res.status}`);
  }

  return json.data;
}

const fmt = (data: unknown) => JSON.stringify(data, null, 2);

// ── MCP Server ──────────────────────────────────────────────────────────────

const server = new McpServer({
  name: 'universal-portfolio',
  version: '1.0.0',
});

// ── Read tools ──────────────────────────────────────────────────────────────

server.tool('get_profile', 'Get the portfolio owner\'s profile: name, bio, contact details, social links', {}, async () => ({
  content: [{ type: 'text', text: fmt(await callTool('get_profile')) }],
}));

server.tool(
  'list_projects',
  'List published projects. Optionally filter by category or skill name.',
  {
    category: z.string().optional().describe('Filter by project category name'),
    skill: z.string().optional().describe('Filter by skill name'),
    page: z.number().min(1).optional().describe('Page number (default: 1)'),
    limit: z.number().min(1).max(50).optional().describe('Results per page (default: 10, max: 50)'),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('list_projects', p)) }] })
);

server.tool(
  'get_project',
  'Get a specific project by ID or slug',
  {
    id: z.number().optional().describe('Project ID'),
    slug: z.string().optional().describe('Project slug'),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('get_project', p)) }] })
);

server.tool(
  'list_skills',
  'List all skills, optionally filtered by category',
  {
    category: z.string().optional().describe('Filter by category name'),
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(100).optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('list_skills', p)) }] })
);

server.tool(
  'get_skill',
  'Get a specific skill by ID or name',
  {
    id: z.number().optional().describe('Skill ID'),
    name: z.string().optional().describe('Skill name'),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('get_skill', p)) }] })
);

server.tool(
  'list_certifications',
  'List all certifications',
  { page: z.number().min(1).optional(), limit: z.number().min(1).max(50).optional() },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('list_certifications', p)) }] })
);

server.tool(
  'get_certification',
  'Get a specific certification by ID',
  { id: z.number().describe('Certification ID') },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('get_certification', p)) }] })
);

server.tool(
  'list_education',
  'List all education history',
  { page: z.number().min(1).optional(), limit: z.number().min(1).max(50).optional() },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('list_education', p)) }] })
);

server.tool(
  'get_education',
  'Get a specific education entry by ID',
  { id: z.number().describe('Education ID') },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('get_education', p)) }] })
);

server.tool(
  'list_experience',
  'List all work experience',
  { page: z.number().min(1).optional(), limit: z.number().min(1).max(50).optional() },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('list_experience', p)) }] })
);

server.tool(
  'get_experience',
  'Get a specific work experience entry by ID',
  { id: z.number().describe('Experience ID') },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('get_experience', p)) }] })
);

server.tool(
  'list_testimonials',
  'List all testimonials',
  {
    featured: z.boolean().optional().describe('Filter to featured only'),
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(50).optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('list_testimonials', p)) }] })
);

server.tool(
  'get_testimonial',
  'Get a specific testimonial by ID',
  { id: z.number().describe('Testimonial ID') },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('get_testimonial', p)) }] })
);

// ── Write tools (require API key with can_write = true) ─────────────────────

server.tool(
  'update_profile',
  'Update the portfolio owner profile. Requires write permission.',
  {
    full_name: z.string().optional(),
    tagline: z.string().optional(),
    bio: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().url().optional(),
    avatar_url: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    instagram: z.string().url().optional(),
    youtube: z.string().url().optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('update_profile', p)) }] })
);

server.tool(
  'create_project',
  'Create a new portfolio project. Requires write permission.',
  {
    title: z.string().describe('Project title'),
    slug: z.string().describe('URL-friendly slug'),
    short_description: z.string().optional(),
    description: z.string().optional(),
    body_html: z.string().optional().describe('Full rich HTML description'),
    live_url: z.string().url().optional(),
    repo_url: z.string().url().optional(),
    featured_image: z.string().url().optional(),
    image_gallery: z.array(z.string().url()).optional(),
    is_published: z.boolean().optional(),
    skill_ids: z.array(z.number()).optional(),
    category_ids: z.array(z.number()).optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('create_project', p)) }] })
);

server.tool(
  'update_project',
  'Update an existing project by ID. Requires write permission.',
  {
    id: z.number().describe('Project ID'),
    title: z.string().optional(),
    slug: z.string().optional(),
    short_description: z.string().optional(),
    description: z.string().optional(),
    body_html: z.string().optional().describe('Full rich HTML description'),
    live_url: z.string().url().optional(),
    repo_url: z.string().url().optional(),
    featured_image: z.string().url().optional(),
    image_gallery: z.array(z.string().url()).optional(),
    is_published: z.boolean().optional(),
    published_at: z.string().optional(),
    skill_ids: z.array(z.number()).optional(),
    category_ids: z.array(z.number()).optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('update_project', p)) }] })
);

server.tool(
  'delete_project',
  'Delete a project by ID. Requires write permission.',
  { id: z.number().describe('Project ID') },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('delete_project', p)) }] })
);

server.tool(
  'create_skill',
  'Create a new skill. Requires write permission.',
  {
    name: z.string().describe('Skill name'),
    logo_url: z.string().url().optional(),
    body_html: z.string().optional(),
    category_ids: z.array(z.number()).optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('create_skill', p)) }] })
);

server.tool(
  'update_skill',
  'Update an existing skill by ID. Requires write permission.',
  {
    id: z.number().describe('Skill ID'),
    name: z.string().optional(),
    logo_url: z.string().url().optional(),
    body_html: z.string().optional(),
    category_ids: z.array(z.number()).optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('update_skill', p)) }] })
);

server.tool(
  'delete_skill',
  'Delete a skill by ID. Requires write permission.',
  { id: z.number().describe('Skill ID') },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('delete_skill', p)) }] })
);

server.tool(
  'create_certification',
  'Create a new certification. Requires write permission.',
  {
    title: z.string().describe('Certification title'),
    authority: z.string().optional(),
    credential_url: z.string().url().optional(),
    issued_date: z.string().optional().describe('YYYY-MM-DD'),
    expiration_date: z.string().optional().describe('YYYY-MM-DD'),
    is_active: z.boolean().optional(),
    body_html: z.string().optional(),
    skill_ids: z.array(z.number()).optional(),
    project_ids: z.array(z.number()).optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('create_certification', p)) }] })
);

server.tool(
  'update_certification',
  'Update an existing certification by ID. Requires write permission.',
  {
    id: z.number().describe('Certification ID'),
    title: z.string().optional(),
    authority: z.string().optional(),
    credential_url: z.string().url().optional(),
    issued_date: z.string().optional(),
    expiration_date: z.string().optional(),
    is_active: z.boolean().optional(),
    body_html: z.string().optional(),
    skill_ids: z.array(z.number()).optional(),
    project_ids: z.array(z.number()).optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('update_certification', p)) }] })
);

server.tool(
  'delete_certification',
  'Delete a certification by ID. Requires write permission.',
  { id: z.number().describe('Certification ID') },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('delete_certification', p)) }] })
);

server.tool(
  'create_education',
  'Create a new education entry. Requires write permission.',
  {
    institution: z.string().describe('Institution name'),
    degree: z.string().optional(),
    field_of_study: z.string().optional(),
    start_date: z.string().optional().describe('YYYY-MM-DD'),
    end_date: z.string().optional().describe('YYYY-MM-DD'),
    is_current: z.boolean().optional(),
    grade: z.string().optional(),
    description: z.string().optional(),
    body_html: z.string().optional(),
    skill_ids: z.array(z.number()).optional(),
    project_ids: z.array(z.number()).optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('create_education', p)) }] })
);

server.tool(
  'update_education',
  'Update an existing education entry by ID. Requires write permission.',
  {
    id: z.number().describe('Education ID'),
    institution: z.string().optional(),
    degree: z.string().optional(),
    field_of_study: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    is_current: z.boolean().optional(),
    grade: z.string().optional(),
    description: z.string().optional(),
    body_html: z.string().optional(),
    skill_ids: z.array(z.number()).optional(),
    project_ids: z.array(z.number()).optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('update_education', p)) }] })
);

server.tool(
  'delete_education',
  'Delete an education entry by ID. Requires write permission.',
  { id: z.number().describe('Education ID') },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('delete_education', p)) }] })
);

server.tool(
  'create_experience',
  'Create a new work experience entry. Requires write permission.',
  {
    title: z.string().describe('Job title'),
    company: z.string().describe('Company name'),
    start_date: z.string().describe('YYYY-MM-DD'),
    end_date: z.string().optional().describe('YYYY-MM-DD'),
    is_current: z.boolean().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    body_html: z.string().optional(),
    skill_ids: z.array(z.number()).optional(),
    project_ids: z.array(z.number()).optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('create_experience', p)) }] })
);

server.tool(
  'update_experience',
  'Update an existing work experience entry by ID. Requires write permission.',
  {
    id: z.number().describe('Experience ID'),
    title: z.string().optional(),
    company: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    is_current: z.boolean().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    body_html: z.string().optional(),
    skill_ids: z.array(z.number()).optional(),
    project_ids: z.array(z.number()).optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('update_experience', p)) }] })
);

server.tool(
  'delete_experience',
  'Delete a work experience entry by ID. Requires write permission.',
  { id: z.number().describe('Experience ID') },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('delete_experience', p)) }] })
);

server.tool(
  'create_testimonial',
  'Create a new testimonial. Requires write permission.',
  {
    name: z.string().describe('Reviewer name'),
    position: z.string().describe('Reviewer position/title'),
    comment: z.string().describe('Testimonial text'),
    company: z.string().optional(),
    image_url: z.string().url().optional(),
    platform_name: z.string().optional(),
    testimonial_date: z.string().optional().describe('YYYY-MM'),
    is_featured: z.boolean().optional(),
    is_active: z.boolean().optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('create_testimonial', p)) }] })
);

server.tool(
  'update_testimonial',
  'Update an existing testimonial by ID. Requires write permission.',
  {
    id: z.number().describe('Testimonial ID'),
    name: z.string().optional(),
    position: z.string().optional(),
    comment: z.string().optional(),
    company: z.string().optional(),
    image_url: z.string().url().optional(),
    platform_name: z.string().optional(),
    testimonial_date: z.string().optional(),
    is_featured: z.boolean().optional(),
    is_active: z.boolean().optional(),
  },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('update_testimonial', p)) }] })
);

server.tool(
  'delete_testimonial',
  'Delete a testimonial by ID. Requires write permission.',
  { id: z.number().describe('Testimonial ID') },
  async (p) => ({ content: [{ type: 'text', text: fmt(await callTool('delete_testimonial', p)) }] })
);

// ── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write(`Portfolio MCP server started. Connected to ${PORTFOLIO_URL}\n`);
