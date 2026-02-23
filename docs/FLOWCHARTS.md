# TriGo – System / Application Flowcharts

Accurate flowcharts for the **IoT-Based Tricycle Tracking and Monitoring System (TriGo)** web app, based on the actual routes and features.

**Generated images** (in `assets/`): `admin-flowchart.png`, `passenger-flowchart.png`, `driver-flowchart.png`, `context-diagram.png`, `data-flow-diagram.png`, `entity-relationship-diagram.png`, `use-case-diagram.png`

---

## Figure 8. Use Case Diagram

The use case diagram shows **actors** (Passenger, Tricycle Driver, Administrator) and **use cases** inside the system boundary **TriGo – IoT-based Tricycle Tracking and Monitoring System**, based on the web app.

![Use Case Diagram](../assets/use-case-diagram.png)

**Actors and use cases (from app):**

| Actor | Use cases |
|-------|-----------|
| **Passenger** | Request Ride, Track Ride, Rate Driver, Submit Support Ticket, Submit Feedback |
| **Tricycle Driver** | Accept Rides, Complete Ride, Track Ride, Submit Support Ticket, Submit Feedback |
| **Administrator** | Manage Driver Applications, Monitor Tricycle Rides, Monitor Activity Logs, Manage Support Tickets, Manage Passengers and Drivers |

*Copy `use-case-diagram.png` from the Cursor project assets folder into your repo’s `assets/` folder if the image does not show.*

---

## Figure 7. Entity Relationship Diagram (ERD)

The ERD shows the TriGo database schema: **entities** (tables) with key attributes and **relationships** (PK/FK). Central entity is **users**; related tables include **bookings** (passenger_id, driver_id), **driver_applications**, **reviews**, **messages**, **support_tickets**, **feedbacks**, **notifications**, **saved_places**, **favorite_drivers**, **activity_logs**, and **pricing_rules** (standalone).

![Entity Relationship Diagram](../assets/entity-relationship-diagram.png)

*If the image does not show, copy `entity-relationship-diagram.png` from the Cursor project assets folder into your repo’s `assets/` folder.*

---

## Figure 6. Data Flow Diagram

The data flow diagram shows **external entities** (circles): Passengers, Tricycle Drivers, Administrator; the **central system** (rectangle): TriGo – IoT-based Tricycle Tracking and Monitoring System; and **labeled data flows** (arrows) between them, based on the web app.

![Data Flow Diagram](../assets/data-flow-diagram.png)

**Flows (from app):**

| Entity | → System | System → |
|--------|----------|----------|
| **Passengers** | Request ride; Log in & manage account; Submit support ticket & feedback; Rate driver | Booking & ride updates; Support responses; Notifications |
| **Tricycle Drivers** | Accept ride request; Log in & manage account; Send location; Submit support ticket & feedback | Booking requests; Support responses; Notifications (e.g. application approved) |
| **Administrator** | Manage tricycle rides; Manage users, drivers, applications, support & feedback | Track activity logs; Dashboard data & notifications |

---

## Figure 5. Context Diagram

The context diagram shows how **TriGo** (the central system) interacts with external actors: **Administrator**, **Passenger**, and **Driver**. All flows are based on the actual web app.

![Context Diagram](../assets/context-diagram.png)

**Flows (from app):**

| Actor | → System | System → |
|-------|----------|----------|
| **Administrator** | Manage users & security; Manage tricycle & driver data; Manage driver applications; Manage bookings; Manage support tickets & feedback; View activity logs & analytics | Activity logs; Dashboard data & notifications (new feedback, new support tickets) |
| **Passenger** | Request ride; Submit support ticket & feedback; Rate driver (review); Saved places & favorite drivers | Booking & ride updates; Support responses; Notifications; SOS alert |
| **Driver** | Accept & complete rides; Submit support ticket & feedback; Send location (tracking); Toggle online status | Booking requests; Support responses; Notifications (e.g. application approved/rejected); SOS alert |

---

## Figure 1. Admin Flowchart

![Admin Flowchart](../assets/admin-flowchart.png)

**Flow (from app):** Welcome/Dashboard → Login → Input Admin Account → Sign In (No → re-enter; Yes → Dashboard). From Dashboard: View Tricycles on Map (Hinobaan map), Passenger Management (add/toggle/delete), Driver Management (view/update status/delete), Driver Applications (approve/reject), Bookings (view/cancel/delete), Activity Logs (passenger & driver), Support Tickets (view/respond/delete by tab), Feedback & Ratings, Analytics (view/export), Profile & Settings (landing page, maintenance) → Log Out → End.

---

## Figure 2. Passenger Flowchart

![Passenger Flowchart](../assets/passenger-flowchart.png)

**Flow (from app):** Welcome/Landing → Register (user type) → Login → Input Passenger Account → Sign In (No → re-enter; Yes → Dashboard). From Dashboard: Book Ride (pickup, destination, confirm), View Active Ride / real-time tracking, Ride History (completed rides, rate driver), Saved Places & Favorites (home/school/work, favorite drivers), Support & Help (submit ticket, view responses), Safety, Feedback (rating & feedback), Profile & Settings (emergency contact, avatar) → Log Out → End.

---

## Figure 3. Driver Flowchart

![Driver Flowchart](../assets/driver-flowchart.png)

**Flow (from app):** Welcome/Landing → Register / Become Driver (apply, submit documents) → Login → Input Driver Account → Sign In (No → re-enter; Yes → Dashboard). From Dashboard: Bookings (view requests, accept ride), View Real-Time Ride (track & complete ride), Earnings, Ride History, Analytics, Messages (chat with passengers), Support & Help (submit ticket, view responses), Feedback, Toggle Online Status, Profile & Settings → Log Out → End.

---

## Symbol key

| Symbol   | Meaning              |
|----------|----------------------|
| Oval     | Start / End          |
| Rectangle| Process step         |
| Parallelogram | Input / Output  |
| Diamond  | Decision (Yes/No)    |
