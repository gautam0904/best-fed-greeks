# Best Fed Greeks API Documentation

## Overview
The Best Fed Greeks API is a RESTful service that manages meal services for Greek houses/fraternities. It provides functionality for students, chefs, and administrators to manage meals, ratings, chat, and house operations.

## Available Pages/Screens (28 Total)

### Core Pages
1. **Account** - `/account` - All authenticated users
2. **Login** - `/login` - Public (unauthenticated users)
3. **Register** - `/register` - Public (unauthenticated users)
4. **Profile** - `/profile` - Students only
5. **Welcome** - `/welcome` - All users
6. **Dashboard** - `/dashboard` - Students only
7. **Password Reset** - `/password-reset` - Public (unauthenticated users)
8. **Technical Support** - `/technical-support` - All users (always available)

### Menu & Meal Management
9. **Week Menu** - `/week-menu/:houseId` - Students only
10. **Day Menu** - `/day-menu/:date/:mealType` - Students only
11. **Day Menu (with house)** - `/day-menu/:date/:mealType/:houseId` - Students only
12. **Edit Meal Plan** - `/edit-meal-plan` - Students only

### Communication & Feedback
13. **Requests** - `/requests` - Students only (with request_comments function)
14. **Chat List** - `/chat-list` - Chefs & Super Chefs only
15. **Chat** - `/chat/:houseId` - Chefs & Super Chefs only
16. **Chat (general)** - `/chat` - Students only (with chat function)
17. **Ratings** - `/ratings` - Students only (with meal_ratings/chef_ratings functions)
18. **Chef Rating** - `/chef-rating` - Students only
19. **Meal Rating** - `/meal-rating` - Students only

### House Management
20. **Announcements** - `/announcements` - Chefs & Super Chefs only
21. **House List** - `/house-list` - Chefs & Super Chefs only
22. **House Dashboard** - `/house-dashboard/:houseId` - Chefs & Super Chefs only
23. **House Roster** - `/house-roster/:houseId` - Chefs & Super Chefs only
24. **House Roster (with date/meal)** - `/house-roster/:houseId/:date/:mealType` - Chefs & Super Chefs only
25. **House Menus** - `/house-menus` - Super Chefs only

### Menu Builder
26. **House Menu Builder - List** - `/house-menu-builder/list/:houseId` - Chefs & Super Chefs only
27. **House Menu Builder - Summary** - `/house-menu-builder/summary/:houseId/:date` - Chefs & Super Chefs only
28. **House Menu Builder - Edit** - `/house-menu-builder/edit/:houseId/:date` - Chefs & Super Chefs only

## Base URLs
- **Development**: `http://dev.bestfedgreeks.com/api`
- **Production**: `https://bestfedgreeks.com/api`

## Authentication
All API requests require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## User Types & Permissions

### 1. Students
- **Role Code**: `null` (default role)
- **Access**: Student dashboard, meal plans, ratings, chat, profile
- **Features**:
  - View daily/weekly menus
  - Edit meal plans
  - Rate meals and chefs
  - Submit requests and comments
  - Chat with house members
  - Manage profile and dietary preferences

### 2. Chefs
- **Role Code**: `chef`
- **Access**: House management, meal preparation, roster management
- **Features**:
  - View house dashboard
  - Manage house roster
  - Send announcements
  - Chat with students
  - View meal ratings
  - Manage time slots

### 3. Super Chefs
- **Role Code**: `super-chef`
- **Access**: All chef permissions plus house menu management
- **Features**:
  - All chef features
  - House menu builder
  - Menu submission and printing
  - House management across multiple houses

### 4. Super Chef Admins
- **Role Code**: `super-chef-admin`
- **Access**: Highest level administrative access
- **Features**:
  - All super chef features
  - System-wide administration
  - User management
  - Configuration management

## API Endpoints

### Authentication Endpoints

#### 1. User Login
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Description**: Authenticate user and receive access token

**Request Body:**
```json
{
  "login": "username_or_email",
  "password": "user_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "access_token_here",
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "role": {
      "code": "chef",
      "name": "Chef"
    },
    "bfg_house_id": 1
  }
}
```

