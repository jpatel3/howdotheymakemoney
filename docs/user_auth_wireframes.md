# User Authentication and Bookmarking Wireframes

## User Signup/Login Flow

### Signup Modal
```
+-------------------------------------------------------+
|                                                       |
|  Create an Account                               [X]  |
|  ---------------------------------------------------- |
|                                                       |
|  Join HowDoTheyMakeMoney.com to bookmark              |
|  companies and get personalized insights.             |
|                                                       |
|  +-----------------------------------------------+    |
|  | Email                                         |    |
|  +-----------------------------------------------+    |
|                                                       |
|  +-----------------------------------------------+    |
|  | Password                                      |    |
|  +-----------------------------------------------+    |
|                                                       |
|  +-----------------------------------------------+    |
|  | Confirm Password                              |    |
|  +-----------------------------------------------+    |
|                                                       |
|  [  Create Account  ]                                 |
|                                                       |
|  Already have an account? [Log in]                    |
|                                                       |
|  Or continue with:                                    |
|  [Google] [GitHub]                                    |
|                                                       |
+-------------------------------------------------------+
```

### Login Modal
```
+-------------------------------------------------------+
|                                                       |
|  Log In                                          [X]  |
|  ---------------------------------------------------- |
|                                                       |
|  Welcome back!                                        |
|                                                       |
|  +-----------------------------------------------+    |
|  | Email                                         |    |
|  +-----------------------------------------------+    |
|                                                       |
|  +-----------------------------------------------+    |
|  | Password                                      |    |
|  +-----------------------------------------------+    |
|                                                       |
|  [Forgot password?]                                   |
|                                                       |
|  [  Log In  ]                                         |
|                                                       |
|  Don't have an account? [Sign up]                     |
|                                                       |
|  Or continue with:                                    |
|  [Google] [GitHub]                                    |
|                                                       |
+-------------------------------------------------------+
```

## User Profile and Bookmarks

### User Dropdown Menu (When Logged In)
```
+------------------------+
|                        |
| [User's Name]          |
| [user@email.com]       |
| ---------------------- |
| My Bookmarks           |
| Account Settings       |
| ---------------------- |
| Log Out                |
|                        |
+------------------------+
```

### Bookmarks Page
```
+-------------------------------------------------------+
|                                                       |
|  HowDoTheyMakeMoney.com                  [User Menu]  |
|                                                       |
+-------------------------------------------------------+
|                                                       |
|  My Bookmarked Companies                              |
|  ---------------------------------------------------- |
|                                                       |
|  +-----------------------------------------------+    |
|  |                                               |    |
|  |  [Company Logo] Company Name            [×]   |    |
|  |  Last viewed: [date]                          |    |
|  |  Primary revenue: [main revenue stream]       |    |
|  |  [View Report]                                |    |
|  |                                               |    |
|  +-----------------------------------------------+    |
|                                                       |
|  +-----------------------------------------------+    |
|  |                                               |    |
|  |  [Company Logo] Company Name            [×]   |    |
|  |  Last viewed: [date]                          |    |
|  |  Primary revenue: [main revenue stream]       |    |
|  |  [View Report]                                |    |
|  |                                               |    |
|  +-----------------------------------------------+    |
|                                                       |
|  +-----------------------------------------------+    |
|  |                                               |    |
|  |  [Company Logo] Company Name            [×]   |    |
|  |  Last viewed: [date]                          |    |
|  |  Primary revenue: [main revenue stream]       |    |
|  |  [View Report]                                |    |
|  |                                               |    |
|  +-----------------------------------------------+    |
|                                                       |
|  No more bookmarks                                    |
|  [Search for companies]                               |
|                                                       |
+-------------------------------------------------------+
```

