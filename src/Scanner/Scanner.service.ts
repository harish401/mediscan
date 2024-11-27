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
  async getChatCompletion(keyword: string) {
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
            {
              role: "system",
              content: `
                You are a medical expert specializing in analyzing doctor prescriptions. 
                Your responsibilities include:
                1. Recognizing and extracting text from uploaded prescriptions, especially handwritten notes.
                2. Identifying medicine names mentioned in the prescription.
                3. Providing detailed explanations for each medicine, including its purpose, recommended dosage, and potential side effects.
                If the text is unclear or the medicine name is not identifiable, suggest consulting a healthcare professional.
              `,
            },
            {
              role: "user",
              content: `
                Here is a medical prescription detail or keyword extracted from a user's upload: ${keyword}.
                Please:
                1. Highlight any identified medicine names.
                2. Provide a detailed explanation for each identified medicine, covering its purpose, dosage, and side effects.
                3. If no medicines are identified, provide guidance to consult with a doctor or pharmacist for clarification.
              `,
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
          // {
          //   role: "system",
          //   content: "You are a culinary expert. Only focus on identifying food items in images. Ignore backgrounds or irrelevant objects."
          // },
      
          {
            role: 'user',
            content: [
              { type: 'text', text: "What's in this image?" },
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

 

      // Step 3: Call Chat Completion API with the extracted keyword to get the recipe
      const recipe = await this.getChatCompletion(description);

      // Clean up the uploaded image file
      fs.unlinkSync(imagePath);

      // Return both the description and the recipe to the client
      return {
        description,
        recipe,
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