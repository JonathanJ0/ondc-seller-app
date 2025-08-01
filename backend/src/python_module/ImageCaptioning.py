import io
import logging
import aiohttp
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
import torch
from fastapi.middleware.cors import CORSMiddleware

# Set up logging for debugging and information
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app with a title
app = FastAPI(title="Product Image Captioning API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get API keys from environment variables
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Load BLIP model and processor for image captioning
try:
    logger.info("Loading BLIP model...")
    if not HUGGINGFACE_API_KEY:
        raise Exception("HUGGINGFACE_API_KEY environment variable is required")
    
    blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base", use_auth_token=HUGGINGFACE_API_KEY)
    blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base", use_auth_token=HUGGINGFACE_API_KEY)
    logger.info("BLIP model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load BLIP model: {str(e)}")
    raise Exception(f"BLIP model initialization failed: {str(e)}")

# Template for generating detailed product descriptions
PROMPT_TEMPLATE = """Based on the caption '{}', generate a detailed retail product description including color, material, size, and condition. Example: 'A vibrant red cotton T-shirt, size medium, in excellent condition.'"""

# API endpoint to generate captions from uploaded images
@app.post("/caption")
async def generate_caption(file: UploadFile = File(...)):
    try:
        # Validate that the uploaded file is an image
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

        # Read the image data from the uploaded file
        image_data = await file.read()
        # Open the image using PIL and convert to RGB
        image = Image.open(io.BytesIO(image_data)).convert("RGB")

        # Generate a caption using the BLIP model
        inputs = blip_processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = blip_model.generate(**inputs)
        # Decode the generated caption
        caption = blip_processor.decode(outputs[0], skip_special_tokens=True)

        # Enhance the caption using Groq API
        if not GROQ_API_KEY:
            # If no Groq API key, return just the original caption
            return {
                "original_caption": caption,
                "enhanced_caption": caption
            }
            
        prompt = PROMPT_TEMPLATE.format(caption)
        async with aiohttp.ClientSession() as session:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {GROQ_API_KEY}"
            }
            data = {
                "model": "meta-llama/llama-4-scout-17b-16e-instruct",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 200,
                "temperature": 0.8,
                "top_p": 0.9
            }
            async with session.post("https://api.groq.com/openai/v1/chat/completions", json=data, headers=headers) as response:
                if response.status != 200:
                    raise HTTPException(status_code=500, detail="Error calling Groq API")
                result = await response.json()
                enhanced_caption = result["choices"][0]["message"]["content"]

        # Return both the original and enhanced captions
        return {
            "original_caption": caption,
            "enhanced_caption": enhanced_caption
        }

    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

# Run the server for local testing if this script is executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 