#### 2. Refresh Token
- **Endpoint**: `POST /auth/refresh-token`
- **Access**: Authenticated users
- **Description**: Refresh expired access token

**Request Body:**
```json
{
  "token": "current_access_token"
}
```

**Response:**
```json
{
  "success": true,
  "token": "new_access_token"
}
```

#### 3. Forgot Password
- **Endpoint**: `POST /auth/forgot-password`
- **Access**: Public
- **Description**: Request password reset email

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### 4. User Registration
- **Endpoint**: `POST /bfg/auth/register`
- **Access**: Public
- **Description**: Register new user with access code

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "access_code": "HOUSE123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for activation."
}
```

### User Management Endpoints

#### 5. Load User Profile
- **Endpoint**: `POST /bfg/user/load-profile`
- **Access**: Authenticated users
- **Description**: Load current user's profile information

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "allergies": "Peanuts",
    "dietary_preferences": "Vegetarian",
    "house": "Delta Tau Delta"
  }
}
```

#### 6. Save User Profile
- **Endpoint**: `POST /bfg/user/save-profile`
- **Access**: Authenticated users
- **Description**: Update user profile information

**Request Body:**
```json
{
  "name": "John Doe",
  "allergy_ids": [1, 2],
  "diet_ids": [3],
  "live_out_designation": 0,
  "account": {
    "password": "newpassword",
    "password_confirmation": "newpassword"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

#### 7. Load User Configuration
- **Endpoint**: `POST /bfg/user/load-config`
- **Access**: Authenticated users
- **Description**: Load user's app configuration and permissions

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "enabled_app_functions": {
    "chat": true,
    "meal_ratings": true,
    "chef_ratings": true,
    "request_comments": true
  },
  "push_notifications": {
    "enabled": true,
    "topics": ["chat", "announcements"]
  }
}
```

#### 8. Load Technical Support Info
- **Endpoint**: `POST /bfg/user/load-technical-support-info`
- **Access**: Authenticated users
- **Description**: Load technical support information

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "support_info": {
    "contact_email": "support@bestfedgreeks.com",
    "phone": "555-1234",
    "hours": "9 AM - 5 PM EST"
  }
}
```

#### 9. Save Technical Support Info
- **Endpoint**: `POST /bfg/user/save-technical-support-info`
- **Access**: Authenticated users
- **Description**: Save technical support information

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "houseName": "Delta Tau Delta",
  "collegeName": "University of Example",
  "comment": "Need help with meal plan"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Technical support info saved"
}
```

### Dashboard Endpoints

#### 10. Load Student Dashboard
- **Endpoint**: `POST /bfg/dashboard/load`
- **Access**: Students only
- **Description**: Load student dashboard with daily meal information

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "house": "Delta Tau Delta",
  "has_meal_service_today": true,
  "menu_day_details": [
    {
      "meal": "Breakfast",
      "time": "7:00 AM - 9:00 AM",
      "menu_items": ["Scrambled Eggs", "Bacon", "Toast"],
      "has_signup": true,
      "total_signup": 45,
      "signup_finalized": true
    }
  ],
  "day": "Monday",
  "date": "2024-01-15"
}
```

#### 11. Load House Dashboard
- **Endpoint**: `POST /bfg/house-dashboard/load`
- **Access**: Chefs and Super Chefs
- **Description**: Load house dashboard for chefs

**Request Body:**
```json
{
  "bfg_house_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "house": {
    "id": 1,
    "name": "Delta Tau Delta",
    "address": "123 Greek Street"
  },
  "has_meal_service_today": true,
  "menu_day_details": [
    {
      "meal": "Breakfast",
      "time": "7:00 AM - 9:00 AM",
      "menu_items": ["Scrambled Eggs", "Bacon", "Toast"],
      "has_signup": true,
      "total_signup": 45,
      "signup_finalized": true,
      "has_late_plate": true,
      "total_late_plate": 5,
      "late_plate_finalized": false
    }
  ],
  "day": "Monday",
  "date": "2024-01-15"
}
```

#### 12. Load Houses
- **Endpoint**: `POST /bfg/house-dashboard/load-houses`
- **Access**: Chefs and Super Chefs
- **Description**: Load all houses accessible to the chef

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "houses": [
    {
      "id": 1,
      "name": "Delta Tau Delta",
      "address": "123 Greek Street",
      "enabled_app_functions": {
        "chat": true,
        "meal_ratings": true
      }
    }
  ],
  "house_locations": [
    {
      "id": 1,
      "name": "North Campus",
      "houses": [1, 2, 3]
    }
  ]
}
```

