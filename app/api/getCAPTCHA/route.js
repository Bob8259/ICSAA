import { createCanvas, Image } from "canvas";
import header from "@/app/content/header.json";
import { connectToDB } from "@/app/lib/db";
import { imageArray } from "@/app/lib/CAPTCHAimage";
import { backGroundImage } from "@/app/lib/backGroundImage";
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: header,
  });
}

export async function GET() {
  const canvas = createCanvas(350, 140);
  const context = canvas.getContext("2d");
  // addGradientBackground(canvas);
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const backGroundImg = new Image();
  backGroundImg.onload = function () {
    context.drawImage(backGroundImg, 0, 0, canvasWidth, canvasHeight);
  };
  let imageNumber = Math.floor(Math.random() * backGroundImage.length);
  // imageNumber = 1;
  backGroundImg.src = backGroundImage[imageNumber];
  let answer = "";

  const img = new Image();
  let i;

  img.onload = function () {
    let x, y, width, height;
    context.setTransform(
      Math.random() * 0.1 + 0.9,
      Math.random() * 0.1,
      Math.random() * 0.1,
      Math.random() * 0.1 + 0.9,
      Math.random() * 0.1,
      Math.random() * 0.1
    );
    x = canvasWidth * 0.172 * i;
    y = canvasHeight * 0.1 + Math.random() * canvasHeight * 0.1;
    width = canvasWidth * 0.15 + Math.random() * canvasWidth * 0.05;
    height = canvasHeight * 0.43 + Math.random() * canvasHeight * 0.15;
    context.drawImage(img, x, y, width, height);

    context.setTransform(1, 0, 0, 1, 0, 0);
  };

  for (i = 0; i < 6; i++) {
    let data = imageArray[Math.floor(Math.random() * imageArray.length)];
    answer += data.split("splitNotation")[0];
    img.src = data.split("splitNotation")[1];
  }

  adjustGlobalContrast(canvas, 2);
  addMosaicToCanvas(canvas, 2, 0, 0, canvasWidth, canvasHeight);
  drawDistraction(canvas);
  applyGaussianNoise(canvas, 30, 0, 0, canvasWidth, canvasHeight);

  if (imageNumber === 0) {
    applyGaussianNoise(canvas, 36, 0, 0, canvasWidth, canvasHeight);
  } else if (imageNumber === 1) {
    applyGaussianNoise(canvas, 18, 0, 0, canvasWidth, canvasHeight);
  }

  applyBlurToCanvas(canvas, 1);

  // Convert the canvas to a DataURL, which is base64
  let imageSrc = canvas.toDataURL("image/jpeg", 0.2);
  const db = await connectToDB();
  try {
    const currentTimestamp = Date.now();
    const thresholdTimestamp = currentTimestamp - 180 * 1000; //set expire data(second)
    const filter = { createdAt: { $lt: thresholdTimestamp } };
    await db.collection("CAPTCHA").deleteMany(filter);
    let result = await db
      .collection("CAPTCHA")
      .find()
      .project({
        _id: 0,
        answer: 0,
        createdAt: 0,
      })
      .toArray();
    let randomId = Math.floor(Math.random() * 1e10);
    while (result.includes(randomId)) {
      randomId = Math.floor(Math.random() * 1e10);
    }
    const body = {};
    body.cId = randomId;
    body.answer = answer.toLowerCase();
    body.createdAt = Date.now();
    await db.collection("CAPTCHA").insertOne(body);
    imageSrc = "id " + randomId + "splitNotation " + imageSrc;
    return new Response(imageSrc, {
      status: 200,
      headers: header,
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
      headers: header,
    });
  } finally {
    await db.client.close();
  }
}

function applyGaussianNoise(canvas, noiseStrength, x, y, width, height) {
  let ctx = canvas.getContext("2d");
  // Use Math.ceil to ensure the values are integers
  let xCeil = Math.ceil(x);
  let yCeil = Math.ceil(y);
  let widthCeil = Math.ceil(width);
  let heightCeil = Math.ceil(height);

  // Get the imageData for the specified area
  let imageData = ctx.getImageData(xCeil, yCeil, widthCeil, heightCeil);
  let data = imageData.data;
  let noise;

  for (let i = 0; i < data.length; i += 4) {
    // Generate Gaussian noise
    noise = gaussianRandom() * noiseStrength;

    // Apply the noise to RGB channels within the specified area
    data[i] += noise; // Red
    data[i + 1] += noise; // Green
    data[i + 2] += noise; // Blue
  }

  // Put the modified imageData back onto the canvas
  ctx.putImageData(imageData, xCeil, yCeil);
}

