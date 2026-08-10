# Farming Expertise Feature & Architecture Documentation

This document provides a comprehensive technical overview of the newly implemented **Farming Expertise Request & Guidance System** in AgriSphere. It documents all created/modified files, their absolute and relative paths, their responsibilities, and the exact HTTP request flow between frontend components and backend controllers.

---

## 📌 1. Feature Overview

The **Farming Expertise Feature** provides an interactive master-detail platform allowing farmers to request specialized agricultural guidance from experts for their crops and allowing experts to respond with structured advice and attached documents or stock crop presets.

### Core Capabilities:
- **Farmer Workflow**:
  - Request guidance by submitting a **Crop Name** (required) and **Comment / Details** (optional).
  - View a master list of past requests on the left sidebar.
  - Collapse/expand the requests list or switch to the submission form on the right panel.
  - View expert advice and click attached documents/images (PDF/PNG/JPG or 34 Stock Crop presets) to open in high resolution.
- **Expert Workflow**:
  - View all farmer expertise requests filtered by status (**All**, **Pending**, **Answered**).
  - Submit detailed guidance and attach either one of the **34 Stock Crop presets** or a **Custom Uploaded File (PNG/JPG/PDF)**.
  - Fast preset selector with clean crop names.
- **Real-Time Notifications**:
  - Automatically notifies farmers when an expert submits a response.

---

## 📁 2. Detailed File Structure & Responsibilities

Below is the list of all files involved in this feature, categorized by component layer:

### A. Backend Files (API, Models, Controllers, Uploads)

1. **`backend/models/FarmingExpertiseRequest.js`**
   - **Path**: `c:\GAMES\cse471 lab\project 2\cse471-agrisphere\backend\models\FarmingExpertiseRequest.js`
   - **Role**: Mongoose Data Schema.
   - **Schema Details**:
     - `farmer`: ObjectId ref to User.
     - `cropName`: String (required).
     - `comment`: String.
     - `status`: String enum `['pending', 'answered']` (default: `'pending'`).
     - `response`: Sub-document containing `expert` (User ref), `expertName`, `description`, `attachment`, `attachmentType` (`'stock_image'` | `'file'`), and `answeredAt`.

2. **`backend/controllers/farmingExpertiseController.js`**
   - **Path**: `c:\GAMES\cse471 lab\project 2\cse471-agrisphere\backend\controllers\farmingExpertiseController.js`
   - **Role**: Business logic controller.
   - **Functions**:
     - `createRequest`: Validates input and creates a new `FarmingExpertiseRequest`.
     - `getRequests`: Retrieves requests. If user role is `'farmer'`, filters by `farmerId`. If `'expert'` or `'admin'`, fetches all requests.
     - `getRequestById`: Retrieves a single request with populated farmer details.
     - `getStockImages`: Scans `backend/uploads/stock-crops/` folder using `fs.readdirSync` and returns preset names and URLs.
     - `provideExpertise`: Saves expert advice, handles uploaded file path or stock image preset path, updates status to `'answered'`, and emits a notification to the farmer.

3. **`backend/routes/farmingExpertiseRoutes.js`**
   - **Path**: `c:\GAMES\cse471 lab\project 2\cse471-agrisphere\backend\routes\farmingExpertiseRoutes.js`
   - **Role**: Express router with authentication and file upload middleware.
   - **Middleware Used**:
     - `protect`: Verifies JWT token.
     - `upload.single('attachment')`: Handles file uploads for PNG, JPG, JPEG, WEBP, and PDF files.

4. **`backend/server.js`**
   - **Path**: `c:\GAMES\cse471 lab\project 2\cse471-agrisphere\backend\server.js`
   - **Role**: Application entry point.
   - **Action**: Mounts `/api/farming-expertise` router and serves `/uploads` static directory.

