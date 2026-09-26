# NextStep — Web Developer Technical Challenge

A responsive web experience for helping users understand a stressful or complicated situation and identify what matters most and what to do next.

## 1. Project Overview

NextStep is designed around a simple principle:

> When a user is stressed, the interface should help them understand what matters first instead of overwhelming them with information.

The application accepts a user's situation, sends it to the provided mock API, and presents the response using progressive disclosure.

The main experience includes:

* Situation input
* Clear situation summary
* Recommended next action
* Prioritized issues/actions
* Clarifying questions
* Situation updates
* Loading states for slower AI responses
* Calm error messages
* Support mode for emotional/at-risk situations
* Responsive mobile layout
* Persistence across page refreshes

---

## 2. Tech Stack

* React
* Vite
* JavaScript
* HTML
* CSS
* REST API
* Browser Local Storage

### API

The application uses the provided NextStep Mock API:

`https://nextstepmockapi.onrender.com`

The main endpoints used are:

* `POST /v1/situations`
* `POST /v1/situations/{situation_id}/updates`

The candidate ID is stored in an environment variable instead of being hardcoded in the source code.

---

## 3. Design Approach

The original problem presents multiple issues with similar visual importance.

Instead of showing everything at once, I designed the interface around progressive disclosure.

### Information hierarchy

The response is presented in this order:

1. **Next Action**
2. **Your Situation**
3. **Situation Update**
4. **What Changed**, when applicable
5. **What Matters First**
6. **Clarifying Questions**

Only the first two priorities are initially shown. Additional priorities can be revealed when the user chooses:

**"See other priorities"**

This keeps the initial screen focused while still making additional information available.

---

## 4. Loading Experience

The challenge highlights that AI responses can take several seconds.

Instead of showing only a spinner, the application communicates what is happening at different stages.

### Initial stage

The user sees:

> We're looking at what matters most first.

### After approximately 5 seconds

The message changes to:

> We're organizing what needs attention first.

### After approximately 10 seconds

The application communicates that the response is taking longer than usual while keeping the user's situation visible.

This gives the user useful feedback instead of leaving them wondering whether the application is working.

---

## 5. Responsive Design

The interface was designed for mobile-first usage because the challenge states that users may arrive through WhatsApp on mobile.

The layout was checked at approximately **360px width**.

Important responsive decisions include:

* Stacked content on smaller screens
* Readable text sizes
* Full-width controls where appropriate
* Wrapping long content instead of causing horizontal overflow
* Touch-friendly buttons
* Maintaining the information hierarchy on small screens

---

## 6. Accessibility

Accessibility was considered in the core interaction.

### Screen-reader announcement

When an analysis is ready, the application uses an accessible status region to announce that the response is ready without forcing the screen reader to read every piece of generated content.

### Keyboard focus

Interactive elements have visible focus styling.

### Semantic controls

Buttons, labels, textareas and alert regions use appropriate HTML/accessibility attributes.

---

## 7. Error Handling

The mock API can return failures such as server errors and malformed responses.

Instead of displaying technical or alarming messages, the application uses calm and actionable error states.

For example:

> We couldn't make sense of this yet. Your situation is still here, so you can try again.

The user's input is preserved so an API failure does not force them to start over.

---

## 8. Situation Persistence

The situation and latest result are stored in browser `localStorage`.

This means refreshing the page does not erase the user's situation or the previous analysis.

This was important because the challenge specifically states that refreshing or navigating during the flow should not unnecessarily erase the user's situation.

---

## 9. Situation Updates

After receiving an initial analysis, the user can provide additional information through:

**"Something changed?"**

The update is sent to the API using the existing `situation_id`.

The updated response can include:

* New priorities
* Updated next action
* Changes from the previous situation

This allows the experience to adapt rather than forcing the user to start a completely new analysis.

---

## 10. Support Mode

Scenario 4 demonstrates that an emotional/at-risk situation should not be treated like a normal productivity problem.

When the API returns `mode: "support"`, the application switches to a different presentation.

Instead of showing normal priority cards, it presents:

* A calm heading
* The situation summary
* Support information
* An option to continue when the user is ready

