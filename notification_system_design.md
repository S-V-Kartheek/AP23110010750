# Stage 1 — API Design

## Endpoints

* GET /notifications
* POST /notifications
* GET /notifications/:id

## Sample Response

```json
{
  "id": "123",
  "type": "Placement",
  "message": "TCS Hiring",
  "timestamp": "2026-04-22"
}
```

## Real-time Design

Use WebSockets or Firebase for live notifications.

---

# Stage 2 — Database Design

## Suggested DB

MongoDB (NoSQL)

## Schema

```
Notification {
  id: string,
  type: string,
  message: string,
  timestamp: date
}
```

## Query Example

```
db.notifications.find({ type: "Placement" })
```

---

# Stage 3 — Query Optimization

Problem:
Slow query when fetching unread notifications.

Solution:

* Add index on studentId
* Add index on isRead
* Use pagination

Optimized Query:

```
SELECT * FROM notifications
WHERE studentId = 1042 AND isRead = false
ORDER BY createdAt DESC
LIMIT 10;
```

---

# Stage 4 — Performance Improvement

Problems:

* Fetching all notifications
* DB overload

Solutions:

* Pagination (LIMIT 10)
* Caching (Redis)
* Lazy loading

---

# Stage 5 — System Improvement

Problem:
Sending emails synchronously → slow

Solution:

* Use queue (RabbitMQ / Kafka)
* Process asynchronously

Improved Logic:

* Save to DB
* Push to queue
* Worker sends email

---

# Stage 6 — Priority Notifications

Approach:

* Fetch notifications API
* Sort by:

  * Impact (high first)
  * Timestamp (recent first)
* Return top 10
