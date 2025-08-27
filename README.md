# MiniVerse Frontend

This is the frontend for the **MiniVerse** application, a modern and feature-rich blogging platform built with **React**, **Vite**, and **Tailwind CSS**. It offers a fast, responsive, and interactive user experience, complete with an animated particle background.

## ✨ Features

Based on the project structure, this frontend supports the following features:

  * **User Authentication**: Secure user registration and login flows managed via `AuthContext` and `authService`.
  * **Complete Blog Management**:
      * Create, edit, and view blog posts (`CreatePost.tsx`, `EditPost.tsx`,DeletePost).
      * Browse a list of all public blog posts (`BlogList.tsx`).
      * View a detailed page for each individual blog post (`BlogDetail.tsx`).
  * **User Dashboard ("My Blogs")**:
      * View all personal blog posts (`MyBlogs.tsx`).
      * Manage and view private posts separately (`PrivatePosts.tsx`).
      * Track and manage scheduled "Time Capsule" posts (`TimeCapsule.tsx`).
  * **Interactive UI**:
      * Engaging **particle background** for a dynamic visual experience (`ParticleBackground.tsx`).
      * Reusable components like `BlogCard`, `CommentSection`, and `Header` for a consistent and clean look.
  * **User Profiles**: View and manage user profile information (`Profile.tsx`).
  * **Organized API Integration**: A dedicated `services` layer to handle all communication with the backend API for authentication, blog posts, and user data.
  * **State Management**: Global authentication state is managed cleanly using React Context (`AuthContext.tsx`).

-----

## 🛠️ Technologies Used

  * **Framework**: React
  * **Build Tool**: Vite
  * **Language**: TypeScript
  * **Styling**: Tailwind CSS
  * **API Communication**: Axios (or a similar library via the service layer)
  * **Animation**: A particle library for the animated background.

-----

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

  * Node.js (v18 or higher recommended)
  * npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/V-Meenakshi/miniverseFrontend
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd chronoblog-frontend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Set up environment variables:**
    Create a file named `.env.local` in the root of the project and add the base URL for your backend API. This is configured in `src/config/api.ts`.
    ```env
    VITE_API_BASE_URL=http://localhost:8080/api
    ```
5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

-----

## 📂 Project Structure

The project is organized to be scalable and easy to maintain:

```
/
├── src/
│   ├── components/         # Reusable UI components (BlogCard, Header, etc.)
│   ├── config/             # API configuration (e.g., Axios instance)
│   ├── context/            # React context for global state (AuthContext)
│   ├── pages/              # Application pages/views (Home, Login, BlogDetail, etc.)
│   ├── services/           # API service layers (authService, blogService)
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main application component with routing
│   ├── index.css           # Global styles and Tailwind directives
│   └── main.tsx            # Application entry point
│
├── .gitignore
├── index.html              # Main HTML file
├── package.json
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

-----

## © License

Copyright (c) 2025 Meenakshi Vinjamuri. All Rights Reserved.
