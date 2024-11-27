import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as base64 from 'base64-js';

@Injectable()
export class GroqService {
  private readonly groq;

  constructor() {
    // Initialize Groq SDK with your API key
    this.groq = new Groq({ apiKey: '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' });
  }

  async getMedicalDescription(keyword: string) {
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a medical expert. Respond to queries related to medical descriptions, diagnoses, treatments, and doctor's handwriting."
          },
          {
            role: "user",
            content: `Please provide a detailed explanation for the medical description: ${keyword}`,
          },
        ],
        model: "llama3-8b-8192",
      });

      return chatCompletion.choices[0]?.message?.content || 'No content';
    } catch (error) {
      console.error('Error fetching Groq completion:', error);
      throw new Error('Failed to fetch Groq completion');
    }
  }

  async processImage(imagePath: string) {
    try {
      const base64Image = this.encodeImageToBase64(imagePath);

      // Step 1: Call Groq's image recognition API
      const imageRecognitionResponse = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a medical expert. Focus on identifying and describing medical-related content in images, especially doctor's handwriting. Ignore backgrounds or irrelevant objects."
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: "What's the medical description in this image?" },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        model: 'llava-v1.5-7b-4096-preview', // Use the appropriate model for image recognition
      });

      const description = imageRecognitionResponse.choices[0]?.message?.content || 'No description';

      // Step 2: Call Chat Completion API with the extracted keyword to get the detailed medical description
      const detailedDescription = await this.getMedicalDescription(description);

      // Clean up the uploaded image file
      fs.unlinkSync(imagePath);

      // Return both the description and the detailed medical description to the client
      return {
        description,
        detailedDescription,
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }

  // Helper function to convert an image file to base64
  private encodeImageToBase64(imagePath: string): string {
    const imageBuffer = fs.readFileSync(path.resolve(imagePath));
    return imageBuffer.toString('base64');
  }
}