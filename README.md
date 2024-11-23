# Basketball Train Tracker

A basketball-themed train tracking application for ASR Express (Train Number: 11057).

## Local Development Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows:
```bash
venv\Scripts\activate
```
- Unix/MacOS:
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
- Copy `.env.example` to `.env`
- Add your RapidAPI key to `.env`

5. Run the application:
```bash
flask run
```

The application will be available at `http://localhost:5000`

## Development Commands

- Run development server:
```bash
flask run
```

- Deploy to Vercel:
```bash
vercel deploy --prod
```

## Environment Variables

Required environment variables:
- `RAPIDAPI_KEY`: Your RapidAPI key
- `RAPIDAPI_HOST`: RapidAPI host (default: irctc1.p.rapidapi.com)

## API Endpoints

- `/`: Home page
- `/health`: Health check endpoint
- `/get_update`: Get real-time train updates

## Deployment

The application is deployed on Vercel. To deploy:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel deploy --prod
```

## Project Structure

```
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── static/            # Static files (CSS, JS)
├── templates/         # HTML templates
├── .env              # Environment variables
└── vercel.json       # Vercel configuration
```