### Account Settings Page
```
+-------------------------------------------------------+
|                                                       |
|  HowDoTheyMakeMoney.com                  [User Menu]  |
|                                                       |
+-------------------------------------------------------+
|                                                       |
|  Account Settings                                     |
|  ---------------------------------------------------- |
|                                                       |
|  Profile Information                                  |
|  ---------------------------------------------------- |
|                                                       |
|  +-----------------------------------------------+    |
|  | Name                                          |    |
|  +-----------------------------------------------+    |
|                                                       |
|  +-----------------------------------------------+    |
|  | Email                                         |    |
|  +-----------------------------------------------+    |
|                                                       |
|  [  Update Profile  ]                                 |
|                                                       |
|  Change Password                                      |
|  ---------------------------------------------------- |
|                                                       |
|  +-----------------------------------------------+    |
|  | Current Password                              |    |
|  +-----------------------------------------------+    |
|                                                       |
|  +-----------------------------------------------+    |
|  | New Password                                  |    |
|  +-----------------------------------------------+    |
|                                                       |
|  +-----------------------------------------------+    |
|  | Confirm New Password                          |    |
|  +-----------------------------------------------+    |
|                                                       |
|  [  Update Password  ]                                |
|                                                       |
|  Notification Preferences                             |
|  ---------------------------------------------------- |
|                                                       |
|  [ ] Email me when new companies are added            |
|  [ ] Email me about site updates                      |
|                                                       |
|  [  Save Preferences  ]                               |
|                                                       |
|  Delete Account                                       |
|  ---------------------------------------------------- |
|                                                       |
|  [  Delete My Account  ]                              |
|                                                       |
+-------------------------------------------------------+
```

## Bookmarking UI Elements

### Bookmark Button on Company Report Page
```
+---------------------------+  +-----------------+
|                           |  |                 |
|  [Company Logo]           |  |  Quick Facts    |
|                           |  |  Founded: YYYY  |
|  COMPANY NAME    [♡ Bookmark] |  Public/Private |
|                           |  |  Revenue: $XXB  |
|  One-line description     |  |  Employees: XXK |
|                           |  |                 |
+---------------------------+  +-----------------+
```

### Bookmarked State
```
+---------------------------+  +-----------------+
|                           |  |                 |
|  [Company Logo]           |  |  Quick Facts    |
|                           |  |  Founded: YYYY  |
|  COMPANY NAME    [♥ Bookmarked] |  Public/Private |
|                           |  |  Revenue: $XXB  |
|  One-line description     |  |  Employees: XXK |
|                           |  |                 |
+---------------------------+  +-----------------+
```

### Mobile Bookmark Button
```
+------------------------+
|                        |
| < Back                 |
|                        |
| [Company Logo]         |
|                        |
| COMPANY NAME  [♡]      |
| One-line description   |
|                        |
```

## Updated Navigation Bar (With Auth)

### Logged Out State
```
+-------------------------------------------------------+
|                                                       |
|  HowDoTheyMakeMoney.com        [Log In] [Sign Up]    |
|                                                       |
+-------------------------------------------------------+
```

### Logged In State
```
+-------------------------------------------------------+
|                                                       |
|  HowDoTheyMakeMoney.com        [Bookmarks] [User ▼]  |
|                                                       |
+-------------------------------------------------------+
```

## Integration with Homepage

### Featured and Recently Viewed Section (Logged In)
```
+-------------------------------------------------------+
|                                                       |
|  +-------------+  +-------------+  +-------------+    |
|  | FEATURED    |  | FEATURED    |  | FEATURED    |    |
|  | Tesla       |  | Stripe      |  | Airbnb      |    |
|  | [thumbnail] |  | [thumbnail] |  | [thumbnail] |    |
|  +-------------+  +-------------+  +-------------+    |
|                                                       |
|  Your Bookmarks                                       |
|  +-------------+  +-------------+  +-------------+    |
|  | BOOKMARKED  |  | BOOKMARKED  |  | BOOKMARKED  |    |
|  | Google      |  | Apple       |  | Microsoft   |    |
|  | [thumbnail] |  | [thumbnail] |  | [thumbnail] |    |
|  +-------------+  +-------------+  +-------------+    |
|                                                       |
|  Recently viewed                                      |
|  +-------------+  +-------------+  +-------------+    |
|  | RECENT      |  | RECENT      |  | RECENT      |    |
|  | Amazon      |  | Netflix     |  | Spotify     |    |
|  | [thumbnail] |  | [thumbnail] |  | [thumbnail] |    |
|  +-------------+  +-------------+  +-------------+    |
|                                                       |
+-------------------------------------------------------+
```