#### 13. Load Announcements
- **Endpoint**: `POST /bfg/house-dashboard/load-announcements`
- **Access**: Chefs and Super Chefs
- **Description**: Load house announcements

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "announcements": [
    {
      "id": 1,
      "title": "Kitchen Maintenance",
      "message": "Kitchen will be closed for maintenance on Friday",
      "created_at": "2024-01-15T10:00:00Z",
      "house_id": 1
    }
  ]
}
```

### Meal Management Endpoints

#### 14. Load Meal Plan Time Slots
- **Endpoint**: `POST /bfg/meals/load-meal-plan-time-slots`
- **Access**: Students
- **Description**: Load available time slots for meal plans

**Request Body:**
```json
{
  "date": "2024-01-15",
  "meal_type": "breakfast"
}
```

**Response:**
```json
{
  "success": true,
  "time_slots": [
    {
      "id": 1,
      "time": "7:00 AM - 9:00 AM",
      "available": true
    },
    {
      "id": 2,
      "time": "12:00 PM - 2:00 PM",
      "available": true
    }
  ]
}
```

#### 15. Load Meal Plan Availability
- **Endpoint**: `POST /bfg/meals/load-meal-plan-availability`
- **Access**: Students
- **Description**: Check meal plan availability

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "meal_plan_availability_config": {
    "monday": {
      "breakfast": {
        "require_signup": true,
        "has_signup_slots": true,
        "has_late_plate": true,
        "can_bring_guest": true
      }
    }
  },
  "enable_meal_repeats": true
}
```

#### 16. Save Meal Plan
- **Endpoint**: `POST /bfg/meals/save-meal-plan`
- **Access**: Students
- **Description**: Save student's meal plan

**Request Body:**
```json
{
  "meal_type": "breakfast",
  "late_plate": 0,
  "meal_date": "2024-01-15",
  "meal_day": "monday",
  "time_slot_signup": "7:00 AM - 9:00 AM",
  "repeat": 1,
  "bring_guest": 0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meal plan saved successfully"
}
```

#### 17. Load Weekly Meal Plans
- **Endpoint**: `POST /bfg/meals/load-weekly-meal-plans`
- **Access**: Students
- **Description**: Load weekly meal plans for student

**Request Body:**
```json
{
  "start_date": "2024-01-15",
  "end_date": "2024-01-21"
}
```

**Response:**
```json
{
  "success": true,
  "meal_plans": [
    {
      "date": "2024-01-15",
      "breakfast": {
        "attending": true,
        "time_slot": 1
      },
      "lunch": {
        "attending": false
      },
      "dinner": {
        "attending": true,
        "time_slot": 3
      }
    }
  ]
}
```

#### 18. Load Day Meal
- **Endpoint**: `POST /bfg/meals/load-day-meal`
- **Access**: All authenticated users
- **Description**: Load meal details for a specific day

**Request Body:**
```json
{
  "date": "2024-01-15",
  "meal_type": "breakfast",
  "load_additional_info": true
}
```

**Optional Parameters:**
- `load_additional_info` (boolean): When true, includes additional meal information like signup counts, time slots, and user-specific data

