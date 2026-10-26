const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'images');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// -------------------------------------------------------------
// HTML & SVG Templates for Publication-Grade Engineering Diagrams
// -------------------------------------------------------------

const HTML_HEAD = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #FFFFFF;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 36px 40px;
    }
    .diagram-container {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.06), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
      padding: 32px 36px;
      width: 100%;
      max-width: 1200px;
    }
    .diagram-header {
      margin-bottom: 24px;
      border-bottom: 2px solid #F1F5F9;
      padding-bottom: 16px;
    }
    .figure-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #3B82F6;
      background: #EFF6FF;
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 6px;
    }
    .diagram-title {
      font-size: 20px;
      font-weight: 800;
      color: #0F172A;
    }
    .diagram-desc {
      font-size: 13px;
      color: #64748B;
      margin-top: 4px;
    }
    .code-font {
      font-family: 'JetBrains Mono', monospace;
    }
  </style>
</head>
<body>
`;

const HTML_FOOT = `
</body>
</html>`;

// 1. Layered Architecture (Figure 4.1)
const getArchitectureHtml = () => `
${HTML_HEAD}
<div class="diagram-container">
  <div class="diagram-header">
    <div class="figure-tag">Figure 4.1</div>
    <div class="diagram-title">Layered System Architecture</div>
    <div class="diagram-desc">Multi-tier Monorepo Separation of Concerns: Presentation, API Gateway, Domain Services, Data Access & Cloud Persistence</div>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px;">
    <!-- Tier 1: Presentation Layer -->
    <div style="background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%); border: 1.5px solid #BFDBFE; border-radius: 12px; padding: 18px 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-weight: 700; font-size: 14px; color: #1E40AF; text-transform: uppercase; letter-spacing: 0.05em;">1. Presentation Layer (Single Page Application - React 18 & Vite)</span>
        <span style="background: #DBEAFE; color: #1E40AF; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px;">Client-Side Routing</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
        <div style="background: white; border: 1px solid #93C5FD; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-weight: 700; font-size: 13px; color: #0F172A;">Admin Control Portal</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">/login/admin, /settings, /hr/users</div>
        </div>
        <div style="background: white; border: 1px solid #93C5FD; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-weight: 700; font-size: 13px; color: #0F172A;">Operations Portal</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">/login/manager, Inventory, Purchases</div>
        </div>
        <div style="background: white; border: 1px solid #93C5FD; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-weight: 700; font-size: 13px; color: #0F172A;">Staff Desk & POS</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">/login/staff, Sales Orders, Lookup</div>
        </div>
        <div style="background: white; border: 1px solid #93C5FD; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-weight: 700; font-size: 13px; color: #0F172A;">UI & State Engine</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">Context API, Recharts, Lucide, Toast</div>
        </div>
      </div>
    </div>

    <!-- Communication Bridge -->
    <div style="display: flex; justify-content: center; align-items: center; gap: 8px; color: #64748B; font-size: 12px; font-weight: 600;">
      <span>▼</span>
      <span style="background: #F1F5F9; padding: 4px 16px; border-radius: 20px; border: 1px solid #CBD5E1;">HTTPS REST API • JSON Payloads • Bearer JWT Authorization Tokens</span>
      <span>▼</span>
    </div>

    <!-- Tier 2: API & Middleware Layer -->
    <div style="background: linear-gradient(135deg, #F8FAFC 0%, #F5F3FF 100%); border: 1.5px solid #DDD6FE; border-radius: 12px; padding: 18px 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-weight: 700; font-size: 14px; color: #5B21B6; text-transform: uppercase; letter-spacing: 0.05em;">2. API Gateway & Security Middleware (Node.js & Express.js)</span>
        <span style="background: #EDE9FE; color: #5B21B6; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px;">REST API Controllers</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
        <div style="background: white; border: 1px solid #C4B5FD; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-weight: 700; font-size: 13px; color: #0F172A;">Security Pipeline</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">Helmet, CORS, Mongo Sanitize</div>
        </div>
        <div style="background: white; border: 1px solid #C4B5FD; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-weight: 700; font-size: 13px; color: #0F172A;">Authentication Guard</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">JWT Verification, Role Extraction</div>
        </div>
        <div style="background: white; border: 1px solid #C4B5FD; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-weight: 700; font-size: 13px; color: #0F172A;">RBAC Permission Filter</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">authorize(['admin','manager','staff'])</div>
        </div>
        <div style="background: white; border: 1px solid #C4B5FD; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-weight: 700; font-size: 13px; color: #0F172A;">Validation & Error Handler</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">Joi Request Schemas, Rate Limiter</div>
        </div>
      </div>
    </div>

    <!-- Communication Bridge -->
    <div style="display: flex; justify-content: center; align-items: center; gap: 8px; color: #64748B; font-size: 12px; font-weight: 600;">
      <span>▼</span>
      <span style="background: #F1F5F9; padding: 4px 16px; border-radius: 20px; border: 1px solid #CBD5E1;">Controller to Service Invocations • Request Context & Audit Metadata</span>
      <span>▼</span>
    </div>

    <!-- Tier 3: Business Logic & Domain Services -->
    <div style="background: linear-gradient(135deg, #F8FAFC 0%, #ECFDF5 100%); border: 1.5px solid #A7F3D0; border-radius: 12px; padding: 18px 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-weight: 700; font-size: 14px; color: #065F46; text-transform: uppercase; letter-spacing: 0.05em;">3. Domain Business Services Layer (Core Logic)</span>
        <span style="background: #D1FAE5; color: #065F46; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px;">Business Rules & Guards</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
        <div style="background: white; border: 1px solid #6EE7B7; border-radius: 8px; padding: 10px 8px; text-align: center;">
          <div style="font-weight: 700; font-size: 12px; color: #0F172A;">authService</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 2px;">Bcrypt & Token</div>
        </div>
        <div style="background: white; border: 1px solid #6EE7B7; border-radius: 8px; padding: 10px 8px; text-align: center;">
          <div style="font-weight: 700; font-size: 12px; color: #0F172A;">inventoryService</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 2px;">Stock & Reorder</div>
        </div>
        <div style="background: white; border: 1px solid #6EE7B7; border-radius: 8px; padding: 10px 8px; text-align: center;">
          <div style="font-weight: 700; font-size: 12px; color: #0F172A;">salesService</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 2px;">Orders & Invoices</div>
        </div>
        <div style="background: white; border: 1px solid #6EE7B7; border-radius: 8px; padding: 10px 8px; text-align: center;">
          <div style="font-weight: 700; font-size: 12px; color: #0F172A;">purchaseService</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 2px;">PO & Stock In</div>
        </div>
        <div style="background: white; border: 1px solid #6EE7B7; border-radius: 8px; padding: 10px 8px; text-align: center;">
          <div style="font-weight: 700; font-size: 12px; color: #0F172A;">hrService</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 2px;">Staff & Users</div>
        </div>
        <div style="background: white; border: 1px solid #6EE7B7; border-radius: 8px; padding: 10px 8px; text-align: center;">
          <div style="font-weight: 700; font-size: 12px; color: #0F172A;">reportService</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 2px;">Aggregations</div>
        </div>
      </div>
    </div>

    <!-- Communication Bridge -->
    <div style="display: flex; justify-content: center; align-items: center; gap: 8px; color: #64748B; font-size: 12px; font-weight: 600;">
      <span>▼</span>
      <span style="background: #F1F5F9; padding: 4px 16px; border-radius: 20px; border: 1px solid #CBD5E1;">Mongoose Multi-Document ACID Transactions • Session Management</span>
      <span>▼</span>
    </div>

    <!-- Tier 4: Data Access & Persistence Layer -->
    <div style="background: linear-gradient(135deg, #F8FAFC 0%, #FEF3C7 100%); border: 1.5px solid #FDE68A; border-radius: 12px; padding: 18px 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-weight: 700; font-size: 14px; color: #92400E; text-transform: uppercase; letter-spacing: 0.05em;">4. Data Access & Persistence Layer (Mongoose ODM & MongoDB Atlas)</span>
        <span style="background: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px;">ACID Replica Set</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
        <div style="background: white; border: 1px solid #FCD34D; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-weight: 700; font-size: 13px; color: #0F172A;">Identity & HR</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">User, Employee Collections</div>
        </div>
        <div style="background: white; border: 1px solid #FCD34D; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-weight: 700; font-size: 13px; color: #0F172A;">Catalog & Inventory</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">Product, Category, StockLog</div>
        </div>
        <div style="background: white; border: 1px solid #FCD34D; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-weight: 700; font-size: 13px; color: #0F172A;">Sales & Customers</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">SalesOrder, Customer Documents</div>
        </div>
        <div style="background: white; border: 1px solid #FCD34D; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-weight: 700; font-size: 13px; color: #0F172A;">Procurement & Partners</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px;">PurchaseOrder, Supplier Docs</div>
        </div>
      </div>
    </div>
  </div>
