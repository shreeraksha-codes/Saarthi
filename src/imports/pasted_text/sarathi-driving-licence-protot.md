Design a complete high-fidelity responsive website prototype for an Indian citizen-facing driving licence service called “Sarathi”.

IMPORTANT PRODUCT VISION:
This is an independent hackathon prototype inspired by the Indian Parivahan/Sarathi driving-licence journey. The goal is NOT to recreate the government website. The goal is to redesign the experience so an ordinary Indian citizen can understand what to do without confusion.

DESIGN PRINCIPLE:
“Government process underneath, consumer-grade simplicity on top.”

The website must feel:
- Extremely simple
- Trustworthy
- Calm
- Modern
- Indian but not stereotypically Indian
- Accessible on low-end phones and slow connections
- Easy for first-time internet users
- Clear enough that a user never wonders “what do I do next?”

Avoid:
- Government-portal-looking UI
- Dense dashboards
- Too many navigation items
- Heavy animations
- Huge gradients
- Glassmorphism
- Excessive cards
- Complicated sidebars
- Tiny text
- Decorative elements that hurt usability

Use subtle 2D visual design, clean typography, generous spacing, strong hierarchy, accessible contrast, and lightweight interactions.

GLOBAL NAVIGATION:

PUBLIC WEBSITE:
Logo/brand: SARATHI

Navigation:
- Resources
- Login

Primary CTA:
- Apply for a Licence

DO NOT put “Check Eligibility” or “Track Application” in the main navigation.

After the user signs in, the experience changes to:
- My Journey
- Resources
- Profile/Account

LANDING PAGE:

Create a highly polished landing page.

Hero:
“Your driving licence journey, made simple.”

Supporting text:
“From your first learner’s licence to your full driving licence — know what you need, what happens next, and where you are in the journey.”

Primary CTA:
“Apply for a Licence →”

Secondary subtle CTA:
“Explore Resources”

Below the hero, visually explain the overall journey:

Start
→ Learner’s Licence
→ 30-day waiting period
→ Driving Licence
→ Driving Test
→ Licence Delivered

Include a short trust/disclaimer section:
“Independent prototype. Government services shown here are simulated and are not connected to Parivahan or any government system.”

RESOURCES:

Create a public Resources area that does NOT require login.

Include:
1. How the licence journey works
2. Documents you may need
3. Learner’s Licence guide
4. Driving Licence guide
5. Road signs
6. Practice test
7. RTO visit checklist
8. Driving-test preparation
9. Fees and payments
10. Common problems / FAQs

Make Resources feel like a simple learning centre, not a government document archive.

APPLICATION ENTRY:

When the user clicks “Apply for a Licence”, show:

“What do you want to do?”

Option 1:
“My first Learner’s Licence”

Option 2:
“I already have a Learner’s Licence”

Option 3:
“Something else”

After selecting an option, ask the user to sign in/create an account.

SIGN-IN:

Design a very simple login/create-account experience.

Do not overwhelm the user.

After successful login, show “My Journey”.

MY JOURNEY DASHBOARD:

This is the most important screen.

Create a personalized but extremely simple dashboard.

Example:

“Good morning, [Name]”

“Your driving licence journey”

Show one clear vertical journey/timeline:

✓ Application started
✓ Personal details
✓ Documents
✓ Payment
○ Learner’s Licence test
○ Learner’s Licence issued
○ 30-day waiting period
○ Apply for Driving Licence
○ Driving test
○ Licence issued
○ Delivery

Highlight ONE section:

“Your next step”

For example:
“Complete your document check”

Explain:
“What you need to do”
“Why it matters”
“What happens afterwards”

Primary button:
“Continue →”

Also include:
- Documents
- Payments
- Appointments
- Help / “I’m stuck”
- Resources

But keep these secondary to the main journey.

APPLICATION FLOW:

Design the application as a sequence of simple full-width steps rather than a complicated government form.

Step 1:
What are you applying for?

Step 2:
State + RTO

Step 3:
Eligibility / vehicle class

Step 4:
Personal details
- Name
- Date of birth
- Contact details
- Address

Step 5:
Photo/signature where applicable

Step 6:
Documents

Show a personalized document checklist.

