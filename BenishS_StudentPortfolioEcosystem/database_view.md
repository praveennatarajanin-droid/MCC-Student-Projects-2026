# Madras Christian College – Database Values (PostgreSQL Engine)

This is an offline representation of the active relational data stored in your local PostgreSQL database server at database `mcc_portfolio`. You can query, view, and administer the tables dynamically using the credentials and instructions below.

---

## 🔑 Database Credentials & Configurations
The active connection settings specified inside [appsettings.json](file:///d:/spe/backend/StudentPortfolio.API/appsettings.json) are:
* **Host**: `localhost` (port `5432`)
* **Database**: `mcc_portfolio`
* **Username**: `postgres`
* **Password**: `ben2514`

---

## 👥 Table: `Users`
Holds credentials, SHA256 password hashes, and user roles.
* *Admin*: `admin` / `admin123`
* *Students*: `franklinraj` / `student123`, `benish` / `student123`

| Id | Username | Email | Role | Password Hash (SHA256) |
|---|---|---|---|---|
| **1** | `admin` | `admin@mcc.edu` | `Admin` | `yA9W...` (hashed `admin123`) |
| **2** | `franklinraj` | `franklin@mcc.edu` | `Student` | `u4tY...` (hashed `student123`) |
| **3** | `benish` | `ben@mcc.edu` | `Student` | `u4tY...` (hashed `student123`) |

---

## 🎓 Table: `StudentProfiles`
Holds the customizable profile values for students.

| Id | UserId | Full Name | Department | Bio / Story | Theme | Approved? |
|---|---|---|---|---|---|---|
| **1** | 2 | **Franklin Raj** | Computer Science | Passionate full-stack developer with keen interest in cloud architecture... | `AI Futuristic` | ✅ **True** (Publicly visible) |
| **2** | 3 | **Benish Samuel** | Computer Science | UI/UX enthusiast and frontend developer interested in gorgeous... | `Creative` | ⏳ **False** (Pending Admin Approval) |

---

## 💻 Table: `Projects`
Holds student coding projects linked to `StudentProfiles`.

| Id | ProfileId | Title | Description | Tech Stack | GitHub Link | Demo Link |
|---|---|---|---|---|---|---|
| **1** | 1 | **MCC Campus Navigator** | An interactive 3D navigation assistant for Madras Christian College. | React, Three.js, Tailwind, .NET Core | [Link](https://github.com/franklinraj/campus-navigator) | [Demo](https://navigator.mcc.edu) |
| **2** | 1 | **EcoRoute Logistics** | Smart routing algorithm to minimize fuel emissions. | Next.js, Python, Flask, Google Maps | [Link](https://github.com/franklinraj/ecoroute-optimizer) | — |

---

## 🎨 Table: `CreativeWorks`
Holds creative art, photography, graphic designs, and portfolio media.

| Id | ProfileId | Title | Description | ImageUrl | Project Link | Date |
|---|---|---|---|---|---|---|
| **1** | 1 | **MCC Quadrangle Sketch** | Digital vector illustration of the historic quadrangle architecture. | *Base64 Image Data* | — | 2026-05-15 |

---

## 📢 Table: `Notifications`
Holds college-wide broadcast announcements managed by Super Admins.

| Id | Title | Message | CreatedAt | IsActive |
|---|---|---|---|---|
| **1** | **Smart India Hackathon** | Registrations are now open for SIH 2026. Submit your team roster before Friday. | *Timestamp* | ✅ **True** |
| **2** | **NAAC Portfolios Due** | All final year students must complete and verify their portfolios for the upcoming audit. | *Timestamp* | ✅ **True** |

---

## 🏫 Table: `Institutions`
Holds dynamic global MCC branding configurations.

| Id | Name | ShortName | LogoUrl | BannerUrl | Address | ContactEmail | WebsiteUrl |
|---|---|---|---|---|---|---|---|
| **1** | Madras Christian College | MCC | *Dynamic URL* | *Dynamic URL* | Tambaram, Chennai | principal@mcc.edu | https://mcc.edu |

---

## 🎨 Table: `ThemeConfigs`
Lists dynamic templates and allowed statuses across the college.

| Id | Name | PrimaryColor | IsEnabled |
|---|---|---|---|
| **1** | Academic | `#800020` | ✅ **True** |
| **2** | Corporate | `#1e40af` | ✅ **True** |
| **3** | Startup | `#10b981` | ✅ **True** |
| **4** | Creative | `#d946ef` | ✅ **True** |
| **5** | AI Futuristic | `#06b6d4` | ✅ **True** |

---

## 🛠️ How to View and Query the PostgreSQL Tables:

### Option 1: View using pgAdmin 4
1. Open **pgAdmin 4** on your machine.
2. Register a new server pointing to connection details:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Username**: `postgres`
   - **Password**: `ben2514`
3. Expand **Databases** -> **`mcc_portfolio`** -> **Schemas** -> **public** -> **Tables** to view all tables and query them.

### Option 2: Command Line (psql)
Run the following in your terminal to log in directly:
```bash
psql -U postgres -d mcc_portfolio -h localhost
```
Enter your password `ben2514` when prompted. Use standard SQL select queries to inspect records.

### Option 3: VS Code / Cursor Database Extension
1. Install the **"PostgreSQL"** extension (by *Weijan Chen*) in VS Code.
2. Add a connection string using your host and password settings.
3. Access records and test database queries directly inside your editor workspace.