</div>
${HTML_FOOT}
`;

// 2. Role-Based Access Control Hierarchy (Figure 4.2)
const getRbacHtml = () => `
${HTML_HEAD}
<div class="diagram-container">
  <div class="diagram-header">
    <div class="figure-tag">Figure 4.2</div>
    <div class="diagram-title">Role-Based Access Control (RBAC) Hierarchy</div>
    <div class="diagram-desc">Granular Persona Boundaries and Module Permissions across Admin, Manager, and Staff</div>
  </div>

  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
    <!-- Admin Card -->
    <div style="border: 2px solid #3B82F6; border-radius: 12px; overflow: hidden; background: white;">
      <div style="background: #3B82F6; color: white; padding: 16px; text-align: center;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Superuser Level</div>
        <div style="font-size: 18px; font-weight: 800; margin-top: 4px;">Admin Persona</div>
        <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">Full Governance & Configuration</div>
      </div>
      <div style="padding: 16px; font-size: 12px; color: #334155;">
        <div style="font-weight: 700; color: #0F172A; margin-bottom: 8px;">Accessible Modules:</div>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px;">
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Executive Dashboard (Revenue, Profit, Margin)</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> User & Role Management (/hr/users)</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Employee Directory (/hr)</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Inventory & Price Management</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Purchasing & Receive Stock</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Sales Orders & Invoicing</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Reports & CSV Financial Export</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> System Settings (/settings)</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Help & Support Desk (/support)</li>
        </ul>
      </div>
    </div>

    <!-- Manager Card -->
    <div style="border: 2px solid #8B5CF6; border-radius: 12px; overflow: hidden; background: white;">
      <div style="background: #8B5CF6; color: white; padding: 16px; text-align: center;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Operations Level</div>
        <div style="font-size: 18px; font-weight: 800; margin-top: 4px;">Manager Persona</div>
        <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">Supply Chain & Business Execution</div>
      </div>
      <div style="padding: 16px; font-size: 12px; color: #334155;">
        <div style="font-weight: 700; color: #0F172A; margin-bottom: 8px;">Accessible Modules:</div>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px;">
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Operations Dashboard & KPIs</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Inventory & Stock Adjustments</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Purchase Orders & Supplier Records</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Sales Orders & Fulfillment</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Operational Reports & Analytics</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Employee Directory (Read Only)</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Help & Support Desk (/support)</li>
          <li style="display: flex; align-items: center; gap: 6px; color: #EF4444;"><span style="color: #EF4444;">✖</span> 403 Forbidden: User Management</li>
          <li style="display: flex; align-items: center; gap: 6px; color: #EF4444;"><span style="color: #EF4444;">✖</span> 403 Forbidden: System Settings</li>
        </ul>
      </div>
    </div>

    <!-- Staff Card -->
    <div style="border: 2px solid #0D9488; border-radius: 12px; overflow: hidden; background: white;">
      <div style="background: #0D9488; color: white; padding: 16px; text-align: center;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Frontline Desk Level</div>
        <div style="font-size: 18px; font-weight: 800; margin-top: 4px;">Staff Persona</div>
        <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">Counter Sales & Inventory Lookup</div>
      </div>
      <div style="padding: 16px; font-size: 12px; color: #334155;">
        <div style="font-weight: 700; color: #0F172A; margin-bottom: 8px;">Accessible Modules:</div>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px;">
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> POS & Sales Orders Desk</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Customer Records Creation</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Inventory Lookup (Stock Quantity)</li>
          <li style="display: flex; align-items: center; gap: 6px;"><span style="color: #10B981;">✔</span> Help & Support Desk (/support)</li>
          <li style="display: flex; align-items: center; gap: 6px; color: #EF4444;"><span style="color: #EF4444;">✖</span> Redacted: Profit, Margin, Cost Price</li>
          <li style="display: flex; align-items: center; gap: 6px; color: #EF4444;"><span style="color: #EF4444;">✖</span> 403 Forbidden: Purchases Module</li>
          <li style="display: flex; align-items: center; gap: 6px; color: #EF4444;"><span style="color: #EF4444;">✖</span> 403 Forbidden: HR & Users</li>
          <li style="display: flex; align-items: center; gap: 6px; color: #EF4444;"><span style="color: #EF4444;">✖</span> 403 Forbidden: Reports & Settings</li>
        </ul>
      </div>
    </div>
  </div>