**Response:**
```json
{
  "success": true,
  "has_meal_service": true,
  "menu_day_details": [
    {
      "meal": "Breakfast",
      "time": "7:00 AM - 9:00 AM",
      "menu_items": ["Scrambled Eggs", "Bacon", "Toast"],
      "nutritional_info": {
        "calories": 450,
        "protein": "25g"
      }
    }
  ],
  "has_rated": false,
  "can_request_late_plate": true,
  "can_check_in": true,
  "can_cancel_late_plate": false,
  "can_cancel_check_in": false,
  "check_in_cutoff_message": "Check-in available until 8:00 AM",
  "late_plate_cutoff_message": "Late plate requests available until 6:00 PM",
  "has_time_slots": true,
  "time_slot_signups": [
    {
      "time": "7:00 AM - 8:00 AM",
      "signup_count": 25
    },
    {
      "time": "8:00 AM - 9:00 AM",
      "signup_count": 20
    }
  ],
  "time_slot_signup": "7:00 AM - 8:00 AM"
}
```

**Additional Response Fields (when `load_additional_info` is true):**
- `has_rated` (boolean): Whether the user has already rated this meal
- `can_request_late_plate` (boolean): Whether the user can request a late plate
- `can_check_in` (boolean): Whether the user can check in for this meal
- `can_cancel_late_plate` (boolean): Whether the user can cancel a late plate request
- `can_cancel_check_in` (boolean): Whether the user can cancel a check-in
- `check_in_cutoff_message` (string): Message about check-in cutoff time
- `late_plate_cutoff_message` (string): Message about late plate cutoff time
- `has_time_slots` (boolean): Whether this meal has time slots
- `time_slot_signups` (array): Array of time slots with signup counts
- `time_slot_signup` (string): User's selected time slot

#### 19. Quick Menu Day Action
- **Endpoint**: `POST /bfg/meals/quick-menu-day-action`
- **Access**: Students
- **Description**: Quick action for menu day (like/dislike)

**Request Body:**
```json
{
  "date": "2024-01-15",
  "meal_type": "breakfast",
  "action": "like"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Action completed"
}
```

#### 20. Remove Repeat Meal Plan
- **Endpoint**: `POST /bfg/meals/remove-repeat-meal-plan`
- **Access**: Students
- **Description**: Remove repeated meal plan

**Request Body:**
```json
{
  "meal_type": "breakfast",
  "start_date": "2024-01-15",
  "end_date": "2024-01-21"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Repeat meal plan removed"
}
```

#### 21. Like Meal
- **Endpoint**: `POST /bfg/meals/like-meal`
- **Access**: Students
- **Description**: Like a specific meal

**Request Body:**
```json
{
  "meal_id": 123,
  "action": "like"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meal liked successfully"
}
```

#### 22. Load Day Meal (Chef Version)
- **Endpoint**: `POST /bfg/house-dashboard/load-day-meal`
- **Access**: Chefs and Super Chefs
- **Description**: Load meal details for a specific day with additional chef-specific information

**Request Body:**
```json
{
  "date": "2024-01-15",
  "meal_type": "breakfast",
  "bfg_house_id": 1,
  "load_additional_info": true
}
```

**Optional Parameters:**
- `load_additional_info` (boolean): When true, includes additional meal information like signup counts, time slots, and chef-specific data

**Response:**
```json
{
  "success": true,
  "has_meal_service": true,
  "menu_day_details": [
    {
      "meal": "Breakfast",
      "time": "7:00 AM - 9:00 AM",
      "menu_items": ["Scrambled Eggs", "Bacon", "Toast"],
      "nutritional_info": {
        "calories": 450,
        "protein": "25g"
      },
      "signup_count": 45,
      "time_slots": [
        {
          "time": "7:00 AM - 8:00 AM",
          "signup_count": 25
        },
        {
          "time": "8:00 AM - 9:00 AM",
          "signup_count": 20
        }
      ]
    }
  ]
}
```

### Menu Management Endpoints

