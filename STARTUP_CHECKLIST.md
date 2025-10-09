# Startup Checklist

## Before Starting the Server

- [ ] .env file created (copy from env.example)
- [ ] SUPABASE_URL configured
- [ ] SUPABASE_ANON_KEY configured
- [ ] SUPABASE_SERVICE_ROLE_KEY configured
- [ ] JWT_SECRET configured (32+ characters)
- [ ] npm install completed
- [ ] Port 5000 is available

## After Starting the Server

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Health endpoint responds: http://localhost:5000/api/health
- [ ] WebSocket server started

## Testing

- [ ] Can register a new user
- [ ] Can login with user account
- [ ] Can upload CSV file
- [ ] Calendar displays correctly
- [ ] EA marketplace loads
- [ ] No console errors

## Ready to Launch! 🚀

If all boxes are checked, you're ready to deploy!