</div>
${HTML_FOOT}
`;

// 3. UML Class Diagram of Document Models (Figure 4.3)
const getUmlHtml = () => `
${HTML_HEAD}
<div class="diagram-container">
  <div class="diagram-header">
    <div class="figure-tag">Figure 4.3</div>
    <div class="diagram-title">UML Class Diagram of Document Models</div>
    <div class="diagram-desc">Entity Relational Schema, Attributes, Types, and Multi-Document Associations in MongoDB</div>
  </div>

  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
    <!-- User Entity -->
    <div style="border: 1px solid #CBD5E1; border-radius: 8px; overflow: hidden; background: #FFFFFF; font-size: 11px;">
      <div style="background: #1E293B; color: white; padding: 6px 12px; font-weight: 700; text-align: center;">
        &laquo;document&raquo; User
      </div>
      <div class="code-font" style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #334155; line-height: 1.6;">
        + _id: ObjectId [PK]<br>
        + name: String<br>
        + email: String [Unique]<br>
        + passwordHash: String<br>
        + role: Enum ('admin'|'manager'|'staff')<br>
        + employee: ObjectId [FK &rarr; Employee]<br>
        + isActive: Boolean<br>
        + timestamps: Date
      </div>
      <div class="code-font" style="padding: 6px 12px; color: #64748B; background: #F8FAFC;">
        + comparePassword(pwd): Boolean
      </div>
    </div>

    <!-- Employee Entity -->
    <div style="border: 1px solid #CBD5E1; border-radius: 8px; overflow: hidden; background: #FFFFFF; font-size: 11px;">
      <div style="background: #1E293B; color: white; padding: 6px 12px; font-weight: 700; text-align: center;">
        &laquo;document&raquo; Employee
      </div>
      <div class="code-font" style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #334155; line-height: 1.6;">
        + _id: ObjectId [PK]<br>
        + name: String<br>
        + department: String<br>
        + designation: String<br>
        + email: String<br>
        + phone: String<br>
        + joinDate: Date<br>
        + status: Enum ('active'|'inactive')
      </div>
      <div class="code-font" style="padding: 6px 12px; color: #64748B; background: #F8FAFC;">
        + getActiveProfile(): Object
      </div>
    </div>

    <!-- Product Entity -->
    <div style="border: 1px solid #CBD5E1; border-radius: 8px; overflow: hidden; background: #FFFFFF; font-size: 11px;">
      <div style="background: #0F766E; color: white; padding: 6px 12px; font-weight: 700; text-align: center;">
        &laquo;document&raquo; Product
      </div>
      <div class="code-font" style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #334155; line-height: 1.6;">
        + _id: ObjectId [PK]<br>
        + sku: String [Unique, Indexed]<br>
        + name: String<br>
        + category: ObjectId [FK &rarr; Category]<br>
        + costPrice: Number<br>
        + sellPrice: Number<br>
        + stockQty: Number (&ge; 0)<br>
        + reorderLevel: Number
      </div>
      <div class="code-font" style="padding: 6px 12px; color: #64748B; background: #F8FAFC;">
        + isLowStock(): Boolean
      </div>
    </div>

    <!-- Category Entity -->
    <div style="border: 1px solid #CBD5E1; border-radius: 8px; overflow: hidden; background: #FFFFFF; font-size: 11px;">
      <div style="background: #0F766E; color: white; padding: 6px 12px; font-weight: 700; text-align: center;">
        &laquo;document&raquo; Category
      </div>
      <div class="code-font" style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #334155; line-height: 1.6;">
        + _id: ObjectId [PK]<br>
        + name: String [Unique]<br>
        + description: String<br>
        + timestamps: Date
      </div>
      <div class="code-font" style="padding: 6px 12px; color: #64748B; background: #F8FAFC;">
        + 1 Category has Many Products
      </div>
    </div>

    <!-- Customer & Supplier -->
    <div style="border: 1px solid #CBD5E1; border-radius: 8px; overflow: hidden; background: #FFFFFF; font-size: 11px;">
      <div style="background: #4338CA; color: white; padding: 6px 12px; font-weight: 700; text-align: center;">
        &laquo;document&raquo; Customer / Supplier
      </div>
      <div class="code-font" style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #334155; line-height: 1.6;">
        + _id: ObjectId [PK]<br>
        + name: String<br>
        + email: String<br>
        + phone: String<br>
        + address: String<br>
        + timestamps: Date
      </div>
      <div class="code-font" style="padding: 6px 12px; color: #64748B; background: #F8FAFC;">
        + Partner Association
      </div>
    </div>

    <!-- StockLog Entity -->
    <div style="border: 1px solid #CBD5E1; border-radius: 8px; overflow: hidden; background: #FFFFFF; font-size: 11px;">
      <div style="background: #B45309; color: white; padding: 6px 12px; font-weight: 700; text-align: center;">
        &laquo;document&raquo; StockLog (Audit Ledger)
      </div>
      <div class="code-font" style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #334155; line-height: 1.6;">
        + _id: ObjectId [PK]<br>
        + product: ObjectId [FK &rarr; Product]<br>
        + type: Enum ('in' | 'out')<br>
        + qty: Number<br>
        + balanceAfter: Number<br>
        + referenceType: Enum ('sale'|'purchase'|'adj')<br>
        + referenceId: ObjectId<br>
        + performedBy: ObjectId [FK &rarr; User]
      </div>
      <div class="code-font" style="padding: 6px 12px; color: #64748B; background: #F8FAFC;">
        + Immutable Audit Record
      </div>
    </div>

    <!-- SalesOrder Entity -->
    <div style="grid-column: span 1.5; border: 1px solid #CBD5E1; border-radius: 8px; overflow: hidden; background: #FFFFFF; font-size: 11px;">
      <div style="background: #1D4ED8; color: white; padding: 6px 12px; font-weight: 700; text-align: center;">
        &laquo;document&raquo; SalesOrder
      </div>
      <div class="code-font" style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #334155; line-height: 1.6;">
        + _id: ObjectId [PK]<br>
        + invoiceNo: String [Unique, Sparse]<br>
        + customer: ObjectId [FK &rarr; Customer]<br>
        + items: [ { product: ObjectId, qty: Number, price: Number } ]<br>
        + total: Number<br>
        + status: Enum ('draft' | 'confirmed' | 'completed' | 'cancelled')<br>
        + createdBy: ObjectId [FK &rarr; User]<br>
        + createdAt: Date
      </div>
      <div class="code-font" style="padding: 6px 12px; color: #64748B; background: #F8FAFC;">
        + confirmOrder(session): Transaction
      </div>
    </div>

    <!-- PurchaseOrder Entity -->
    <div style="grid-column: span 1.5; border: 1px solid #CBD5E1; border-radius: 8px; overflow: hidden; background: #FFFFFF; font-size: 11px;">
      <div style="background: #047857; color: white; padding: 6px 12px; font-weight: 700; text-align: center;">
        &laquo;document&raquo; PurchaseOrder
      </div>
      <div class="code-font" style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #334155; line-height: 1.6;">
        + _id: ObjectId [PK]<br>
        + supplier: ObjectId [FK &rarr; Supplier]<br>
        + items: [ { product: ObjectId, qty: Number, cost: Number } ]<br>
        + total: Number<br>
        + status: Enum ('draft' | 'ordered' | 'received' | 'cancelled')<br>
        + receivedAt: Date<br>
        + createdBy: ObjectId [FK &rarr; User]<br>
        + createdAt: Date
      </div>
      <div class="code-font" style="padding: 6px 12px; color: #64748B; background: #F8FAFC;">
        + receiveStock(session): Transaction
      </div>
    </div>
  </div>