// Helper function to generate Gaussian random numbers
function gaussianRandom() {
  let rand = 0;

  for (let i = 0; i < 6; i += 1) {
    rand += Math.random();
  }

  // Subtracting 3 to center the distribution at 0
  // Multiplying by the standard deviation, square root of 2
  return (rand - 3) * Math.sqrt(2);
}

function applyBlurToCanvas(canvas, blurLevel) {
  const context = canvas.getContext("2d");
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const radius = Math.floor(blurLevel); // Ensure an integer radius

  // Apply Gaussian blur to each pixel
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      let rTotal = 0;
      let gTotal = 0;
      let bTotal = 0;
      let pixelCount = 0;

      for (let j = -radius; j <= radius; j++) {
        for (let i = -radius; i <= radius; i++) {
          const px = x + i;
          const py = y + j;

          if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
            const index = (py * canvas.width + px) * 4;
            rTotal += pixels[index];
            gTotal += pixels[index + 1];
            bTotal += pixels[index + 2];
            pixelCount++;
          }
        }
      }

      const pixelIndex = (y * canvas.width + x) * 4;
      pixels[pixelIndex] = rTotal / pixelCount;
      pixels[pixelIndex + 1] = gTotal / pixelCount;
      pixels[pixelIndex + 2] = bTotal / pixelCount;
    }
  }

  context.putImageData(imageData, 0, 0);
}