5. **`backend/uploads/stock-crops/`**
   - **Path**: `c:\GAMES\cse471 lab\project 2\cse471-agrisphere\backend\uploads\stock-crops\`
   - **Role**: Directory holding 34 stock crop JPG files (`Aman.jpg`, `Guava.jpg`, `Wheat.jpg`, `Jute.jpg`, etc.).

6. **`backend/uploads/expertise-attachments/`**
   - **Path**: `c:\GAMES\cse471 lab\project 2\cse471-agrisphere\backend\uploads\expertise-attachments\`
   - **Role**: Directory holding expert-uploaded custom files (PNG, JPG, PDF).

---

### B. Frontend Files (Components, Views, Router, Styles)

1. **`frontend/src/pages/RequestFarmingExpertise.vue`**
   - **Path**: `c:\GAMES\cse471 lab\project 2\cse471-agrisphere\frontend\src\pages\RequestFarmingExpertise.vue`
   - **Role**: Farmer view page.
   - **UI Design**: Master-Detail layout.
     - Left Sidebar: `+ Submit New Request` button and collapsible `My Requests` list.
     - Right Panel: Dynamically renders either the **Submit New Request Form** or **Selected Request Details & Expert Response**.

2. **`frontend/src/pages/ProvideFarmingExpertise.vue`**
   - **Path**: `c:\GAMES\cse471 lab\project 2\cse471-agrisphere\frontend\src\pages\ProvideFarmingExpertise.vue`
   - **Role**: Expert review & response page.
   - **UI Design**:
     - Filter tabs (`All`, `Pending`, `Answered`).
     - Fast Stock Preset selector buttons + Custom File Uploader.

3. **`frontend/src/pages/ProvideCropDiagnosisReport.vue`**
   - **Path**: `c:\GAMES\cse471 lab\project 2\cse471-agrisphere\frontend\src\pages\ProvideCropDiagnosisReport.vue`
   - **Role**: Expert crop disease diagnosis report page.

4. **`frontend/src/components/Navbar.vue`**
   - **Path**: `c:\GAMES\cse471 lab\project 2\cse471-agrisphere\frontend\src\components\Navbar.vue`
   - **Role**: Top navigation bar refactored with distinct dropdowns for `Consultation`, `Diagnosis`, and `Farming Expertise`.

5. **`frontend/src/router/index.js`**
   - **Path**: `c:\GAMES\cse471 lab\project 2\cse471-agrisphere\frontend\src\router\index.js`
   - **Role**: Vue Router registration.
   - **Routes**:
     - `/farming-expertise/request` -> `RequestFarmingExpertise.vue`
     - `/farming-expertise/provide` -> `ProvideFarmingExpertise.vue`
     - `/provide-crop-diagnosis-report` -> `ProvideCropDiagnosisReport.vue`

6. **`frontend/src/assets/theme.css`**
   - **Path**: `c:\GAMES\cse471 lab\project 2\cse471-agrisphere\frontend\src\assets\theme.css`
   - **Role**: Centralized global stylesheet. All custom CSS rules were integrated here to eliminate inline `<style scoped>` blocks in accordance with project standards.

---

## 🔄 3. HTTP Request Mapping & API Endpoints

Below is the complete request table showing **Which File sends/receives Which Request**:

| HTTP Method | API Endpoint | Handler File & Function | Frontend Trigger Component | Purpose / Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/farming-expertise` | `farmingExpertiseController.createRequest` | `RequestFarmingExpertise.vue` (`handleSubmitRequest`) | Creates a new crop expertise request. |
| **GET** | `/api/farming-expertise` | `farmingExpertiseController.getRequests` | `RequestFarmingExpertise.vue` & `ProvideFarmingExpertise.vue` (`loadRequests`) | Lists requests for farmer (own) or expert (all). |
| **GET** | `/api/farming-expertise/stock-images` | `farmingExpertiseController.getStockImages` | `ProvideFarmingExpertise.vue` (`loadStockImages`) | Scans and lists the 34 stock crop JPG presets. |
| **GET** | `/api/farming-expertise/:id` | `farmingExpertiseController.getRequestById` | `RequestFarmingExpertise.vue` & `ProvideFarmingExpertise.vue` (`selectRequest`) | Fetches full request details and expert response. |
| **POST** | `/api/farming-expertise/:id/respond` | `farmingExpertiseController.provideExpertise` | `ProvideFarmingExpertise.vue` (`handleSubmitResponse`) | Saves expert advice and attachment (preset or file). |

---

## 🎨 4. Design & Architectural Standards

- **Centralized CSS**: All styling is defined in `theme.css`. Scoped `<style>` blocks inside Vue files have been completely eliminated.
- **Clean Preset Display**: Presets are rendered with human-readable names (e.g. `Guava`) instead of raw filesystem paths.
- **Click-to-View Attachments**: Image previews and PDF guides open directly in a new browser tab (`target="_blank" rel="noopener noreferrer"`).
- **No Emojis Rule**: Clean text labels and standard icons are used throughout the UI.
