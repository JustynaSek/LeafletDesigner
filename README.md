AI-Powered Leaflet Generator (MVP)
Project Overview
This project aims to build a Minimum Viable Product (MVP) for a web application that generates custom leaflets. It features a hybrid data gathering approach: users first provide essential, structured information via a form. Following this, an AI conversational agent (powered by the OpenAI Assistants API) will engage the user in a dialogue, asking clarifying questions to gather more nuanced and specific preferences for the leaflet design. Once sufficient data is collected, the AI will synthesize this information into a comprehensive prompt for a direct AI image generation model (e.g., OpenAI's DALL-E 3), which will create the entire visual leaflet as a single image. This image will then be displayed to the user through a modern Next.js frontend.

This MVP prioritizes demonstrating the core concept end-to-end, leveraging the latest advancements in text-to-image AI.

Core Features (MVP Focus)
Hybrid Data Gathering (Form + Conversational AI):
Initial Form Input: Collects essential, structured information like leaflet purpose, target audience, and preferred size.
Conversational AI Agent (OpenAI Assistants API): Guides the user through follow-up questions to gather more specific design details (e.g., key messages, desired tone, imagery ideas).
Contextual Questioning: The AI agent leverages initial form data to ask relevant follow-up questions.
Direct AI Leaflet Image Generation: The AI agent constructs a detailed prompt for a text-to-image model (e.g., DALL-E 3) which generates the complete leaflet image.
Image & Text Rendering: The AI image model will attempt to render all specified text content and visual elements directly into the final image.
Real-time Feedback: Displays conversation turns and basic loading states during image generation.
Responsive UI: A simple web interface for form input and chat interaction, built with Next.js and Tailwind CSS.
User & Session Management: Basic session handling for tracking conversations. (Full NextAuth.js authentication will be a later enhancement for MVP).
Secure API Handling: Manages API keys and secrets securely on the server-side.
Technology Stack
Frontend Framework: Next.js (React.js App Router)
Styling: Tailwind CSS
Backend (within Next.js API Routes): Node.js / TypeScript
LLM & Conversational Agent: OpenAI Assistants API
Direct Image Generation: OpenAI DALL-E 3 API (or other advanced model like Google's Imagen 3).
HTTP Client: axios or node-fetch
Database: PostgreSQL / MongoDB / SQLite (for MVP, SQLite via Prisma can be quick for local development)
ORM: Prisma (recommended for database interaction)
Instruction to the LLM: Interactive, Step-by-Step Development
This is a collaborative development process. Instead of providing all code at once, please follow these instructions:

Understand the Current Step: Review the current step's Goal and Detailed Actions.
Perform Necessary Research: For each step involving code generation or API interaction, conduct web searches to ensure you are using the absolute newest and most current documentation, API versions, and recommended practices for each technology listed (Next.js App Router, OpenAI Assistants API, DALL-E 3 API, Prisma, NextAuth.js). Your generated code should reflect these up-to-date standards.
Ask Clarifying Questions: If you encounter any doubts, ambiguities, or need more specific information from me (e.g., specific choices for database, a particular styling preference, a more detailed example for an API call), ask me a question before generating code.
Deliver Code Incrementally: Provide the code for only the current sub-step or a small logical unit. Do not provide code for future steps.
Explain the Code: For each code block, provide a clear, concise explanation of what it does, why it's structured that way, and any important considerations or prerequisites.
Suggest Testing: After delivering a piece of code, recommend how I can test its functionality before moving to the next step. This is crucial for verifying progress.
Confirm Readiness: Ask me if I've successfully tested and understood the current step's code and if I'm ready to proceed.
Project Structure
your-ai-leaflet-app/
├── public/                     # Static assets (images, fonts)
├── app/
│   ├── api/
│   │   ├── initial-form/route.ts    # API endpoint for initial form submission
│   │   └── chat/route.ts            # Main API endpoint for conversational interaction
│   ├── components/             # Reusable React components
│   │   ├── InitialForm.tsx          # Component for the initial data collection form
│   │   ├── ChatInterface.tsx        # Component for chat messages
│   │   ├── LoadingSpinner.tsx       # Simple spinner
│   │   └── LeafletPreview.tsx       # Component to display the leaflet image
│   ├── lib/                    # Utility functions, API clients, database client
│   │   ├── openaiClient.ts          # OpenAI API client
│   │   ├── assistantManager.ts      # Logic for managing OpenAI Assistant & Threads
│   │   ├── imageGenerationTools.ts  # New: Functions exposed as Tools to OpenAI Assistant (e.g., generate DALL-E image)
│   │   └── db.ts                    # Database client setup
│   ├── globals.css             # Global CSS (Tailwind imports)
│   ├── layout.tsx              # Root layout for the application
│   └── page.tsx                # Main application page (Form / Chat / Leaflet UI)
├── prisma/                     # (If using Prisma) Database schema
├── .env.local                  # Environment variables
├── next.config.js              # Next.js configuration
├── package.json                # Project dependencies
├── postcss.config.js           # PostCSS configuration for Tailwind
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
Step-by-Step Generation Plan (Detailed for MVP)
Phase 1: Core Backend & Agent Setup (Foundation for MVP)
Step 1.1: Project Initialization & Environment Configuration
Goal: Set up a basic Next.js project, integrate Tailwind CSS, and prepare for secure environment variable management.

Actions:

Create Next.js App: Execute npx create-next-app@latest your-ai-leaflet-app --typescript --tailwind --app in your terminal. This sets up the App Router and Tailwind.
Install Essential Dependencies:
npm install openai axios prisma @prisma/client (for OpenAI API, HTTP requests, and database ORM).
npm install -D @types/node (if not already present for TypeScript).
Configure tailwind.config.ts and postcss.config.js: Ensure the content array in tailwind.config.ts correctly points to your app directory files for JIT compilation (./app/**/*.{js,ts,jsx,tsx,mdx}). postcss.config.js usually requires no changes if created by create-next-app.
Global CSS (app/globals.css): Verify Tailwind directives @tailwind base;, @tailwind components;, @tailwind utilities; are at the top.
Environment Variables (.env.local): Create this file in the root.
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL="file:./dev.db" (for SQLite MVP) or your PostgreSQL/MongoDB connection string.
OPENAI_ASSISTANT_ID=your_openai_assistant_id (This ID will be generated when we create the Assistant later).
Key Considerations for the LLM:

Ensure all necessary package.json entries are generated.
Provide the basic content for tailwind.config.ts and postcss.config.js.
Emphasize the security of .env.local (not committed to Git) and the need for corresponding environment variables in deployment environments (e.g., Vercel's dashboard).
Step 1.2: Database Setup & Prisma Models
Goal: Set up Prisma as an ORM and define the database schema for storing essential application data.

Actions:

Initialize Prisma: Run npx prisma init in your terminal. This creates the prisma directory with schema.prisma and .env files (you'll use your root .env.local).
Define Prisma Schema (prisma/schema.prisma):
Define datasource (e.g., sqlite for dev, postgresql for prod).
Define generator client.
Define model Conversation:
id (String @id @default(cuid()))
userId (String) - for now, can be a dummy value for MVP if full auth isn't integrated yet, but prepare for it. Consider using String? for optionality during early MVP.
initialFormData (Json?) - to store the initial form submission.
threadId (String? @unique) - the OpenAI Assistant Thread ID.
history (Json @default("[]")) - array of chat messages, stored as JSON string.
status (String @default("awaiting_form")) - e.g., "awaiting_form", "gathering_info", "designing", "completed", "failed".
designData (Json?) - parsed, structured data collected for the leaflet.
leafletUrl (String?) - URL of the final generated leaflet image.
createdAt (DateTime @default(now()))
updatedAt (DateTime @updatedAt)
Generate Prisma Client: Run npx prisma generate. This creates the node_modules/@prisma/client library for interacting with your database.
Database Client (app/lib/db.ts):
Create app/lib/db.ts to instantiate and export the Prisma client. This ensures a single instance across your application.
Key Considerations for the LLM:

Provide the complete schema.prisma content adhering to the latest Prisma syntax.
Show how to initialize and export PrismaClient in app/lib/db.ts to prevent multiple instances.
Remind to run npx prisma migrate dev --name init after schema definition to create the database (for SQLite) or apply initial migrations (for others).
Step 1.3: OpenAI API Client & Assistant Manager (app/lib/openaiClient.ts, app/lib/assistantManager.ts)
Goal: Set up the core components for interacting with the OpenAI Assistants API.

Actions:

OpenAI Client (app/lib/openaiClient.ts):
Initialize the OpenAI client instance from the openai package, using process.env.OPENAI_API_KEY. Export it. Adhere to the latest OpenAI Node.js SDK syntax.
OpenAI Assistant Manager (app/lib/assistantManager.ts):
Create app/lib/assistantManager.ts. This module will house the logic for working with the OpenAI Assistant.
Functions:
getOrCreateAssistant(): MVP Strategy: This function should try to retrieve an existing Assistant by OPENAI_ASSISTANT_ID from .env.local. If OPENAI_ASSISTANT_ID is empty or the Assistant is not found, it should create a new Assistant via openai.beta.assistants.create() with basic instructions and tool definitions, then log its ID for the developer to copy to .env.local. This makes initial setup easier.
createThread(): Calls openai.beta.threads.create() to get a new thread ID.
addMessageToThread(threadId: string, role: 'user' | 'assistant', content: string): Adds a message to a thread (openai.beta.threads.messages.create()).
runAssistant(threadId: string, assistantId: string): Initiates a run using openai.beta.threads.runs.create().
retrieveRun(threadId: string, runId: string): Retrieves the status of a specific run (openai.beta.threads.runs.retrieve()).
getThreadMessages(threadId: string): Retrieves messages from a thread (openai.beta.threads.messages.list()).
submitToolOutputs(threadId: string, runId: string, toolOutputs: Array<{ tool_call_id: string; output: string | object }>): Submits the results of tool calls back to the Assistant (openai.beta.threads.runs.submitToolOutputs()).
Tool Definitions (for the Assistant's initial creation/configuration): The LLM should provide the JSON schema for your generateLeafletImageTool (defined in Step 1.4). This schema must include name, description, and parameters (with type, properties, required fields) matching the expected arguments of your tool function.
Key Considerations for the LLM:

Adhere to the latest OpenAI Node.js SDK syntax for the Assistants API.
Provide boilerplate for openaiClient.ts.
Detail the implementation of each assistantManager.ts function, including return types and error handling.
Show a clear example of a tool schema definition that will be used by the Assistant.
Step 1.4: Tool Implementation (app/lib/imageGenerationTools.ts)
Goal: Create functions that encapsulate the core image generation logic using DALL-E 3, which the OpenAI Assistant will "call" via your backend.
Actions:
app/lib/imageGenerationTools.ts:
Create this file. It will contain the actual implementation of functions callable by the Assistant.
generateLeafletImageTool(designData: object, userId: string): Promise<string>:
This function will be recognized as a tool by the OpenAI Assistant through its schema.
Input Validation: Parse and validate designData (e.g., ensure leafletSize, purpose, headline, bodyText, contact, style, imagery_prompt are present as per your LLM's design plan).
Construct DALL-E 3 Prompt: This is crucial. The LLM needs to synthesize all designData into a single, highly detailed, and effective prompt for DALL-E 3.
Emphasize Text: Explicitly state the text to be included. Example: "A tri-fold leaflet design. Front panel: [Headline from designData]. Inner panel 1: [BodyText1 from designData]. Inner panel 2: [BodyText2 from designData]. Back panel: [ContactInfo from designData]. Style: [Style from designData]. Imagery: [ImageryPrompt from designData]. Ensure all text is clearly legible and integrated into the design."
Layout Hints: Use phrases like "tri-fold layout," "distinct sections," "panels."
Quality/Style: Include descriptors for quality: "hd" and style: "vivid" (or natural).
Resolution: Choose a rectangular resolution like 1024x1792 or 1792x1024 for leaflets.
Call DALL-E 3 API:
Use openaiClient.images.generate() with the constructed prompt, model: "dall-e-3", quality, size, n: 1.
Extract Image URL: Retrieve the url from the DALL-E 3 response.
Store & Return Result:
Update the Conversation record in the database (db.conversation.update()) with leafletUrl: imageUrl and status: "completed".
Return the imageUrl string.
Key Considerations for the LLM:
Provide full code for generateLeafletImageTool.
Focus heavily on the prompt engineering for DALL-E 3. This is where text legibility and complex layout hints are managed.
Emphasize robust error handling for DALL-E API calls and database updates.
Remind about DALL-E 3's pricing per image and potential re-generations.
Phase 2: Minimal Frontend UI (Connecting the Dots for MVP)
Step 2.1: Basic Frontend UI Orchestration (app/page.tsx, app/layout.tsx)
Goal: Create the main page structure and handle conditional rendering between the initial form and the chat interface.

Actions:

app/layout.tsx:
Set up the root layout with basic HTML structure and body with Tailwind classes.
Import global CSS (app/globals.css).
Wrap the children prop with a SessionProvider (from NextAuth.js, which will be integrated in a later step; for now, it can be a basic context provider or omitted for MVP if you're not doing multi-user auth yet).
app/page.tsx:
Mark as a client component ('use client').
Use useState hooks for:
conversationId: string | null (stores the ID of the current conversation).
conversationStatus: string (e.g., 'awaiting_form', 'in_chat', 'designing', 'completed', 'error').
messages: Array<{ sender: 'user' | 'ai', text: string }>.
leafletUrl: string | null.
useEffect for Session/Resumption: On component mount, attempt to retrieve a conversationId from local storage. If found, make an API call to /api/chat?conversationId=... (a GET request we'll add later) to fetch the existing Conversation state from the database and resume the UI state.
Conditional Rendering:
If conversationStatus is 'awaiting_form', render InitialForm.tsx.
If conversationStatus is 'in_chat' or 'designing', render ChatInterface.tsx.
If conversationStatus is 'completed', render LeafletPreview.tsx.
Pass necessary props and callback functions to child components.
Key Considerations for the LLM:

Provide the full code for app/layout.tsx and app/page.tsx.
Demonstrate the use of useState and useEffect for state management and side effects.
Emphasize the 'use client' directive for interactive components.
Step 2.2: Initial Form Component (app/components/InitialForm.tsx)
Goal: Create a simple form for initial data collection and send it to the backend.

Actions:

app/components/InitialForm.tsx:
Mark as a client component ('use client').
Props: onFormSubmit: (formData: object) => void.
Create HTML form elements: <input type="text">, <select>, <textarea>.
Fields: "Purpose of Leaflet", "Target Audience", "Key Message 1", "Key Message 2", "Contact Email", "Desired Leaflet Size (e.g., 1024x1792 for portrait, 1792x1024 for landscape)". Use a select dropdown for DALL-E's fixed sizes.
Use useState for each form field's value.
Implement an onSubmit handler for the form:
Prevent default form submission (event.preventDefault()).
Collect all current form data into a single object.
Call the onFormSubmit prop with the collected data.
Manage a local isSubmitting state to disable the button and show a spinner during submission.
Include basic Tailwind styling for a clean, functional form.
Key Considerations for the LLM:

Provide example form fields and their useState setup.
Show the onSubmit handler's structure.
Remind about basic client-side form validation (e.g., check for empty fields) for a better UX.
Step 2.3: Chat Interface Component (app/components/ChatInterface.tsx)
Goal: Create a basic chat UI that displays messages and allows user input.

Actions:

app/components/ChatInterface.tsx:
Mark as a client component ('use client').
Props: conversationId: string, messages: Array<{ sender: 'user' | 'ai', text: string }>, onSendMessage: (message: string) => void, status: string, leafletUrl: string | null.
State: inputMessage: string.
Render a div for chat messages:
Map over the messages prop to display each message, differentiating between 'user' and 'ai' messages with different styling.
Ensure the chat container is scrollable and automatically scrolls to the bottom on new messages (useEffect).
Render an input field for inputMessage and a "Send" button.
onSend handler:
Add user's message to the local messages state immediately for optimistic UI update.
Call the onSendMessage prop with inputMessage.
Clear the input field.
Display a simple LoadingSpinner.tsx when status indicates the AI is processing ('in_chat', 'designing').
MVP Conversation Status Display: Show informative text like "Generating your leaflet..." when status is 'designing'.
Key Considerations for the LLM:

Provide a clear message rendering loop.
Show useEffect for auto-scrolling.
Demonstrate integration of LoadingSpinner.tsx.
Step 2.4: Leaflet Preview Component (app/components/LeafletPreview.tsx)
Goal: Display the generated leaflet image to the user.

Actions:

app/components/LeafletPreview.tsx:
Mark as a client component ('use client').
Props: leafletUrl: string.
Simply render an <img> tag with src={leafletUrl} and appropriate alt text.
Add a "Download Leaflet" button that creates an <a> tag with href={leafletUrl} and the download attribute set (e.g., download="your_leaflet.png").
Include basic Tailwind styling for a clean presentation of the image.
Key Considerations for the LLM:

Keep it minimal for MVP.
Ensure the download attribute is included for the button.
Phase 3: Backend API Routes & Logic Orchestration (for MVP)
Step 3.1: Initial Form Submission API Route (app/api/initial-form/route.ts)
Goal: Receive initial form data, create an OpenAI Assistant thread, and kick off the conversational agent.

Actions:

app/api/initial-form/route.ts:
Implement a POST handler using Next.js 14 App Router Route Handlers.
Receive formData from the request body.
User ID: For MVP, you can use a hardcoded userId or generate a simple unique ID (e.g., uuidv4() from uuid package) and set it in a session cookie. (Later, this comes from NextAuth.js).
Create OpenAI Thread: Call const thread = await assistantManager.createThread();.
Create Conversation Record:
TypeScript

const newConversation = await db.conversation.create({
    data: {
        userId: userId, // from session/dummy
        initialFormData: formData,
        threadId: thread.id,
        status: "gathering_info",
        history: [], // Initialize empty, Assistant's first message will be added
    },
});
Add Initial Message to Thread (for context): Call await assistantManager.addMessageToThread(thread.id, 'user', JSON.stringify(formData)); (or format as a natural language summary of the form data for the AI, e.g., "User started a new leaflet request with the following initial details: ...").
Start Assistant Run: Call const run = await assistantManager.runAssistant(thread.id, process.env.OPENAI_ASSISTANT_ID!);.
Poll for Initial Assistant Response: Implement a short polling loop to assistantManager.retrieveRun(thread.id, run.id) until the run is completed. Then, fetch assistantManager.getThreadMessages(thread.id) to get the Assistant's first response.
Update Conversation History: Add the Assistant's first message to newConversation.history in the database.
Return Response: Return NextResponse.json({ conversationId: newConversation.id, threadId: thread.id, initialAIResponse: latestAssistantMessage.content, status: newConversation.status }).
Key Considerations for the LLM:

Provide the full Route Handler code.
Show how to parse the request body.
Explain the creation of the Conversation record and the OpenAI thread.
Emphasize the importance of sending initialFormData to the Assistant thread for context.
Detail the initial run and polling to get the Assistant's very first message.
Step 3.2: Chat API Route (app/api/chat/route.ts)
Goal: Act as the primary API endpoint for real-time conversational interaction with the OpenAI Assistant, handling messages and tool calls.
Actions:
app/api/chat/route.ts:
Implement a POST handler.
Receive userMessage and conversationId from the request body.
User ID: Retrieve userId (from session/cookie).
Retrieve Conversation: Fetch the Conversation record from the database using conversationId to get threadId and current status.
Add User Message: Call await assistantManager.addMessageToThread(conversation.threadId!, 'user', userMessage);.
Start Assistant Run: Call let run = await assistantManager.runAssistant(conversation.threadId!, process.env.OPENAI_ASSISTANT_ID!);.
Polling Loop for Run Status & Tool Execution:
Implement a while (run.status === 'queued' || run.status === 'in_progress' || run.status === 'requires_action') loop.
Inside the loop:
Introduce a short delay (await new Promise(resolve => setTimeout(resolve, 500));).
Call run = await assistantManager.retrieveRun(conversation.threadId!, run.id);.
Handle requires_action (Tool Calls):
If run.status === 'requires_action', extract tool_calls from run.required_action.submit_tool_outputs.tool_calls.
Execute Tools: Iterate through each tool_call. Use a switch statement or if/else to match tool_call.function.name to your functions in app/lib/imageGenerationTools.ts (e.g., generateLeafletImageTool).
Parse tool_call.function.arguments (which are strings) into JavaScript objects using JSON.parse().
Call the appropriate imageGenerationTools function with the parsed arguments and userId.
Collect the results in an array of tool_outputs objects { tool_call_id: string; output: string | object }.
Submit Outputs: Call run = await assistantManager.submitToolOutputs(conversation.threadId!, run.id, toolOutputs);.
Crucial: After submitting tool outputs, a new run is implicitly created. The loop should continue to retrieveRun for this new run until it completes.
Update UI Status: If the Assistant indicates it's designing (e.g., via a specific message or if generateLeafletImageTool is called), update Conversation.status to 'designing' in the database and signal this to the frontend.
Handle completed:
If run.status === 'completed', retrieve all messages for the thread using assistantManager.getThreadMessages(conversation.threadId!).
Extract the latest Assistant message(s) (filter by role: 'assistant' and messages created during this specific run).
Update Conversation in DB:
Append new messages to history.
Update status (e.g., 'in_chat' for continued conversation, or 'completed' if a leafletUrl was set by the tool).
Update leafletUrl if available.
Return NextResponse.json({ messages: latestAssistantMessages, status: updatedConversation.status, leafletUrl: updatedConversation.leafletUrl }).
Handle failed:
If run.status === 'failed', log the error (run.last_error).
Update Conversation status to "failed".
Return a user-friendly error message to the frontend.
Key Considerations for the LLM:
Provide the full POST handler code for app/api/chat/route.ts.
This is the most complex part of the backend. Explain the polling mechanism and the requires_action loop in detail.
Emphasize correct parsing of tool arguments from strings.
Stress the importance of error handling and robust state updates.
Phase 4: Frontend UI Polish & Additional Features (The "Wow" Factor for MVP)
Step 4.1: Comprehensive Frontend State Management & Display
Goal: Create a smooth and informative user experience, integrating all pieces.

Actions:

app/page.tsx (Root Orchestration - Refined):
Refine useEffect for Session/Resumption: On component mount, check for conversationId in local storage. If found, make an API call to /api/chat?conversationId=... (this would be a new GET route handler in app/api/chat/route.ts to fetch existing conversation state without adding a new message) to fetch the existing Conversation state from the database and resume the UI state (messages, status, leafletUrl).
handleFormSubmit(formData): This function will be passed to InitialForm.tsx. It makes the POST request to /api/initial-form. On success, it updates conversationId, messages (with AI's initial response), conversationStatus to 'in_chat', and saves conversationId to local storage.
handleSendMessage(message): This function will be passed to ChatInterface.tsx. It makes the POST request to /api/chat. It updates local messages optimistically with user's message, then handles the response from the backend (updating messages, conversationStatus, leafletUrl).
Pass conversationId, messages, conversationStatus, leafletUrl, handleSendMessage as props to ChatInterface.
app/components/ChatInterface.tsx (Refined):
Auto-Scroll: Ensure useEffect with dependencies on messages correctly scrolls the chat window to the bottom.
Display AI Status: When status is 'designing', make the "Generating your leaflet..." message prominent.
Conditional Rendering of LeafletPreview: If status is 'completed' and leafletUrl is present in props, display LeafletPreview within the chat interface or clearly transition to it.
Key Considerations for the LLM:

Show how to manage the currentConversationStatus in app/page.tsx and how it dictates UI rendering.
Provide the handleFormSubmit and handleSendMessage callback functions.
Explain the useEffect hook for data fetching on mount and state updates for UI synchronization.
Step 4.2: User Authentication with NextAuth.js (for Multi-User MVP)
Goal: Implement basic user authentication to distinguish users and link their conversations. This is optional for a very barebones MVP, but highly recommended for any multi-user test.

Actions:

Install NextAuth.js: npm install next-auth @next-auth/prisma-adapter.
Prisma Schema Update: Add model Account, model Session, model User, model VerificationToken as defined by @next-auth/prisma-adapter to your prisma/schema.prisma. Run npx prisma migrate dev --name add_nextauth_models.
Auth Configuration (app/auth.ts):
Create app/auth.ts (or auth.config.ts depending on NextAuth.js v5 docs).
Define authOptions with at least one provider (e.g., CredentialsProvider for simple email/password, or GoogleProvider for quick setup).
Configure adapter to use PrismaAdapter(db).
Define session and jwt callbacks if you need to add custom data to the session (like conversationId or any user-specific identifiers).
Auth Route Handler (app/api/auth/[...nextauth]/route.ts):
Create this file. It will typically export authOptions (from app/auth.ts).
SessionProvider: Wrap your app/layout.tsx with SessionProvider (from next-auth/react) to make session available to client components.
Update API Routes (initial-form, chat):
Modify these routes to retrieve the authenticated session using getServerSession() (for Route Handlers).
Use session.user.id as userId when creating/updating Conversation records.
Implement basic login/logout buttons (e.g., in app/page.tsx or a header component).
Key Considerations for the LLM:

Provide the basic setup for NextAuth.js with a simple provider.
Emphasize the importance of NEXTAUTH_SECRET in .env.local for production.
Show how to get the user ID from session.user.id in server-side API routes.
Remind to update the Prisma schema and run migrations.