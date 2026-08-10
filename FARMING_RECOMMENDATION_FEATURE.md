# Farming Recommendation Feature Documentation

This document explains the architecture, ML model integration, database persistence, API endpoints, and file responsibilities for the **Farming Crop Recommendation** feature in AgriSphere.

---

## 1. Feature Overview & How It Works

The Farming Recommendation feature predicts the most suitable crop for a field based on soil nutrients (Nitrogen, Phosphorus, Potassium, pH) and environmental condition metrics (Temperature, Humidity, Soil Moisture, Rainfall).

### High-Level Workflow:
1. **User Authentication Check**: Users must be authenticated (logged in as a **Farmer**, **Expert**, or Admin). Unauthenticated guest access is blocked.
2. **User Input**: The authenticated user enters 8 environmental and soil metrics into the Vue 3 frontend form.
3. **REST API Request**: The frontend sends a `POST` request with `Authorization: Bearer <token>` to `/api/farming-recommendation/predict`.
4. **ML Inference Process**:
   - The Express backend verifies the user JWT (`protect` middleware).
   - The backend spawns the Python inference script (`farmingrecommendationpredict.py`).
   - Python loads 4 pre-trained ML artifacts (`poly_transform.pkl`, `scaler.pkl`, `best_gb_model.pkl`, `label_encoder.pkl`).
   - The input vector `[N, P, K, pH, Temp, Humidity, Moisture, Rainfall]` is transformed, scaled, and evaluated by the Gradient Boosting classifier.
   - The predicted crop label (e.g., `rice`, `wheat`, `maize`, `chickpea`, etc.) is returned to Node.js via `stdout`.
5. **Database Persistence**: Node.js automatically saves the 8 input parameters, predicted crop result, authenticated user ID (`req.user._id`), and timestamp into MongoDB under the `FarmingRecommendation` collection.
6. **Real-time History Update**: The new recommendation is immediately prepended to the user's recommendation history log in the frontend.
   - Clicking **"History Log"** header toggles the history sidebar accordion.
   - Clicking any individual past recommendation item opens its full input breakdown on the right panel, with an option to reload those parameters into the form.

---

## 2. File Map & File Responsibilities

Below is the breakdown of all files powering the Farming Recommendation feature:

### ML Models & Python Inference
- **`backend/ml_models/best_gb_model.pkl`**: Serialized Gradient Boosting classification model trained on crop dataset.
- **`backend/ml_models/scaler.pkl`**: `StandardScaler` artifact for feature normalization.
- **`backend/ml_models/label_encoder.pkl`**: `LabelEncoder` artifact mapping class indices back to crop names.
- **`backend/ml_models/poly_transform.pkl`**: `PolynomialFeatures` transformer creating interaction features.
- **`backend/farmingrecommendationpredict.py`**: Python script invoked via command-line arguments. Loads joblib artifacts, processes input arguments, predicts crop, and prints output.

### Backend Data Model & Logic
- **`backend/models/FarmingRecommendation.js`**: Mongoose model defining schema for saving inputs (`n`, `p`, `k`, `ph`, `temperature`, `humidity`, `moisture`, `rainfall`), output `recommendedCrop`, required `user` ref, and `timestamps`.
- **`backend/controllers/farmingRecommendationController.js`**: Controller containing business logic:
  - `predictCrop`: Validates request body, spawns Python inference script, saves input/output record under `req.user._id` to MongoDB, and returns prediction.
  - `getHistory`: Fetches recommendation history for `req.user._id` sorted by newest first (`createdAt: -1`).
  - `getHistoryById`: Retrieves details of a specific recommendation record by ID for `req.user._id`.
  - `deleteHistory`: Removes a recommendation record from MongoDB for `req.user._id`.
- **`backend/routes/farmingRecommendationRoute.js`**: Express Router mapping endpoints (`/predict`, `/history`, `/history/:id`) protected by `protect` middleware.
- **`backend/middleware/authMiddleware.js`**: Contains `protect` middleware which verifies JWT authentication headers.
- **`backend/server.js`**: Registers `/api/farming-recommendation` route prefix.

### Frontend Presentation & State Management
- **`frontend/src/services/api.js`**: Axios HTTP client configured with request interceptors to pass `Authorization: Bearer <token>`.
- **`frontend/src/pages/FarmingRecommendation.vue`**: Clean Vue 3 page component implementing:
  - **Auth Shield**: Prompts unauthenticated users to log in before accessing form or history.
  - **Left Sidebar**: "Request Crop Recommendation" button and a clickable **History Log** header with row-wise list of saved user recommendation history.
  - **Right Main Panel**:
    - **Form Mode**: 8-Input form, "Predict Crop" button, and recommendation result card.
    - **List Mode**: Accessible by clicking "History Log", displaying a grid of historical recommendation cards.
    - **Detail Mode**: Displays comprehensive breakdown of selected historical recommendation with "Load Parameters into Form" button.

---

## 3. Database Schema

### `FarmingRecommendation` Collection Schema (`backend/models/FarmingRecommendation.js`):

```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User, required)",
  "inputs": {
    "n": "Number",
    "p": "Number",
    "k": "Number",
    "ph": "Number",
    "temperature": "Number",
    "humidity": "Number",
    "moisture": "Number",
    "rainfall": "Number"
  },
  "recommendedCrop": "String",
  "createdAt": "Date (Timestamp)",
  "updatedAt": "Date (Timestamp)"
}
```

---

## 4. API Endpoints

| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/farming-recommendation/predict` | Runs ML prediction & saves inputs/output to DB | Protected (Farmer/Expert/Admin) |
| `GET` | `/api/farming-recommendation/history` | Fetches user's saved recommendations (newest first) | Protected (Farmer/Expert/Admin) |
| `GET` | `/api/farming-recommendation/history/:id` | Fetches single recommendation record details | Protected (Farmer/Expert/Admin) |
| `DELETE` | `/api/farming-recommendation/history/:id` | Deletes a saved recommendation record | Protected (Farmer/Expert/Admin) |

---

## 5. UI Layout & User Guide

1. **Authentication**:
   - Log in as a **Farmer** or **Expert** to access the page. Unauthenticated guest attempts are redirected/prompted to log in.

2. **Requesting a Recommendation**:
   - Click **"Request Crop Recommendation"** on the left panel.
   - Enter soil and environmental metrics manually.
   - Click **"Predict Crop Recommendation"**.
   - The result card displays the recommended crop and saves the query to your account history.

3. **Viewing History List & Details**:
   - Click **"History Log"** in the left sidebar to toggle the list or open the full History List view on the right panel.
   - Click any individual row item in the sidebar/grid to open the **Detail View**.
   - Inspect recorded parameters (N, P, K, pH, Temperature, Humidity, Moisture, Rainfall).
   - Click **"Load Parameters into Form"** to copy those values back into the form for adjustments or re-testing.
