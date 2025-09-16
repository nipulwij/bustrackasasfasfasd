Auth Demo (Passenger/Driver)

Prerequisites
- Node.js 18+

Install
```bash
npm install
```

Run
```bash
npm start
```
This serves the static files and API at `http://localhost:3000`.

- Open `http://localhost:3000/signup.html` to create an account
- Then go to `http://localhost:3000/login.html` to sign in

Notes
- Backend uses in-memory storage for demo purposes; data resets on restart.
- Endpoints:
  - POST `/api/signup` → { role, fullName, email, password, ...(driver fields) }
  - POST `/api/login` → { role, email, password }
- Driver-only fields required when role is `driver`.

Next steps
- Replace in-memory store with a database (MongoDB/Firebase/Supabase).
- Add sessions/JWT and protected routes.
- Add a dashboard page to redirect after login.