#### 23. Load House Menus Summary
- **Endpoint**: `POST /bfg/house-menus/load-summary`
- **Access**: Super Chefs only
- **Description**: Load summary of all house menus

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "houses": [
    {
      "id": 1,
      "name": "Delta Tau Delta",
      "menu_status": "submitted",
      "last_updated": "2024-01-15T10:00:00Z"
    }
  ],
  "houseLocations": [
    {
      "id": 1,
      "name": "North Campus"
    }
  ]
}
```

#### 24. Load Menu Builder List
- **Endpoint**: `POST /bfg/menu-builder/load-list`
- **Access**: Super Chefs
- **Description**: Load list of menus for house

**Request Body:**
```json
{
  "bfg_house_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "menus": [
    {
      "id": 1,
      "date": "2024-01-15",
      "status": "draft",
      "meal_count": 3
    }
  ]
}
```

#### 25. Load Menu
- **Endpoint**: `POST /bfg/menu-builder/load-menu`
- **Access**: Super Chefs
- **Description**: Load specific menu details

**Request Body:**
```json
{
  "bfg_house_id": 1,
  "monday_of_week": "2024-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "meal_plan_service_availability": {
    "monday": {
      "Breakfast": {
        "enabled": true
      }
    }
  },
  "menu_dishes": [
    {
      "id": 1,
      "mealType": "Breakfast",
      "start": "2024-01-15",
      "recipe_id": 1
    }
  ],
  "recipes": [
    {
      "id": 1,
      "name": "Scrambled Eggs"
    }
  ]
}
```

#### 26. Save Menu Dish
- **Endpoint**: `POST /bfg/menu-builder/save-menu-dish`
- **Access**: Super Chefs
- **Description**: Save a dish to the menu

**Request Body:**
```json
{
  "bfg_house_id": 1,
  "start_date": "2024-01-15",
  "meal_type": "Breakfast",
  "recipe_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dish saved successfully"
}
```

#### 27. Remove Menu Dish
- **Endpoint**: `POST /bfg/menu-builder/remove-menu-dish`
- **Access**: Super Chefs
- **Description**: Remove a dish from the menu

**Request Body:**
```json
{
  "bfg_house_id": 1,
  "date": "2024-01-15",
  "meal_type": "Breakfast",
  "recipe_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dish removed successfully"
}
```

#### 28. Save Recipe
- **Endpoint**: `POST /bfg/menu-builder/save-recipe`
- **Access**: Super Chefs
- **Description**: Save a recipe

**Request Body:**
```json
{
  "bfg_house_id": 1,
  "name": "Scrambled Eggs",
  "mealType": "Breakfast"
}
```

**Response:**
```json
{
  "success": true,
  "id": 1,
  "recipe_id": 1,
  "message": "Recipe saved successfully"
}
```

#### 29. Submit Menu
- **Endpoint**: `POST /bfg/menu-builder/submit-menu`
- **Access**: Super Chefs
- **Description**: Submit menu for approval

**Request Body:**
```json
{
  "bfg_house_id": 1,
  "monday_of_week": "2024-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu submitted successfully"
}
```

#### 30. Print Menu
- **Endpoint**: `POST /bfg/menu-builder/print-menu`
- **Access**: Super Chefs
- **Description**: Generate printable menu

**Request Body:**
```json
{
  "bfg_house_id": 1,
  "monday_of_week": "2024-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "print_url": "https://example.com/menu.pdf"
}
```

#### 31. Load Menu Summary
- **Endpoint**: `POST /bfg/menu-builder/load-menu-summary`
- **Access**: Super Chefs
- **Description**: Load menu summary for review

**Request Body:**
```json
{
  "bfg_house_id": 1,
  "monday_of_week": "2024-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total_meals": 3,
    "total_dishes": 12,
    "nutritional_summary": {
      "avg_calories": 450,
      "avg_protein": "25g"
    }
  }
}
```

### Ratings & Comments Endpoints

#### 32. Save Meal Rating
- **Endpoint**: `POST /bfg/ratings/save-meal-rating`
- **Access**: Students
- **Description**: Rate a meal

**Request Body:**
```json
{
  "meal_type": "breakfast",
  "meal_date": "2024-01-15",
  "rating": 5,
  "feedback": "Excellent meal!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rating saved successfully"
}
```

#### 33. Save Chef Rating
- **Endpoint**: `POST /bfg/ratings/save-chef-rating`
- **Access**: Students
- **Description**: Rate a chef

**Request Body:**
```json
{
  "chef_id": 123,
  "rating": 5,
  "feedback": "Great chef!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chef rating saved successfully"
}
```

#### 34. Save Comment
- **Endpoint**: `POST /bfg/ratings/save-comment`
- **Access**: Students
- **Description**: Submit a comment or request

**Request Body:**
```json
{
  "comment": "Please add more vegetarian options"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment submitted successfully"
}
```

### Chat System Endpoints

#### 35. Load Chat List
- **Endpoint**: `POST /bfg/chat/load-list`
- **Access**: All authenticated users
- **Description**: Load list of chat conversations

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "chats": [
    {
      "id": 1,
      "house_name": "Delta Tau Delta",
      "last_message": "Hello everyone!",
      "last_message_time": "2024-01-15T10:00:00Z",
      "unread_count": 2
    }
  ]
}
```

