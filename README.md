 ### TechCare – Requirements Analysis Report

  ## Introduction
This report explains the requirements analysis of the TechCare web application.
The aim of this document is to describe what the system is expected to do,
who will use it, and how the technical decisions support the project goals.

  ## Project Overview
TechCare is a web-based platform created to connect customers who need device repairs
with technicians or repair shops.
The system mainly supports repairs for smartphones, laptops, and PCs.
Users can find nearby technicians, view ratings, select repair services,
and book appointments easily.

The main goal of TechCare is to make the repair process simple, fast, and reliable
for both customers and service providers.

 ## Project Background
At the early stage of development, the system backend was designed using
Node.js and Express.js.
MongoDB was selected as the initial database because it works well with the MERN stack
and supports flexible data storage.

 During development, core backend features such as technician registration APIs
and frontend booking form integration were completed.
An admin panel user interface was also created to manage users and system data.
Stripe payment gateway was integrated using test keys to demonstrate payment flow.

  ## Requirement Change in Database
Originally, the project planned to use MongoDB Atlas for database hosting.
However, during deployment and testing, free hosting limitations caused
connection and reliability issues.

Because of these limitations, the database was changed from MongoDB to Supabase.
Supabase was selected because it provides stable free hosting,
easy setup, and better compatibility for student projects.
This change helped the system to run smoothly without deployment problems.

 ### Functional Requirements
The system should allow users to view available repair services.
The system should allow technicians to register and manage their information.
The system should support booking repair services.
The system should allow admin users to view and manage system data.
The system should store and retrieve data using a cloud-based database.

 ### Non-Functional Requirements
The system should be easy to use and understand.
The interface should load within a reasonable time.
The system should work on desktop and mobile devices.
The system should be reliable under free hosting services.
The system should be easy to maintain and update.

 ### User Requirements
Customers should be able to find technicians easily.
Customers should be able to select repair services and make bookings.
Technicians should be able to register and manage their profiles.
Admins should be able to monitor system activity.

 ## System Constraints
The project is developed using free hosting services.
Advanced paid features are not used.
The system is limited to academic project requirements and timelines.

 ## Work Completed
Backend structure using Node.js and Express.js was set up.
Technician registration API endpoint was created.
Frontend booking form was connected to the backend.
Admin panel UI was designed.
Stripe payment gateway was integrated for testing purposes.

 ## Work Remaining
API testing using Postman.
Final database integration and testing.
Bug fixing and system testing.
Documentation completion.

 ## Conclusion
This requirements analysis explains the purpose and needs of the TechCare system.
The decision to change the database from MongoDB to Supabase was made
to overcome free hosting limitations and ensure system stability.