function drawDistraction(canvas) {
  const context = canvas.getContext("2d");
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const ratio = (canvasWidth / 500) * 1;
  const lineWidth = 6;
  drawRandomNoise();
  drawRandomLines(1, false);
  drawRandomLines(1, true);
  // drawRandomRectangles(1);
  // drawRandomEllipses(1);
  // drawRandomCurves(4);
  // drawRandomTriangles(1);
  drawRamdonDots(40);
  function getRandomPosition(max) {
    return Math.floor(Math.random() * max);
  }

  function drawRandomRectangles(numRectangles) {
    for (let i = 0; i < numRectangles; i++) {
      const x =
        (canvasWidth / numRectangles) * i + Math.random() * canvasWidth * 0.2;
      const y = canvasHeight * 0.002 + Math.random() * canvasHeight * 0.6;
      const width = canvasWidth * 0.2 + Math.random() * canvasWidth * 0.5;
      const height = canvasHeight * 0.2 + Math.random() * canvasHeight * 0.5;
      context.strokeStyle = getRandomColor(90);
      context.lineWidth = lineWidth;
      context.strokeRect(x, y, width, height);
    }
  }

  function drawRandomEllipses(numEllipses) {
    for (let i = 0; i < numEllipses; i++) {
      const x =
        (canvasWidth / numEllipses) * i + Math.random() * canvasWidth * 0.2;
      const y = canvasHeight * 0.4 + Math.random() * canvasHeight * 0.3;
      const radiusX = canvasWidth * 0.2 + Math.random() * canvasWidth * 0.1;
      const radiusY = canvasHeight * 0.2 + Math.random() * canvasHeight * 0.1;
      const rotation = Math.random() * 2 * Math.PI; // Random rotation
      context.strokeStyle = getRandomColor(90);
      context.lineWidth = lineWidth;
      context.beginPath();
      context.ellipse(x, y, radiusX, radiusY, rotation, 0, 2 * Math.PI);
      context.stroke();
    }
  }

  function drawRandomNoise() {
    let distance = 25,
      r = 5;
    for (let i = 0; i < canvasWidth; i += distance - Math.random() * r) {
      for (let j = 0; j < canvasHeight; j += distance - Math.random() * r) {
        // Create a linear gradient
        // The gradient will start at the top-left corner of the square and end at the bottom-right corner
        let gradient = context.createLinearGradient(
          i,
          j,
          i + 20 * ratio,
          j + 20 * ratio
        );

        // Add two color stops with random colors
        gradient.addColorStop(0, getRandomDardColor(80));
        gradient.addColorStop(1, getRandomDardColor(80));

        // Set the fill style to the gradient
        context.fillStyle = gradient;

        context.lineWidth = 1;
        context.setTransform(
          Math.random() * 0.1 + 0.9,
          Math.random() * 0.1,
          Math.random() * 0.1,
          Math.random() * 0.1 + 0.9,
          Math.random() * 0.1,
          Math.random() * 0.1
        );
        context.fillRect(i, j, 8 * ratio, 8 * ratio);
        context.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
  }

  function drawRandomTriangles(numTriangles) {
    for (let i = 0; i < numTriangles; i++) {
      const x1 =
        (canvasWidth / numTriangles) * i + Math.random() * canvasWidth * 0.2;
      const y1 = getRandomPosition(canvasHeight);
      let x2 = getRandomPosition(canvasWidth);
      let y2 = getRandomPosition(canvasHeight);
      while (
        (x2 - x1) ** 2 + (y2 - y1) ** 2 < 3600 ||
        (x2 - x1) ** 2 + (y2 - y1) ** 2 > 10000
      ) {
        x2 = getRandomPosition(canvasWidth);
        y2 = getRandomPosition(canvasHeight);
      }
      let x3 = getRandomPosition(canvasWidth);
      let y3 = getRandomPosition(canvasHeight);
      while (
        (x3 - x1) ** 2 + (y3 - y1) ** 2 < 3600 ||
        (x3 - x1) ** 2 + (y3 - y1) ** 2 > 10000 ||
        (x3 - x2) ** 2 + (y3 - y2) ** 2 < 3600 ||
        (x3 - x2) ** 2 + (y3 - y2) ** 2 > 10000
      ) {
        x3 = getRandomPosition(canvasWidth);
        y3 = getRandomPosition(canvasHeight);
      }

      context.strokeStyle = getRandomColor(90);
      context.lineWidth = lineWidth;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.lineTo(x3, y3);
      context.closePath();
      context.stroke();
    }
  }

  function drawRandomCurves(numCurves) {
    for (let i = 0; i < numCurves; i++) {
      //add some random curves
      context.beginPath();
      context.moveTo(Math.random() * 20, Math.random() * 200);
      for (let j = 0; j <= 5; j++) {
        const curveX =
          (canvasWidth / 4) * (j - 1) + Math.random() * canvasWidth * 0.2;

        const curveY = canvasHeight * Math.random();
        const endX =
          (canvasWidth / 4) * (j - 1) + Math.random() * canvasWidth * 0.2;
        const endY = canvasHeight * Math.random();
        context.bezierCurveTo(
          curveX,
          curveY,
          curveX + 5 + Math.random() * 100,
          curveY + 5 + Math.random() * 100,
          curveX + 5 + Math.random() * 100,
          curveY + 5 + Math.random() * 100,
          endX,
          endY
        );
      }
      context.lineWidth = lineWidth;
      context.strokeStyle = getRandomColor(40);
      context.setTransform(
        Math.random() * 0.12 + 0.88,
        Math.random() * 0.3,
        Math.random() * 0.3,
        Math.random() * 0.15 + 0.85,
        Math.random() * 0.3,
        Math.random() * 0.25
      );
      context.stroke();
      context.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  function drawRandomLines(numLines, direction) {
    for (let i = 0; i < numLines; i++) {
      // Start a new path for the random lines
      context.beginPath();

      // Determine the direction of the line
      // let direction = Math.random() > 0.5;

      // Calculate start and end points for the line
      let startX = -Math.random() * canvasWidth * 0.05;
      let startY = direction
        ? -Math.random() * canvasHeight * 0.5 + canvasHeight * 0.1
        : canvasHeight * 0.6 + Math.random() * canvasHeight * 0.6;
      let endX = Math.random() * canvasWidth * 0.1 + canvasWidth * 1;
      let endY = direction
        ? -Math.random() * canvasHeight * 0.5 + canvasHeight * 0.1
        : canvasHeight * 0.6 + Math.random() * canvasHeight * 0.6;

      // Create a linear gradient for the line
      let gradient = context.createLinearGradient(startX, startY, endX, endY);

      // Add color stops to the gradient
      const n = 10;
      for (let k = 0; k < n; k++) {
        gradient.addColorStop(k / (n - 1), getRandomDardColor(50));
      }
      // Set the stroke style to the gradient
      context.strokeStyle = gradient;
      context.lineWidth = lineWidth;

      // Draw the line with the gradient
      context.moveTo(startX, startY);
      context.lineTo(
        Math.random() * canvasWidth * 0.4 + canvasWidth * 0.15,
        direction
          ? canvasHeight * 0.8 + Math.random() * canvasHeight * 0.4
          : -Math.random() * canvasHeight * 0.2 + canvasHeight * 0.1
      );
      context.lineTo(
        Math.random() * canvasWidth * 0.4 + canvasWidth * 0.3,
        direction
          ? -Math.random() * canvasHeight * 0.2 + canvasHeight * 0.1
          : canvasHeight * 0.8 + Math.random() * canvasHeight * 0.4
      );
      context.lineTo(
        Math.random() * canvasWidth * 0.4 + canvasWidth * 0.55,
        direction
          ? canvasHeight * 0.8 + Math.random() * canvasHeight * 0.4
          : -Math.random() * canvasHeight * 0.2 + canvasHeight * 0.1
      );
      context.lineTo(endX, endY);

      // Stroke the path
      context.stroke();
    }
  }

  function drawRamdonDots(numDots) {
    for (let i = 0; i < numDots; i++) {
      //add some dots
      const dotSize = (2 + Math.random() * 4) * ratio;
      context.fillStyle = getRandomColor(0);
      context.beginPath();
      context.arc(
        Math.random() * canvasWidth,
        Math.random() * canvasHeight,
        dotSize,
        0,
        2 * Math.PI
      );
      context.fill();
    }
  }
}

function adjustGlobalContrast(canvas, contrast) {
  const context = canvas.getContext("2d");
  // Get the image data
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  // Adjust contrast globally
  for (let i = 0; i < data.length; i += 4) {
    // R, G, and B values
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Adjust each color channel based on contrast
    data[i] = (r - 128) * contrast + 128;
    data[i + 1] = (g - 128) * contrast + 128;
    data[i + 2] = (b - 128) * contrast + 128;
  }
  // Put the modified image data back on the canvas
  context.putImageData(imageData, 0, 0);
}

function getRandomLightColor() {
  // Generate random values for red, green, and blue components
  const c = 120;
  const red = Math.floor(Math.random() * (256 - c)) + c;
  const green = Math.floor(Math.random() * (256 - c)) + c;
  const blue = Math.floor(Math.random() * (256 - c)) + c;
  // Convert the components to a CSS-compatible color string
  const color = "rgb(" + red + "," + green + "," + blue + ")";
  return color;
}
function getRandomColor(c) {
  // Generate random values for red, green, and blue components
  const red = Math.floor(Math.random() * (256 - c)) + c;
  const green = Math.floor(Math.random() * (256 - c)) + c;
  const blue = Math.floor(Math.random() * (256 - c)) + c;
  // Convert the components to a CSS-compatible color string
  const color = "rgb(" + red + "," + green + "," + blue + ")";
  return color;
}

function getRandomDardColor(c) {
  // Generate random values for red, green, and blue components
  const red = Math.floor(Math.random() * (256 - c));
  const green = Math.floor(Math.random() * (256 - c));
  const blue = Math.floor(Math.random() * (256 - c));
  // Convert the components to a CSS-compatible color string
  const color = "rgb(" + red + "," + green + "," + blue + ")";
  return color;
}

function addMosaicToCanvas(
  canvas,
  strength,
  startX,
  startY,
  areaWidth,
  areaHeight
) {
  if (strength <= 0) {
    console.warn("Strength must be a positive number. Defaulting to 10.");
    strength = 10; // Default strength to 10 if an invalid strength is provided
  }

  const ctx = canvas.getContext("2d");

  // Clamp the area to the canvas dimensions
  startX = Math.floor(Math.max(0, startX));
  startY = Math.floor(Math.max(0, startY));
  areaWidth = Math.floor(Math.min(canvas.width, startX + areaWidth) - startX);
  areaHeight = Math.floor(
    Math.min(canvas.height, startY + areaHeight) - startY
  );

  // Get the image data from the context of the canvas for the specified area
  const imageData = ctx.getImageData(startX, startY, areaWidth, areaHeight);
  const data = imageData.data;

  // Apply the mosaic effect only within the specified area
  for (let y = 0; y < areaHeight; y += strength) {
    for (let x = 0; x < areaWidth; x += strength) {
      const red = data[(areaWidth * y + x) * 4];
      const green = data[(areaWidth * y + x) * 4 + 1];
      const blue = data[(areaWidth * y + x) * 4 + 2];

      // Now loop over the pixels in the block and set them to the average color
      for (let n = 0; n < strength; n++) {
        for (let m = 0; m < strength; m++) {
          if (x + m < areaWidth && y + n < areaHeight) {
            // Calculate the index in the array
            const index = (areaWidth * (y + n) + (x + m)) * 4;
            data[index] = red;
            data[index + 1] = green;
            data[index + 2] = blue;
          }
        }
      }
    }
  }

  // Put the modified image data back onto the canvas
  ctx.putImageData(imageData, startX, startY);
}