This keeps the experience different from the standard priority-planning mode.

---

## 11. Seven Shared Scenarios Tested

The application was tested against all seven scenarios provided in the challenge:

1. Multi-problem situation
2. Hinglish situation
3. Contradictory information
4. Emotional / at-risk situation
5. Irrelevant request
6. Adversarial prompt
7. Situation becoming worse after an action

The implementation was adjusted based on the behavior of these scenarios.

---

## 12. Mock API / Chaos Testing

The challenge provides deliberate failure modes through the `X-Chaos` header.

I used the provided chaos mechanism to verify important failure handling, including:

* Server error
* Malformed response

The temporary `X-Chaos` header was removed from the final application code.

The goal was to verify that API failures produce calm, meaningful error states rather than exposing technical details to the user.

---

## 13. Design System

The interface uses CSS variables as design tokens instead of scattering hardcoded values throughout the stylesheet.

Tokens are used for:

* Background
* Surface
* Text
* Muted text
* Borders
* Accent colors
* Warning states
* Spacing
* Border radius

This makes the visual system easier to maintain and keeps the interface consistent.

---

## 14. Component / UI Structure

The application is currently kept intentionally lightweight because the challenge is focused on the experience rather than building a large production application.

The main UI areas are:

* Header
* Situation input
* Loading state
* Error state
* Next action
* Situation summary
* Situation update
* Changes
* Priorities
* Clarifying questions
* Support mode

The UI is driven by the API response rather than hardcoding individual scenario outputs.

---

## 15. Curveball Handling

The challenge includes several unexpected situations.

### Contradictory information

When the API identifies conflicting information, the interface presents the available information and clarifying questions rather than pretending that both statements are definitely true.

### Adversarial input

The adversarial scenario is treated as user-provided content rather than as an instruction to the application.

The frontend does not display an account-compromise warning or request sensitive credentials such as a UPI PIN.

### Irrelevant requests

The application follows the API response for requests outside the intended problem-solving use case rather than attempting to turn every request into a priority plan.

### Situation becoming worse

The situation update flow allows the user to tell the system when an earlier action had a negative outcome and receive an updated analysis.

---

## 16. Jugaad

### Problem identified

A user may accidentally click the submit button multiple times while waiting for a slow API response.

This can potentially create duplicate requests.

### Current handling

The submit button is disabled while the application is loading.

This prevents repeated submissions through the normal UI while the current request is being processed.

A more advanced production implementation could additionally use request IDs or server-side idempotency, but that was outside the scope of this challenge.

---

## 17. What I Chose Not to Build

I intentionally avoided adding functionality that was not necessary for the core challenge.

Examples include:

* Authentication
* Database-backed user accounts
* Complex real-time infrastructure
* A separate backend
* Advanced analytics
* A full chat system
* Extensive animation
* Production-grade multi-device synchronization

The focus was kept on:

**information hierarchy, progressive disclosure, responsiveness, accessibility, meaningful loading/error states, and situation updates.**

---

## 18. AI Usage Disclosure

AI tools were used during development as a coding and problem-solving assistant.

### Tool used

ChatGPT

### AI-assisted tasks

AI was used for:

* Understanding the challenge requirements
* Planning the React implementation
* Debugging frontend issues
* Structuring API requests
* Improving loading and error states
* Reviewing accessibility considerations
* Preparing documentation

### How AI output was handled

AI-generated suggestions were reviewed and tested against the actual challenge and API behavior.

Some suggestions were modified or rejected when they added unnecessary complexity or did not match the challenge requirements.

### Example of an AI mistake

One suggestion involved spending additional effort on more advanced two-tab synchronization.

After reviewing the challenge scope and time constraints, I decided not to over-engineer this behavior and kept the implementation focused on the core requirements.

This reflects the development approach used throughout the project: AI suggestions were treated as recommendations rather than automatically accepted solutions.

---

## 19. Running the Project

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

### Environment variable

Create a `.env` file in the project root:

```env
VITE_CANDIDATE_ID=your-candidate-id
```

The candidate ID is read using:

```javascript
import.meta.env.VITE_CANDIDATE_ID
```

---

## 20. Final Focus

The implementation priorit
