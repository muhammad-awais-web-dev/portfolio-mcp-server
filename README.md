# portfolio-mcp-server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that connects AI tools — Claude Desktop, Cursor, GitHub Copilot — directly to your **[universal-portfolio](https://github.com/muhammad-awais-web-dev/universal-portfolio)** instance.

## What it does

Exposes all 26 portfolio tools over stdio so any MCP-compatible AI client can:
- Read your profile, projects, skills, certifications, education, experience, and testimonials
- Create, update, and delete any portfolio item (with a write-enabled API key)

## Related

- **universal-portfolio** — the full-stack portfolio app this server connects to: [github.com/muhammad-awais-web-dev/universal-portfolio](https://github.com/muhammad-awais-web-dev/universal-portfolio)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# URL of your running portfolio (local or deployed)
PORTFOLIO_URL=https://your-portfolio-domain.com

# API key from portfolio admin → Settings → API Keys
# Enable "can_write" on the key for write tool access
MCP_API_KEY=your_api_key_here
```

### 3. Test manually

```bash
npm start
```

The server communicates over **stdio** — it won't print anything until an MCP client connects. Startup messages appear on stderr.

---

## Connect to Claude Desktop

Edit `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "portfolio": {
      "command": "npx",
      "args": ["tsx", "/path/to/portfolio-mcp-server/src/index.ts"],
      "env": {
        "PORTFOLIO_URL": "https://your-portfolio-domain.com",
        "MCP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Restart Claude Desktop. You'll see **portfolio** listed under MCP tools.

---

## Connect to Cursor

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "portfolio": {
      "command": "npx",
      "args": ["tsx", "/path/to/portfolio-mcp-server/src/index.ts"],
      "env": {
        "PORTFOLIO_URL": "https://your-portfolio-domain.com",
        "MCP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

---

## Connect to GitHub Copilot CLI

Edit `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "portfolio": {
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "/path/to/portfolio-mcp-server/src/index.ts"],
      "env": {
        "PORTFOLIO_URL": "https://your-portfolio-domain.com",
        "MCP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

---

## Available Tools (26 total)

### Read tools — any API key

| Tool | Description |
|------|-------------|
| `get_profile` | Profile info, bio, social links |
| `list_projects` | Published projects (filter by category/skill, paginated) |
| `get_project` | Single project by ID or slug |
| `list_skills` | All skills (filter by category, paginated) |
| `get_skill` | Single skill by ID or name |
| `list_certifications` | All certifications |
| `get_certification` | Single certification by ID |
| `list_education` | Education history |
| `get_education` | Single education entry by ID |
| `list_experience` | Work experience |
| `get_experience` | Single experience entry by ID |
| `list_testimonials` | Testimonials (filter featured) |
| `get_testimonial` | Single testimonial by ID |

### Write tools — API key with `can_write = true`

| Tool | Description |
|------|-------------|
| `update_profile` | Update name, bio, email, social links, etc. |
| `create_project` | Create a new project |
| `update_project` | Update project by ID (including `body_html`) |
| `delete_project` | Delete project by ID |
| `create_skill` | Create a new skill |
| `update_skill` | Update skill by ID |
| `delete_skill` | Delete skill by ID |
| `create_certification` | Create a new certification |
| `update_certification` | Update certification by ID |
| `delete_certification` | Delete certification by ID |
| `create_education` | Create an education entry |
| `update_education` | Update education by ID |
| `delete_education` | Delete education by ID |
| `create_experience` | Create a work experience entry |
| `update_experience` | Update experience by ID |
| `delete_experience` | Delete experience by ID |
| `create_testimonial` | Create a testimonial |
| `update_testimonial` | Update testimonial by ID |
| `delete_testimonial` | Delete testimonial by ID |

---

## Example prompts (once connected to Claude/Cursor/Copilot)

- *"List all my projects"*
- *"What skills do I have in the Backend category?"*
- *"Update my profile bio to: I'm a full-stack developer..."*
- *"Create a new skill called Docker in the DevOps category"*
- *"Update project 5 — set body_html to: `<p>New description</p>`"*
- *"Publish project with slug 'my-app'"*

---

## Requirements

- Node.js 18+
- A running [universal-portfolio](https://github.com/muhammad-awais-web-dev/universal-portfolio) instance
- An MCP API key (generated in the portfolio admin panel)