</div>
${HTML_FOOT}
`;

// 4. Sales Order Confirmation Sequence Diagram (Figure 4.4)
const getSequenceHtml = () => `
${HTML_HEAD}
<div class="diagram-container">
  <div class="diagram-header">
    <div class="figure-tag">Figure 4.4</div>
    <div class="diagram-title">Sales Order Confirmation Sequence Diagram</div>
    <div class="diagram-desc">Multi-step Transactional Workflow: Authentication, Stock Guard, Atomic Decrement, Ledger Log & Invoice Generation</div>
  </div>

  <svg viewBox="0 0 1000 640" width="100%" height="auto" style="font-family: 'Plus Jakarta Sans', sans-serif;">
    <!-- Lifelines -->
    <!-- Headers -->
    <g font-size="12" font-weight="700" text-anchor="middle">
      <!-- Client -->
      <rect x="20" y="20" width="120" height="36" rx="6" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1.5"/>
      <text x="80" y="42" fill="#1E40AF">Client (React)</text>
      <line x1="80" y1="56" x2="80" y2="600" stroke="#94A3B8" stroke-dasharray="4 4"/>

      <!-- API Gateway -->
      <rect x="180" y="20" width="130" height="36" rx="6" fill="#F5F3FF" stroke="#8B5CF6" stroke-width="1.5"/>
      <text x="245" y="42" fill="#5B21B6">API Auth Guard</text>
      <line x1="245" y1="56" x2="245" y2="600" stroke="#94A3B8" stroke-dasharray="4 4"/>

      <!-- Sales Controller -->
      <rect x="350" y="20" width="130" height="36" rx="6" fill="#F8FAFC" stroke="#64748B" stroke-width="1.5"/>
      <text x="415" y="42" fill="#334155">SalesController</text>
      <line x1="415" y1="56" x2="415" y2="600" stroke="#94A3B8" stroke-dasharray="4 4"/>

      <!-- Sales Service -->
      <rect x="520" y="20" width="130" height="36" rx="6" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5"/>
      <text x="585" y="42" fill="#065F46">SalesService</text>
      <line x1="585" y1="56" x2="585" y2="600" stroke="#94A3B8" stroke-dasharray="4 4"/>

      <!-- MongoDB Session & Transaction -->
      <rect x="690" y="20" width="130" height="36" rx="6" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
      <text x="755" y="42" fill="#92400E">Mongoose Tx Session</text>
      <line x1="755" y1="56" x2="755" y2="600" stroke="#94A3B8" stroke-dasharray="4 4"/>

      <!-- Product & StockLog Models -->
      <rect x="850" y="20" width="130" height="36" rx="6" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.5"/>
      <text x="915" y="42" fill="#991B1B">Product & StockLog</text>
      <line x1="915" y1="56" x2="915" y2="600" stroke="#94A3B8" stroke-dasharray="4 4"/>
    </g>

    <!-- Marker Arrow -->
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
      </marker>
      <marker id="arrow-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563EB" />
      </marker>
      <marker id="arrow-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
      </marker>
    </defs>

    <!-- Step 1: PUT Request -->
    <line x1="80" y1="85" x2="245" y2="85" stroke="#2563EB" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
    <text x="162" y="78" font-size="11" font-weight="600" fill="#1E40AF" text-anchor="middle">1. PUT /api/sales/:id/confirm (JWT)</text>

    <!-- Step 2: Auth & Role Verification -->
    <rect x="235" y="100" width="20" height="35" rx="3" fill="#DDD6FE"/>
    <path d="M 255 110 C 290 110, 290 128, 255 128" fill="none" stroke="#6D28D9" stroke-width="1.5" marker-end="url(#arrow)"/>
    <text x="360" y="122" font-size="11" fill="#4C1D95">2. Verify JWT & Check Role (Admin/Manager/Staff)</text>

    <!-- Step 3: Controller Call -->
    <line x1="245" y1="150" x2="415" y2="150" stroke="#334155" stroke-width="1.5" marker-end="url(#arrow)"/>
    <text x="330" y="143" font-size="11" fill="#334155" text-anchor="middle">3. confirmOrder(req, res)</text>

    <!-- Step 4: Service Call -->
    <line x1="415" y1="180" x2="585" y2="180" stroke="#334155" stroke-width="1.5" marker-end="url(#arrow)"/>
    <text x="500" y="173" font-size="11" fill="#334155" text-anchor="middle">4. confirmSalesOrder(orderId, userId)</text>

    <!-- Step 5: Start Transaction -->
    <line x1="585" y1="215" x2="755" y2="215" stroke="#D97706" stroke-width="1.5" marker-end="url(#arrow)"/>
    <text x="670" y="208" font-size="11" font-weight="600" fill="#B45309" text-anchor="middle">5. startSession() & startTransaction()</text>

    <!-- Step 6: Read Order Document -->
    <line x1="585" y1="255" x2="755" y2="255" stroke="#334155" stroke-width="1.5" marker-end="url(#arrow)"/>
    <text x="670" y="248" font-size="11" fill="#334155" text-anchor="middle">6. SalesOrder.findById().session()</text>

    <line x1="755" y1="285" x2="585" y2="285" stroke="#94A3B8" stroke-dasharray="3 3" stroke-width="1.5" marker-end="url(#arrow)"/>
    <text x="670" y="278" font-size="11" fill="#64748B" text-anchor="middle">Order doc (status: 'draft', items)</text>

    <!-- Loop Box for Line Items -->
    <rect x="530" y="305" width="430" height="135" rx="6" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.2" stroke-dasharray="5 5"/>
    <text x="540" y="322" font-size="10" font-weight="700" fill="#475569">LOOP: For Each Order Item [Product, Qty]</text>

    <!-- Step 7: Conditional Stock Decrement -->
    <line x1="585" y1="345" x2="915" y2="345" stroke="#DC2626" stroke-width="1.5" marker-end="url(#arrow)"/>
    <text x="750" y="338" font-size="11" font-weight="600" fill="#B91C1C" text-anchor="middle">7. findOneAndUpdate({ stockQty: { $gte: qty } }, { $inc: -qty })</text>

    <!-- Step 8: Stock Guard OK -->
    <line x1="915" y1="375" x2="585" y2="375" stroke="#16A34A" stroke-width="1.5" marker-end="url(#arrow-green)"/>
    <text x="750" y="368" font-size="11" fill="#15803D" text-anchor="middle">Stock decremented atomically & balance returned</text>

    <!-- Step 9: Insert StockLog -->
    <line x1="585" y1="410" x2="915" y2="410" stroke="#334155" stroke-width="1.5" marker-end="url(#arrow)"/>
    <text x="750" y="403" font-size="11" fill="#334155" text-anchor="middle">8. StockLog.create({ type: 'out', qty, ref: 'sale' }, { session })</text>

    <!-- Step 10: Update Order Status & Assign Invoice -->
    <path d="M 585 460 C 620 460, 620 480, 585 480" fill="none" stroke="#2563EB" stroke-width="1.5" marker-end="url(#arrow-blue)"/>
    <text x="715" y="473" font-size="11" fill="#1E40AF">9. Assign Invoice Number ('INV-2026-XXXX') & status = 'confirmed'</text>

    <!-- Step 11: Commit Transaction -->
    <line x1="585" y1="510" x2="755" y2="510" stroke="#059669" stroke-width="1.8" marker-end="url(#arrow-green)"/>
    <text x="670" y="503" font-size="11" font-weight="700" fill="#047857" text-anchor="middle">10. commitTransaction() & endSession()</text>

    <!-- Step 12: Return to Controller -->
    <line x1="585" y1="540" x2="415" y2="540" stroke="#334155" stroke-dasharray="3 3" stroke-width="1.5" marker-end="url(#arrow)"/>
    <text x="500" y="533" font-size="11" fill="#334155" text-anchor="middle">Confirmed Order Payload</text>

    <!-- Step 13: HTTP 200 to Client -->
    <line x1="415" y1="570" x2="80" y2="570" stroke="#16A34A" stroke-width="2" marker-end="url(#arrow-green)"/>
    <text x="245" y="563" font-size="11" font-weight="700" fill="#15803D" text-anchor="middle">11. HTTP 200 OK { success: true, data: order }</text>

    <!-- Step 14: Client Toast & Refresh -->
    <path d="M 80 580 C 110 580, 110 598, 80 598" fill="none" stroke="#16A34A" stroke-width="1.5" marker-end="url(#arrow-green)"/>
    <text x="180" y="594" font-size="10" fill="#15803D">12. Trigger Toast & Refresh List</text>
  </svg>
