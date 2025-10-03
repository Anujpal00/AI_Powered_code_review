# TODO: Add Code Generation Chatbot Feature

## Backend Updates
- [x] Update `Backend/src/models/user.model.js`: Add `type`, `query`, `language`, `generatedCode`, `explanation` to `historySchema` for flexible history storage (supports both review and codegen).
- [x] Add `generateCode` function in `Backend/src/controllers/ai.controller.js`: Handle POST input (problem, language), build Gemini prompt for code + explanation, parse JSON response.
- [x] Add new route in `Backend/src/routes/ai.route.js`: POST `/generate-code` with auth middleware.
- [x] Update `Backend/src/controllers/history.controller.js`: Modify `addHistory` to store codegen entries (type: 'codegen', query, language, generatedCode, explanation).

## Frontend Updates
- [x] Update `Frontend/src/App.jsx`: Add states for tab switching, chat messages, problem input, language select. Implement tab UI, codegen form, generateCode API call, chat display with syntax highlighting and copy button. Integrate codegen history filtering/display.
- [x] Update `Frontend/src/App.css`: Add CSS for tabs, chat interface, message bubbles, code blocks, copy button.

## Followup Steps
- [x] Install missing dependencies if needed (e.g., `react-syntax-highlighter` in Frontend/).
- [x] Test backend: Run server, test new endpoint with Postman, verify MongoDB storage.
- [x] Test frontend: Run dev server, login, test codegen tab, chat, history, copy functionality.
- [x] Handle edge cases: Invalid inputs, API errors, language support (any language via Gemini).
