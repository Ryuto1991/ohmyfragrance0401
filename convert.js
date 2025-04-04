const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = [
  'soap-bubble-daydream-new.png',
  'silent-pulse.png',
  'erina-grace.png',
  'eternal-smoke.png',
  'bloom-whisper.png'
];

async function convertImages() {
  for (const image of images) {
    const inputPath = path.join('public', 'images', image);
    const outputPath = path.join('public', 'images', image.replace('.png', '.webp'));
    
    try {
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Converted ${image} to WebP`);
    } catch (error) {
      console.error(`Error converting ${image}:`, error);
    }
  }
}

convertImages(); 