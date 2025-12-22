# Orion System | Engineering & Design

![Orion Banner](public/logo.svg)

> **Navigate your Value.**

Orion is a modern, high-performance **Personal Knowledge Management (PKM)** and **Digital Garden** system. It combines a public-facing portfolio and blog with a sophisticated, encrypted private dashboard ("Captain's Cabin") for managing personal data, health, and AI interactions.

Built with **React 19**, **Vite**, **Tailwind CSS**, and powered by **Google Gemini models**.

## 🌟 Key Features

### 1. Public Sector (The Bridge)
- **Interactive Hero:** Dynamic 3D-style CSS animations and status indicators.
- **Transmission Log (Blog):** Markdown-supported journal with tagging, search, and nested comments. Supports embedded iframes and rich media.
- **Portfolio & Resume:** A dual-mode showcase (Resume Document / Project Cards) with multi-language support (EN/ZH).
- **AI Agents:**
  - **Thinking Agent:** Leveraging Gemini 3.0 Pro for complex reasoning tasks.
  - **Live Agent:** Real-time multimodal (audio/video) communication interface.

### 2. Captain's Cabin (Private Space)
A restricted area protected by JWT authentication and Role-Based Access Control (RBAC).

#### 🧠 Second Brain (AI Core)
- **Context-Aware Chat:** RAG-style interactions having access to your journals, fitness logs, and project data.
- **Multimodal Input:** Drag-and-drop image analysis and text processing.
- **Session Management:** Persistent chat history with sidebar navigation.

#### 🏃 Fitness Space
- **Holistic Tracking:** Weight, BMI, sleep, mood, and water intake logging.
- **Workout Log:** Track activity types (Run, Lift, HIIT, etc.) with duration and notes.
- **Photo Wall:** A monthly calendar-based gallery for progress photos.
- **Analytics:** Visual charts using Recharts for weight trends and activity stats.

#### 🧘 Leisure & Utilities
- **AI Smart Kitchen:** 
  - **Chef's Wheel:** Randomized meal decision maker with filters (Healthy/Variety).
  - **Smart Plan:** AI-generated meal plans based on your fitness goals (Cut/Bulk).
  - **Recipe Search:** Integrated external recipe API search.
- **Moon Cycle:** Period and biological cycle tracker with predictions.
- **Mahjong Soul:** Embedded iframe for leisure gaming.
- **Pirate Lords:** A custom logic puzzle game (Slider/Grid strategy).

#### 🗺️ Footprint (Star Map)
- **Dual View:** 
  - **China Sector:** ECharts-based province highlighting.
  - **Global Markers:** Leaflet-based world map for pinning memories.
- **Travel Log:** Record dates, moods, and photos for visited locations.

#### 📸 Capsule Gallery
- **Corkboard UI:** Draggable, rotatable photo cards for organizing memories.
- **Cloudinary Integration:** Efficient image management and optimization.

### 3. System Management (Admin)
- **RBAC:** Granular control over Users, Roles, and Permissions.
- **Audit Log:** Comprehensive tracking of all system actions (Login, Delete, Edit).
- **Resource Monitor:** Real-time usage stats for Cloudinary (Storage, Bandwidth).
- **Access Requests:** Workflow for approving/rejecting user permission requests.

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, FontAwesome
- **Routing:** React Router DOM v6
- **AI & ML:** @google/genai SDK (Gemini 3 Pro, Flash 2.5)
- **Visualization:** Recharts, ECharts, Leaflet
- **Rich Text:** Quill, Highlight.js, Marked
- **Real-time:** Socket.io-client
- **PWA:** Fully offline-capable Progressive Web App

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Google Gemini API Key
- A Cloudinary Account (for media)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/orion.git
   cd orion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory (refer to your build configuration for specific keys needed, e.g., `API_KEY` for GenAI).

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🎨 Theming
The system features a dynamic **Cosmic/Scenic** theme engine:
- **Light Mode:** "Milky" warm tones with paper textures and scenic landscapes.
- **Dark Mode:** Deep space "Cosmic" theme with animated starfields and nebulae.
- **Holiday Modes:** Special overlays for Christmas (Snow) and Lunar New Year (Lanterns).

## 📄 License
[MIT](LICENSE)
