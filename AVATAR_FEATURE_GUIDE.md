# Avatar Feature Implementation

## Overview
The avatar feature allows users to customize their profile pictures with both predefined icons and uploaded images.

## Features

### 1. Predefined Avatars
- 10 built-in avatar options with different icons and colors
- Icons include: Car, Bike, Plane, Ship, Rocket, Heart, Star, Crown, Lightning, Shield
- Each avatar has a unique color gradient
- Stored as avatar IDs in the database

### 2. Custom Image Upload
- Users can upload their own images (PNG, JPG, GIF)
- File size limit: 5MB
- Images are stored in `uploads/avatars/` directory
- Automatic cleanup of old avatars when new ones are uploaded

### 3. Avatar Management
- Click on avatar to open the avatar manager
- Two-tab interface: Predefined and Upload
- Real-time preview of selected avatar
- Remove avatar option
- Persistent storage in localStorage and database

## Technical Implementation

### Frontend Components

#### AvatarManager.jsx
- Main component for avatar selection and upload
- Handles both predefined avatars and file uploads
- Modal interface with tabbed navigation
- Real-time preview functionality
- Error handling for file validation

#### Profile.jsx Integration
- AvatarManager integrated into Profile page
- State management for current avatar
- Automatic loading from localStorage
- Callback handling for avatar updates

### Backend Implementation

#### API Endpoints
- `POST /api/auth/upload-avatar` - Upload custom avatar image
- `POST /api/auth/update-avatar` - Update predefined avatar ID
- `GET /uploads/avatars/*` - Serve uploaded avatar images

#### File Upload Configuration
- Multer middleware for file handling
- File type validation (images only)
- File size limits (5MB max)
- Unique filename generation
- Automatic directory creation

#### Database Schema
- `profilePicture` field for uploaded image URLs
- `avatarId` field for predefined avatar IDs
- Automatic cleanup of old files

## Usage

### For Users
1. Navigate to Profile page
2. Click on current avatar
3. Choose between predefined avatars or upload custom image
4. Preview selection
5. Save changes

### For Developers
1. **Editable Avatar**: Import `AvatarManager` component
   - Pass required props: currentAvatar, username, userId, onAvatarUpdate
   - Handle avatar updates in parent component
2. **Read-only Avatar**: Import `AvatarDisplay` component
   - Pass currentAvatar, username, size props
   - No editing functionality, just display
3. **Navbar Integration**: Avatar is automatically displayed in navbar
4. Ensure backend endpoints are properly configured

## File Structure
```
frontend/src/components/AvatarManager.jsx    # Main avatar component (editable)
frontend/src/components/AvatarDisplay.jsx    # Read-only avatar display
frontend/src/components/Navbar.jsx           # Navbar integration
frontend/src/pages/Profile.jsx               # Profile page integration
backend/src/controllers/auth.controller.js   # Avatar upload/update logic
backend/src/routes/auth.routes.js           # API routes
uploads/avatars/                             # Uploaded avatar storage
```

## Environment Variables
- `SERVER_URL` - Base URL for serving uploaded files (defaults to localhost:5000)

## Dependencies
- Frontend: framer-motion, lucide-react
- Backend: multer, fs, path

## Error Handling
- File type validation
- File size limits
- Network error handling
- Automatic cleanup on errors
- User-friendly error messages