Include:
- Document name
- Why it is needed
- Accepted formats
- Status
- Replace/edit option

Step 7:
Fitness declaration

Explain Form 1 and Form 1A in plain language, with conditional/state-dependent messaging.

Step 8:
Review

Show all information clearly with “Edit” controls.

Step 9:
Fees

Show a transparent fee breakdown.

Step 10:
Payment

Clearly distinguish simulated payment from real government payment.

Step 11:
Appointment / RTO visit where applicable

Explain:
- Date
- Time
- Location
- What to bring
- Original documents
- Vehicle requirement where applicable

Step 12:
Learner’s Licence test

Show:
- Test preparation
- Safety preparation
- Camera/identity verification where applicable
- Practice test
- Start test

Step 13:
Result

Create both:
PASS
and
NEEDS ANOTHER ATTEMPT

Do not make failure feel punitive.

LL STAGE:

After passing:

Show:
“Your Learner’s Licence journey is complete.”

Show:
- LL issued
- Download/print
- LL validity
- Minimum 30-day waiting period before applying for permanent DL

Create a visual countdown/timeline showing:
“Eligible to apply for permanent Driving Licence after 30 days.”

Also show:
“Your Learner’s Licence remains valid for 6 months.”

DRIVING LICENCE STAGE:

After the waiting period:

Show:
“You can now apply for your Driving Licence.”

Flow:

1. Continue application
2. Existing information carried forward
3. Confirm details
4. Documents
5. Fee
6. Payment
7. Book driving-test appointment
8. RTO preparation

RTO PREPARATION SCREEN:

Make this extremely useful.

Show:

“Before you go”

✓ Original documents
✓ Appointment confirmation
✓ Required application/reference details
✓ Appropriate vehicle
✓ Any state/RTO-specific requirements

Explain that online steps may not replace the physical RTO visit where required.

DRIVING TEST:

Create a preparation screen and simulated driving competence test.

After the test, create:

PASS:
“Driving test passed.”

Then:
“Your Driving Licence is being issued.”

FAIL:
“Your test needs another attempt.”

Explain the next steps without blame and provide a simulated retest path.

LICENCE DELIVERY:

Create a final tracking screen:

“Your Driving Licence is on its way.”

Timeline:

✓ Test passed
✓ Licence issued
✓ Printed
✓ Dispatched
✓ Delivered

Clearly label everything as simulated/demo.

HELP / RECOVERY:

Create an “I’m stuck” experience inside My Journey.

Possible problems:
- I have been waiting too long
- My document was rejected
- My payment status looks wrong
- I cannot continue
- I don't know what to do next

For every problem, show a plain-language recommended next action.

AI GUIDANCE:

The product should eventually support an AI-guided application mode.

Design a lightweight conversational interface where the AI asks one question at a time and fills the SAME underlying application data as the classic form.

Important:
AI should not create a separate application.

Classic form and AI guide must lead to the SAME application and SAME My Journey dashboard.

RESPONSIVE DESIGN:

Design for:
- Mobile first
- Low-end Android phones
- Desktop
- Tablet

Prioritize mobile usability.

Buttons should have large touch targets.
Text should remain readable.
Avoid interactions requiring hover.
Keep pages lightweight.

VISUAL STYLE:

Create a distinctive but restrained 2D visual identity.

Use:
- Clean sans-serif typography
- Strong typography hierarchy
- White/light neutral background
- Deep teal/green as the primary brand colour
- Warm yellow/gold only as an accent
- Rounded but not overly playful components
- Simple line icons
- Subtle illustrations
- Clear progress indicators
- Accessible contrast

The design should feel closer to a modern consumer service such as a high-quality banking, travel, or public-service app — NOT like an existing government portal.

Do not use heavy motion or 3D.

DELIVERABLE:

Create the complete Figma prototype with:
- Design system
- Typography
- Colour tokens
- Buttons
- Inputs
- Cards
- Navigation
- Timeline components
- Status components
- Mobile layouts
- Desktop layouts
- All major screens listed above
- Clickable prototype connections showing the complete journey

Prioritize the actual user journey and information architecture over decorative design.

The final prototype should communicate one central idea:

“Government processes are complicated. The citizen should not have to experience that complexity.”