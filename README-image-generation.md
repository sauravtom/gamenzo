# Game Image Generator

This script generates images for all games listed in `data/index.ts` using the Replicate API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your Replicate API token:
```bash
export REPLICATE_API_TOKEN="your_api_token_here"
```

Or create a `.env` file:
```
REPLICATE_API_TOKEN=your_api_token_here
```

## Usage

Run the image generation script:
```bash
npm run generate-images
```

## What it does

- Reads all games from `data/index.ts`
- Generates appropriate prompts based on game name and category
- Creates images using the Replicate Flux model
- Saves images to `public/games/` folder with the correct filenames
- Includes a 2-second delay between requests to avoid rate limiting

## Categories and Prompts

The script generates different prompts based on game categories:
- **RPG**: Fantasy medieval game cover art with mystical elements
- **Racing**: High-speed racing game cover with sleek cars and dynamic tracks
- **Action**: Intense action game cover with explosions and combat scenes
- **Adventure**: Adventure exploration game cover with vast landscapes
- **Platformer**: Colorful platformer game cover with jumping characters

## Output

Images are saved as 512x512 JPG files in the `public/games/` directory, matching the paths specified in your data file.

## Note

Make sure you have sufficient Replicate API credits as this will generate 15 images total. 