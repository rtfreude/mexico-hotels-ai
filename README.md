# Mexico Hotels AI - Affiliate Travel App with RAG

An intelligent hotel recommendation app for Mexico that uses AI-powered RAG (Retrieval-Augmented Generation) to provide personalized hotel suggestions based on user queries.

## Features

- 🤖 **AI-Powered Chat Interface**: Natural language queries for hotel recommendations
- 🔍 **Smart Search**: Vector-based semantic search using Pinecone and OpenAI embeddings
- 🏨 **Rich Hotel Data**: Curated collection of Mexico's best hotels with detailed information
- 💰 **Affiliate Integration**: Ready for Booking.com, Expedia, and Hotels.com affiliate links
- 🎨 **Beautiful UI**: React + Tailwind CSS with Mexico-themed design
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- Lucide React Icons
- React Hot Toast

### Backend
- Node.js + Express
- OpenAI API (GPT-4 + Embeddings)
- Pinecone Vector Database
- CORS, Helmet, Morgan

## Prerequisites

Before running this application, you need:

1. **Node.js** (v16 or higher)
2. **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)
3. **Pinecone API Key** - [Sign up for free](https://www.pinecone.io/)

## Setup Instructions

### 1. Clone the repository
```bash
cd mexico-hotels-ai
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Create a `.env` file and update with your API keys:
```bash
# Already created, just update the values:
OPENAI_API_KEY=your_actual_openai_api_key_here
PINECONE_API_KEY=your_actual_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment
```

Install dependencies:
```bash
npm install
```

Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Initialize Hotel Data (First Time Only)

Once both servers are running, you need to seed the vector database with hotel data:

1. Open your browser and go to `http://localhost:5173`
2. Open the browser console (F12)
3. Run this command to seed the database:
```javascript
fetch('http://localhost:5000/api/hotels/seed', { method: 'POST' })
  .then(res => res.json())
  .then(console.log)
```

This will embed and store all sample hotels in your Pinecone index.

## Usage

1. **Chat Interface**: Ask natural language questions like:
   - "Find me a beachfront resort in Cancun with a kids club"
   - "I want a romantic boutique hotel in Tulum"
   - "Show me all-inclusive resorts under $300/night"

2. **Search Bar**: Quick search for hotels by location or amenities

3. **Popular Searches**: Click on pre-defined popular searches for quick results

## Adding Affiliate Links

Update the affiliate IDs in the `.env` file:
```
BOOKING_AFFILIATE_ID=your_booking_affiliate_id
EXPEDIA_AFFILIATE_ID=your_expedia_affiliate_id
HOTELS_COM_AFFILIATE_ID=your_hotels_com_affiliate_id
```

Then update the affiliate links in `backend/data/sample-hotels.js`

## Project Structure

```
mexico-hotels-ai/
├── backend/
│   ├── routes/          # API routes
│   ├── services/        # Business logic (RAG service)
│   ├── data/           # Sample hotel data
│   ├── server.js       # Express server
│   └── .env            # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── App.jsx     # Main app component
│   │   └── index.css   # Tailwind styles
│   └── package.json
└── README.md
```

## Key Features Explained

### RAG Implementation
- Uses OpenAI's text-embedding-3-small model to create vector embeddings
- Stores embeddings in Pinecone for fast similarity search
- Retrieves relevant hotels based on semantic similarity
- Generates contextual responses using GPT-4

### Unique Differentiators
- **Mexico Specialization**: Deep focus on Mexican destinations
- **Conversational UX**: Natural language interface instead of traditional filters
- **Smart Matching**: AI understands context and preferences
- **Visual Design**: Mexico-themed colors and typography

## Future Enhancements

- [ ] User authentication and saved searches
- [ ] Real-time pricing integration
- [ ] Multi-language support (Spanish)
- [ ] WhatsApp/SMS integration
- [ ] Advanced filtering options
- [ ] Review aggregation
- [ ] Dynamic pricing predictions
- [ ] Mobile app version

## Troubleshooting

### Common Issues

1. **"Failed to get AI response"**
   - Check your OpenAI API key is valid
   - Ensure you have credits in your OpenAI account

2. **"Failed to search hotels"**
   - Verify Pinecone API key and environment
   - Make sure you've run the seed command

3. **CORS errors**
   - Ensure both frontend and backend are running
   - Check the FRONTEND_URL in backend .env file

## License

MIT

## Support

For questions or issues, please create an issue in the repository.

---

Built with ❤️ for Mexico travel enthusiasts