</div>
${HTML_FOOT}
`;

// 5. Transactional Stock Update Flowchart (Figure 4.5)
const getFlowchartHtml = () => `
${HTML_HEAD}
<div class="diagram-container">
  <div class="diagram-header">
    <div class="figure-tag">Figure 4.5</div>
    <div class="diagram-title">Transactional Stock Update Algorithm Flowchart</div>
    <div class="diagram-desc">Standardized Atomic Stock Change Routine: Guards, Rollback Mechanism, and Multi-Document Consistency</div>
  </div>

  <svg viewBox="0 0 900 800" width="100%" height="auto" style="font-family: 'Plus Jakarta Sans', sans-serif;">
    <defs>
      <marker id="fc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
      </marker>
      <marker id="fc-arrow-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#16A34A" />
      </marker>
      <marker id="fc-arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#DC2626" />
      </marker>
    </defs>

    <!-- 1. Start Node -->
    <rect x="350" y="20" width="200" height="40" rx="20" fill="#1E293B" stroke="#0F172A" stroke-width="1.5"/>
    <text x="450" y="45" fill="white" font-size="12" font-weight="700" text-anchor="middle">START: Stock Mutation Request</text>

    <line x1="450" y1="60" x2="450" y2="90" stroke="#475569" stroke-width="1.5" marker-end="url(#fc-arrow)"/>

    <!-- 2. Auth & Validation -->
    <rect x="300" y="90" width="300" height="46" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="450" y="112" fill="#0F172A" font-size="12" font-weight="600" text-anchor="middle">Verify Bearer JWT & Check Role Access</text>
    <text x="450" y="127" fill="#64748B" font-size="10" text-anchor="middle">Validate Schema & Sanitize Payload</text>

    <line x1="450" y1="136" x2="450" y2="165" stroke="#475569" stroke-width="1.5" marker-end="url(#fc-arrow)"/>

    <!-- 3. Decision 1: Auth OK? -->
    <polygon points="450,165 570,210 450,255 330,210" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1.5"/>
    <text x="450" y="207" fill="#1E40AF" font-size="11" font-weight="700" text-anchor="middle">Authentication &</text>
    <text x="450" y="222" fill="#1E40AF" font-size="11" font-weight="700" text-anchor="middle">Payload Valid?</text>

    <!-- Branch NO -> 401/403/400 -->
    <line x1="570" y1="210" x2="720" y2="210" stroke="#DC2626" stroke-width="1.5" marker-end="url(#fc-arrow-red)"/>
    <text x="635" y="202" fill="#DC2626" font-size="11" font-weight="700">NO</text>

    <rect x="720" y="190" width="150" height="40" rx="6" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.5"/>
    <text x="795" y="215" fill="#991B1B" font-size="11" font-weight="700" text-anchor="middle">Return 401 / 403 / 400</text>

    <!-- Branch YES -> Start Session -->
    <line x1="450" y1="255" x2="450" y2="290" stroke="#16A34A" stroke-width="1.5" marker-end="url(#fc-arrow-green)"/>
    <text x="460" y="275" fill="#16A34A" font-size="11" font-weight="700">YES</text>

    <!-- 4. Start Session & Tx -->
    <rect x="290" y="290" width="320" height="46" rx="8" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="450" y="312" fill="#92400E" font-size="12" font-weight="700" text-anchor="middle">Start Session & Begin ACID Transaction</text>
    <text x="450" y="327" fill="#B45309" font-size="10" text-anchor="middle">session = await mongoose.startSession();</text>

    <line x1="450" y1="336" x2="450" y2="365" stroke="#475569" stroke-width="1.5" marker-end="url(#fc-arrow)"/>

    <!-- 5. Read Target Document -->
    <rect x="300" y="365" width="300" height="40" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="450" y="390" fill="#0F172A" font-size="12" font-weight="600" text-anchor="middle">Fetch Target Order & Lock Line Items</text>

    <line x1="450" y1="405" x2="450" y2="435" stroke="#475569" stroke-width="1.5" marker-end="url(#fc-arrow)"/>

    <!-- 6. Decision 2: Business Guards Valid? -->
    <polygon points="450,435 580,480 450,525 320,480" fill="#FEF2F2" stroke="#EF4444" stroke-width="1.5"/>
    <text x="450" y="475" fill="#991B1B" font-size="11" font-weight="700" text-anchor="middle">Stock Available (&ge; qty) &</text>
    <text x="450" y="490" fill="#991B1B" font-size="11" font-weight="700" text-anchor="middle">State Transition Valid?</text>

    <!-- Branch NO -> Abort Transaction -->
    <line x1="580" y1="480" x2="720" y2="480" stroke="#DC2626" stroke-width="1.5" marker-end="url(#fc-arrow-red)"/>
    <text x="635" y="472" fill="#DC2626" font-size="11" font-weight="700">NO</text>

    <rect x="720" y="455" width="160" height="50" rx="6" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
    <text x="800" y="478" fill="#991B1B" font-size="11" font-weight="700" text-anchor="middle">Abort Transaction</text>
    <text x="800" y="495" fill="#B91C1C" font-size="10" text-anchor="middle">session.abortTransaction()</text>

    <line x1="800" y1="505" x2="800" y2="550" stroke="#DC2626" stroke-width="1.5"/>
    <line x1="800" y1="550" x2="700" y2="550" stroke="#DC2626" stroke-width="1.5" marker-end="url(#fc-arrow-red)"/>

    <rect x="540" y="535" width="160" height="36" rx="6" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.2"/>
    <text x="620" y="557" fill="#991B1B" font-size="10" font-weight="600" text-anchor="middle">Return 400 Guard Error</text>

    <!-- Branch YES -> Atomic Update -->
    <line x1="450" y1="525" x2="450" y2="555" stroke="#16A34A" stroke-width="1.5" marker-end="url(#fc-arrow-green)"/>
    <text x="460" y="542" fill="#16A34A" font-size="11" font-weight="700">YES</text>

    <!-- 7. Conditional Atomic Decrement -->
    <rect x="290" y="555" width="320" height="42" rx="8" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5"/>
    <text x="450" y="575" fill="#065F46" font-size="11" font-weight="700" text-anchor="middle">Execute Atomic Conditional Update</text>
    <text x="450" y="590" fill="#047857" font-size="10" text-anchor="middle">Product.findOneAndUpdate({ $inc: &plusmn;qty })</text>

    <line x1="450" y1="597" x2="450" y2="625" stroke="#475569" stroke-width="1.5" marker-end="url(#fc-arrow)"/>

    <!-- 8. Insert StockLog -->
    <rect x="300" y="625" width="300" height="40" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="450" y="645" fill="#0F172A" font-size="11" font-weight="600" text-anchor="middle">Insert Immutable StockLog Audit Record</text>
    <text x="450" y="658" fill="#64748B" font-size="9" text-anchor="middle">Balance snapshot & Reference Document ID</text>

    <line x1="450" y1="665" x2="450" y2="690" stroke="#475569" stroke-width="1.5" marker-end="url(#fc-arrow)"/>

    <!-- 9. Commit Transaction -->
    <rect x="300" y="690" width="300" height="42" rx="8" fill="#ECFDF5" stroke="#059669" stroke-width="1.8"/>
    <text x="450" y="710" fill="#065F46" font-size="12" font-weight="800" text-anchor="middle">Commit ACID Transaction</text>
    <text x="450" y="724" fill="#047857" font-size="10" text-anchor="middle">await session.commitTransaction();</text>

    <line x1="450" y1="732" x2="450" y2="760" stroke="#475569" stroke-width="1.5" marker-end="url(#fc-arrow)"/>

    <!-- 10. Success End -->
    <rect x="340" y="760" width="220" height="36" rx="18" fill="#15803D" stroke="#166534" stroke-width="1.5"/>
    <text x="450" y="783" fill="white" font-size="11" font-weight="700" text-anchor="middle">HTTP 200 OK & Toast Feedback</text>
  </svg>