#### 36. Load Messages as Chef
- **Endpoint**: `POST /bfg/chat/load-messages-as-chef`
- **Access**: Chefs and Super Chefs
- **Description**: Load chat messages for chefs

**Request Body:**
```json
{
  "bfg_house_id": 1,
  "all_message_ids": "1,2,3",
  "earliest_message_id": 1,
  "latest_message_id": 10
}
```

**Response:**
```json
{
  "success": true,
  "user_id": 123,
  "messages": [
    {
      "id": 1,
      "user_id": 456,
      "user_name": "John Doe",
      "message": "Hello everyone!",
      "timestamp": "2024-01-15T10:00:00Z",
      "is_chef": false
    }
  ],
  "interactions": {
    "1": [
      {
        "type": "like",
        "user_id": 789
      }
    ]
  }
}
```

#### 37. Load Messages as Student
- **Endpoint**: `POST /bfg/chat/load-messages-as-student`
- **Access**: Students
- **Description**: Load chat messages for students

**Request Body:**
```json
{
  "all_message_ids": "1,2,3",
  "earliest_message_id": 1,
  "latest_message_id": 10
}
```

**Response:**
```json
{
  "success": true,
  "user_id": 456,
  "messages": [
    {
      "id": 1,
      "user_id": 123,
      "user_name": "Chef Smith",
      "message": "Hello everyone!",
      "timestamp": "2024-01-15T10:00:00Z",
      "is_chef": true
    }
  ],
  "interactions": {
    "1": [
      {
        "type": "like",
        "user_id": 789
      }
    ]
  }
}
```

#### 38. Send Message as Chef
- **Endpoint**: `POST /bfg/chat/send-message-as-chef`
- **Access**: Chefs and Super Chefs
- **Description**: Send message as chef

**Request Body:**
```json
{
  "bfg_house_id": 1,
  "latest_message_id": 10,
  "message": "Hello everyone!"
}
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": 11,
      "user_id": 123,
      "user_name": "Chef Smith",
      "message": "Hello everyone!",
      "timestamp": "2024-01-15T10:00:00Z",
      "is_chef": true
    }
  ]
}
```

#### 39. Send Message as Student
- **Endpoint**: `POST /bfg/chat/send-message-as-student`
- **Access**: Students
- **Description**: Send message as student

**Request Body:**
```json
{
  "latest_message_id": 10,
  "message": "Hello everyone!"
}
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": 11,
      "user_id": 456,
      "user_name": "John Doe",
      "message": "Hello everyone!",
      "timestamp": "2024-01-15T10:00:00Z",
      "is_chef": false
    }
  ]
}
```

#### 40. Add Interaction as Chef
- **Endpoint**: `POST /bfg/chat/add-interaction-as-chef`
- **Access**: Chefs and Super Chefs
- **Description**: Add interaction (like, etc.) to message as chef

**Request Body:**
```json
{
  "bfg_house_id": 1,
  "message_id": 1,
  "interaction_type": "like"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interaction added successfully"
}
```

