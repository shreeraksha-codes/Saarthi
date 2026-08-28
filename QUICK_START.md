# Saarthi Quick Start Guide

## What Was Fixed

### TypeScript Compilation Errors (4 → 0)
Fixed 3 component interfaces to match their actual prop usage:
- **Resources.tsx:** Added `onStart: () => void` prop
- **DrivingLicenceFlow.tsx:** Added `focus?: string` prop  
- **journey.ts:** Fixed type assertion for timeline calculation

## Quick Commands

### Development
```bash
cd Saarthi
pnpm install  # One-time setup
pnpm dev      # Start dev servers
```
Access at: http://localhost:8443/

### Testing
```bash
pnpm typecheck    # TypeScript check
pnpm build        # Production build
node --check server/index.js  # Server syntax check
```

### Production
```bash
pnpm build
NODE_ENV=production PORT=3000 SESSION_SECRET=your-secret pnpm start
```

## Demo Credentials
- **OTP Code:** 123456
- **Any 10-digit number:** Accepted as phone number

## Key Features
✓ Learner's Licence application & issuance  
✓ Driving Licence full journey  
✓ Persistent user sessions  
✓ Educational resources  
✓ Help & recovery system  
✓ AI-guided application option (with fallback)  
✓ Mobile responsive (320px+)  
✓ Keyboard accessible  

## API Health Check
```bash
curl http://localhost:3001/api/health
# Response: {"status":"ok","service":"saarthi-api"}
```

## Files Modified
- src/pages/Resources.tsx
- src/pages/DrivingLicenceFlow.tsx
- src/journey.ts

## Status
✅ All TypeScript errors fixed
✅ Production build succeeds
✅ API endpoints working
✅ Ready for hackathon demo

---

See DEPLOYMENT_READY.md for comprehensive details.