</div>
${HTML_FOOT}
`;

async function renderDiagrams() {
  console.log('Launching Chrome to render publication-grade diagrams...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 950, deviceScaleFactor: 2 });

  // 1. Figure 4.1
  console.log('Rendering Figure 4.1: Layered System Architecture...');
  await page.setContent(getArchitectureHtml(), { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  const fig41Elem = await page.$('.diagram-container');
  await fig41Elem.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_4_1_Layered_Architecture.png') });

  // 2. Figure 4.2
  console.log('Rendering Figure 4.2: Role-Based Access Control Hierarchy...');
  await page.setContent(getRbacHtml(), { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  const fig42Elem = await page.$('.diagram-container');
  await fig42Elem.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_4_2_RBAC_Hierarchy.png') });

  // 3. Figure 4.3
  console.log('Rendering Figure 4.3: UML Class Diagram of Document Models...');
  await page.setContent(getUmlHtml(), { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  const fig43Elem = await page.$('.diagram-container');
  await fig43Elem.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_4_3_UML_Class_Diagram.png') });

  // 4. Figure 4.4
  console.log('Rendering Figure 4.4: Sales Order Confirmation Sequence Diagram...');
  await page.setContent(getSequenceHtml(), { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  const fig44Elem = await page.$('.diagram-container');
  await fig44Elem.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_4_4_Sequence_Diagram.png') });

  // 5. Figure 4.5
  console.log('Rendering Figure 4.5: Transactional Stock Update Algorithm Flowchart...');
  await page.setContent(getFlowchartHtml(), { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  const fig45Elem = await page.$('.diagram-container');
  await fig45Elem.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_4_5_Stock_Update_Flowchart.png') });

  console.log('All 5 diagrams rendered with crystal-clear vector precision!');
  await browser.close();
}

renderDiagrams().catch(err => {
  console.error('Error rendering diagrams:', err);
  process.exit(1);
});