#### 41. Add Interaction as Student
- **Endpoint**: `POST /bfg/chat/add-interaction-as-student`
- **Access**: Students
- **Description**: Add interaction (like, etc.) to message as student

**Request Body:**
```json
{
  "message_id": 1,
  "interaction_type": "like"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interaction added successfully"
}
```

### House Roster Endpoints

#### 42. Load House Roster
- **Endpoint**: `POST /bfg/house-dashboard/load-roster`
- **Access**: Chefs and Super Chefs
- **Description**: Load house roster for a specific date and meal

**Request Body:**
```json
{
  "date": "2024-01-15",
  "meal_type": "breakfast",
  "bfg_house_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "houseName": "Delta Tau Delta",
  "meal_type": "breakfast",
  "finalized": true,
  "users": [
    {
      "id": 456,
      "name": "John Doe",
      "allergies": "Peanuts",
      "dietary_preferences": "Vegetarian",
      "time_slot_signup": "7:00 AM - 9:00 AM",
      "time_slot_signup_display": "Early Breakfast"
    }
  ],
  "signup_slot_details": {
    "7:00 AM - 9:00 AM": {
      "signup_amount": 25,
      "notification_sent": false
    }
  }
}
```

#### 43. Send Time Slot Signup Pickup Notification
- **Endpoint**: `POST /bfg/house-dashboard/send-time-slot-signup-pickup-notification`
- **Access**: Chefs and Super Chefs
- **Description**: Send pickup notification for time slot

**Request Body:**
```json
{
  "date": "2024-01-15",
  "meal_type": "breakfast",
  "bfg_house_id": 1,
  "time_slot": "7:00 AM - 9:00 AM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

### Weekly Menu Endpoints

#### 44. Load Weekly Menu (Student)
- **Endpoint**: `POST /bfg/meals/load-weekly-menu`
- **Access**: Students
- **Description**: Load weekly menu for students

**Request Body:**
```json
{
  "start_date": "2024-01-15",
  "end_date": "2024-01-21"
}
```

**Response:**
```json
{
  "success": true,
  "weekly_menu": [
    {
      "date": "2024-01-15",
      "meals": [
        {
          "meal_type": "breakfast",
          "time": "7:00 AM - 9:00 AM",
          "menu_items": ["Scrambled Eggs", "Bacon", "Toast"]
        }
      ]
    }
  ]
}
```

#### 45. Load Weekly Menu (Chef)
- **Endpoint**: `POST /bfg/house-dashboard/load-weekly-menu`
- **Access**: Chefs and Super Chefs
- **Description**: Load weekly menu for chefs

**Request Body:**
```json
{
  "bfg_house_id": 1,
  "start_date": "2024-01-15",
  "end_date": "2024-01-21"
}
```

**Response:**
```json
{
  "success": true,
  "weekly_menu": [
    {
      "date": "2024-01-15",
      "meals": [
        {
          "meal_type": "breakfast",
          "time": "7:00 AM - 9:00 AM",
          "menu_items": ["Scrambled Eggs", "Bacon", "Toast"],
          "signup_count": 45
        }
      ]
    }
  ]
}
```

## Error Responses

All endpoints may return the following error format:

```json
{
  "error": true,
  "message": "Error description",
  "status": 400
}
```

Common HTTP Status Codes:
- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Other endpoints**: 100 requests per minute per user

## Versioning

Current API version: v1
The API currently does not use version prefixes in URLs. Future versions may implement versioning through URL prefixes (e.g., `/v2/api/`) or header-based versioning.

**Versioning Strategy:**
- **Current**: No version prefix (all endpoints use base URL)
- **Future**: URL-based versioning (e.g., `/v2/bfg/meals/load-day-meal`)
- **Backward Compatibility**: New versions will maintain backward compatibility for at least 6 months
- **Deprecation Notice**: Endpoints will be marked as deprecated 3 months before removal

## Support

For technical support or questions about the API, contact:
- Email: support@bestfedgreeks.com
- Documentation: https://docs.bestfedgreeks.com
